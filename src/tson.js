export class TSONParser {
  constructor() {
    this.lines = [];
    this.lineIndex = 0;
    this.contextStack = [];
    this.errors = [];
    this.result = {};
  }
  parse(text) {
    this._reset(text);

    // Handle root-level JSON arrays and objects
    const trimmedText = text.trim();
    if (trimmedText.startsWith('[') || trimmedText.startsWith('{')) {
      try {
        // Try parsing as JSON first
        return JSON.parse(text);
      } catch (e) {
        // Fall back to TSON parsing
      }
    }

    while (this.lineIndex < this.lines.length) {
      const line = this.lines[this.lineIndex];
      const trimmed = line.trim();
      const indent = line.match(/^\s*/)[0].length;

      if (!trimmed || trimmed.startsWith("#")) {
        this.lineIndex++;
        continue;
      }      if (trimmed === "}" || trimmed === "]") {
        if (this.contextStack.length > 1) {
          const ctx = this._currentContext();
          // Handle completion of typed blocks
          if (ctx && ctx.type) {
            // For text blocks, make sure we don't treat content lines as errors
            if (ctx.type !== "text") {
              this._finalizeTypedBlock(ctx);
            }
          }
          this.contextStack.pop();
        } else {
          this.errors.push(`Unexpected closing brace at line ${this.lineIndex + 1}`);
        }
        this.lineIndex++;
        continue;      }      // FIXED: Always check indentation context before processing any line
      this._adjustContextStack(indent);

      // FIXED: Check current context to determine how to process the line
      const currentContext = this._currentContext();
      const isInTypedBlock = currentContext && currentContext.type;
      
      if (trimmed.includes(":") && !isInTypedBlock) {
        // Handle comma-separated pairs on the same line (JSON style) - only when NOT in a typed block
        const pairs = this._splitPairs(trimmed);
        for (const pair of pairs) {
          const splitResult = pair.split(/:(.+)/);
          const key = splitResult[0]?.trim() || '';
          const rest = splitResult[1]?.trim() || '';
          this._processKeyValue(key, rest, indent);
        }
      } else {
        // Send to continuation handler (for array content, table content, or regular indented objects)
        this._processContinuation(indent, trimmed);
      }this.lineIndex++;
    }

    // Finalize any remaining typed blocks at end of file
    while (this.contextStack.length > 1) {
      const ctx = this._currentContext();
      if (ctx && ctx.type) {
        this._finalizeTypedBlock(ctx);
      }
      this.contextStack.pop();
    }

    return this.errors.length ? null : this.result;
  }

  check(text) {
    this.parse(text);
    return this.errors;
  }
  _reset(text) {
    this.lines = text.replace(/\r\n/g, "\n").split("\n");
    this.lineIndex = 0;
    this.result = {};
    this.contextStack = [{ indent: -1, key: null, value: this.result }];
    this.errors = [];
  }
  _processKeyValue(key, rest, indent) {
    const currentContext = this._currentContext();
    if (!currentContext || !currentContext.value) {
      this.errors.push(`Invalid context at line ${this.lineIndex + 1}`);
      return;
    }    // Handle quoted keys (JSON compatibility)
    const cleanKey = this._cleanKey(key);

    // Check if rest is undefined or empty - this indicates an indented block
    if (rest === undefined || rest === null || rest.trim() === "") {
      // This is the start of an indented object block
      const newObj = {};
      currentContext.value[cleanKey] = newObj;
      this.contextStack.push({ indent, key: cleanKey, value: newObj, indentedObject: true });
      return;
    }

    if (rest === "{") {
      const newObj = {};
      currentContext.value[cleanKey] = newObj;
      this.contextStack.push({ indent, key: cleanKey, value: newObj });
    } else if (rest.startsWith("[") && rest.endsWith("]")) {
      // Handle JSON-style square bracket arrays
      const arrayContent = rest.slice(1, -1).trim();
      if (arrayContent === "") {
        // Empty array
        currentContext.value[cleanKey] = [];
      } else {
        // Parse array content
        const items = this._parseArrayContent(arrayContent);
        currentContext.value[cleanKey] = items;
      }    } else if (/^(array|table|maptable|matrix|text)/.test(rest.trim())) {
      const trimmedRest = rest.trim();
      const match = trimmedRest.match(/^(array|table|maptable|matrix|text)(\s*\{\s*\}|\s*\{)?(.*)$/);
      const type = match[1];
      const bracepart = match[2] || "";
      const remainder = match[3] || "";
      
      if (bracepart === " {}" || bracepart.trim() === "{}") {
        // Handle empty structures
        if (type === "array") {
          currentContext.value[cleanKey] = [];
        } else if (type === "text") {
          currentContext.value[cleanKey] = "";
        } else {
          currentContext.value[cleanKey] = {};
        }
      } else if (bracepart.includes("{") && remainder.trim() === "") {
        // Handle non-empty structures with opening brace
        if (type === "array") {
          currentContext.value[cleanKey] = [];
          this.contextStack.push({ indent, key: cleanKey, value: currentContext.value, type, rows: [], headers: null, targetKey: cleanKey });
        } else if (type === "text") {
          currentContext.value[cleanKey] = "";
          this.contextStack.push({ indent, key: cleanKey, value: currentContext.value, type, targetKey: cleanKey, isTextBlock: true });
        } else {
          currentContext.value[cleanKey] = {};
          this.contextStack.push({ indent, key: cleanKey, value: currentContext.value, type, rows: [], headers: null, targetKey: cleanKey });
        }      } else if (bracepart === "" && remainder.trim() === "") {
        // Handle indented blocks without braces (table, maptable, matrix, array only)
        // Text blocks always require braces to avoid ambiguity with colons
        if (type === "text") {
          this.errors.push(`Text blocks require braces: use 'text { ... }' at line ${this.lineIndex + 1}`);
          return;
        } else if (type === "array") {
          currentContext.value[cleanKey] = [];
          this.contextStack.push({ indent, key: cleanKey, value: currentContext.value, type, rows: [], headers: null, targetKey: cleanKey, indentedBlock: true });
        } else {
          currentContext.value[cleanKey] = {};
          this.contextStack.push({ indent, key: cleanKey, value: currentContext.value, type, rows: [], headers: null, targetKey: cleanKey, indentedBlock: true });
        }
      } else {
        // Handle inline structures like "array { 100, 70 }"
        if (type === "array" && remainder.trim()) {
          const items = remainder.replace(/[{}]/g, "").split(/[\s,]+/).filter(Boolean);
          currentContext.value[cleanKey] = items.map(this._autoConvert.bind(this));
        } else {
          // Default case - treat as regular value
          currentContext.value[cleanKey] = this._autoConvert(rest);
        }
      }
    } else if (rest === "{}") {
      // Empty object
      currentContext.value[cleanKey] = {};    } else {
      // Clean value (remove trailing commas for JSON compatibility)
      const cleanValue = rest.replace(/,\s*$/, '');
      currentContext.value[cleanKey] = this._autoConvert(cleanValue);
    }
  }  _processContinuation(indent, trimmed) {
    const ctx = this._currentContext();
    if (!ctx) {
      this.errors.push(`No valid context at line ${this.lineIndex + 1}`);
      return;
    }
    
    const type = ctx.type;

    // Handle non-typed contexts (regular objects)
    if (!type || ctx.indentedObject) {
      // Process this line in the correct context
      if (trimmed && trimmed.includes(":")) {
        const pairs = this._splitPairs(trimmed);
        for (const pair of pairs) {
          const splitResult = pair.split(/:(.+)/);
          const key = splitResult[0]?.trim() || '';
          const rest = splitResult[1]?.trim() || '';
          this._processKeyValue(key, rest, indent);
        }
        return;
      }
      return;
    }

    if (type === "text") {
      const currentText = ctx.value[ctx.targetKey] || "";
      ctx.value[ctx.targetKey] = currentText + (currentText ? "\n" : "") + trimmed;
      return;
    }

    if (type === "array") {
      ctx.value[ctx.targetKey].push(this._autoConvert(trimmed));
      return;
    }    // Handle table/matrix/maptable data
    const line = trimmed.replace(/;$/, "");
    const cells = this._splitCells(line);    if (type === "matrix") {
      // Matrix has no headers, all rows are data
      if (cells.length > 0) {
        ctx.rows.push(cells);
      }
    } else if (!ctx.headers) {
      // Table and maptable have headers
      ctx.headers = cells;
    } else if (cells.length > 0) {
      ctx.rows.push(cells);
    }    // Check if this is the end of the block
    const nextLine = this.lines[this.lineIndex + 1];
    const nextTrimmed = nextLine ? nextLine.trim() : "";
    const nextIndent = nextLine ? nextLine.match(/^\s*/)[0].length : 0;
    
    let blockEnd = false;
    
    if (ctx.indentedBlock) {
      // For indented blocks, end when indentation decreases or at end of file
      blockEnd = !nextLine || 
                 nextTrimmed === "" ||
                 nextTrimmed.startsWith("#") ||
                 nextIndent <= ctx.indent;
    } else {
      // For braced blocks, end at closing brace or explicit markers
      blockEnd = !nextLine || 
                 nextTrimmed === "}" || 
                 nextTrimmed === "]" ||
                 (nextLine && nextTrimmed && !nextLine.startsWith(" ") && !nextLine.startsWith("\t") && nextTrimmed.length > 0 && !nextTrimmed.startsWith("#"));
    }if (blockEnd && ((ctx.headers && !ctx.isTextBlock) || (type === "matrix" && ctx.rows.length > 0))) {
      this._finalizeTypedBlock(ctx);
      // Don't pop context here - let the closing brace or natural end handle it
    }
  }
  _currentContext() {
    if (this.contextStack.length === 0) {
      return null;
    }
    return this.contextStack[this.contextStack.length - 1];
  }  _autoConvert(value) {
    if (value === undefined || value === null) return null;
    
    const trimmed = value.trim();
    
    // ENHANCED: Handle JSON objects and arrays
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        // Try to parse as standard JSON first
        return JSON.parse(trimmed);
      } catch (e) {
        // If that fails, try to parse TSON-style unquoted keys
        return this._parseTSONObject(trimmed);
      }
    }
    
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        return JSON.parse(trimmed);
      } catch (e) {
        // Could add TSON-style array parsing here if needed
        return trimmed; // Fall back to string
      }
    }
    
    // Handle quoted strings (JSON compatibility)
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || 
        (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
      return trimmed.slice(1, -1);
    }
    
    // Handle boolean and null literals
    if (trimmed === "null") return null;
    if (trimmed === "true") return true;
    if (trimmed === "false") return false;
    
    // Handle numbers
    const num = Number(trimmed);
    if (!isNaN(num) && isFinite(num)) return num;
    
    return trimmed;
  }
  _cleanKey(key) {
    // Remove quotes from keys (JSON compatibility)
    if ((key.startsWith('"') && key.endsWith('"')) || 
        (key.startsWith("'") && key.endsWith("'"))) {
      return key.slice(1, -1);
    }
    // Remove trailing colon if present (for indented syntax)
    if (key.endsWith(':')) {
      return key.slice(0, -1);
    }
    return key;
  }
  _parseArrayContent(content) {
    // Parse JSON-style array content
    const items = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';
    let depth = 0;
    
    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      
      if (!inQuotes && (char === '"' || char === "'")) {
        inQuotes = true;
        quoteChar = char;
        current += char;
      } else if (inQuotes && char === quoteChar) {
        inQuotes = false;
        current += char;
      } else if (!inQuotes && (char === '{' || char === '[')) {
        depth++;
        current += char;
      } else if (!inQuotes && (char === '}' || char === ']')) {
        depth--;
        current += char;
      } else if (!inQuotes && char === ',' && depth === 0) {
        if (current.trim()) {
          items.push(this._parseValue(current.trim()));
        }
        current = '';
      } else {
        current += char;
      }
    }
    
    if (current.trim()) {
      items.push(this._parseValue(current.trim()));
    }
    
    return items;
  }

  _parseValue(value) {
    const trimmed = value.trim();
    
    // Handle nested JSON arrays
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const content = trimmed.slice(1, -1).trim();
      if (content === "") return [];
      return this._parseArrayContent(content);
    }
    
    // Handle nested JSON objects
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        return JSON.parse(trimmed);
      } catch (e) {
        // Fall back to auto convert
        return this._autoConvert(trimmed);
      }
    }
    
    return this._autoConvert(trimmed);
  }

  _splitPairs(line) {
    // Split a line into key-value pairs, handling commas correctly
    const pairs = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';
    let depth = 0;
    let colonFound = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (!inQuotes && (char === '"' || char === "'")) {
        inQuotes = true;
        quoteChar = char;
        current += char;
      } else if (inQuotes && char === quoteChar) {
        inQuotes = false;
        current += char;
      } else if (!inQuotes && (char === '{' || char === '[')) {
        depth++;
        current += char;
      } else if (!inQuotes && (char === '}' || char === ']')) {
        depth--;
        current += char;
      } else if (char === ':' && !inQuotes && depth === 0) {
        colonFound = true;
        current += char;
      } else if (!inQuotes && char === ',' && depth === 0 && colonFound) {
        // Only split on comma if we've seen a colon (indicating end of a key-value pair)
        if (current.trim()) {
          pairs.push(current.trim());
        }
        current = '';
        colonFound = false;
      } else {
        current += char;
      }
    }
    
    if (current.trim()) {
      pairs.push(current.trim());
    }
    
    return pairs.length > 0 ? pairs : [line];
  }
  _splitCells(line) {
    // Split cells handling quoted values properly
    const cells = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (!inQuotes && (char === '"' || char === "'")) {
        inQuotes = true;
        quoteChar = char;
        current += char;
      } else if (inQuotes && char === quoteChar) {
        inQuotes = false;
        current += char;
      } else if (!inQuotes && (char === ',' || char === ' ' || char === '\t')) {
        if (current.trim()) {
          cells.push(current.trim());
          current = '';
        }
      } else {
        current += char;
      }
    }
    
    if (current.trim()) {
      cells.push(current.trim());
    }
    
    return cells.filter(Boolean);
  }  _finalizeTypedBlock(ctx) {
    if (!ctx || !ctx.type || !ctx.targetKey) return;
    
    const targetKey = ctx.targetKey;
    
    if (ctx.type === "array") {
      // Array content already handled in _processContinuation
      return;
    } else if (ctx.type === "text") {
      // Text content already accumulated - no additional processing needed
      return;
    } else if (ctx.type === "table") {
      if (ctx.headers && ctx.rows && ctx.rows.length > 0) {
        ctx.value[targetKey] = ctx.rows.map(row =>
          Object.fromEntries(ctx.headers.map((h, i) => [h, this._autoConvert(row[i] || null)]))
        );
      } else if (ctx.headers) {
        ctx.value[targetKey] = [];
      }
    } else if (ctx.type === "maptable") {
      if (ctx.headers && ctx.rows && ctx.rows.length > 0) {
        ctx.value[targetKey] = Object.fromEntries(ctx.rows.map(row => {
          const k = row[0];
          const obj = Object.fromEntries(
            ctx.headers.slice(1).map((h, i) => [h, this._autoConvert(row[i + 1] || null)])
          );
          return [k, obj];
        }));
      } else if (ctx.headers) {
        ctx.value[targetKey] = {};
      }
    } else if (ctx.type === "matrix") {
      if (ctx.rows && ctx.rows.length > 0) {
        ctx.value[targetKey] = ctx.rows.map(row => row.map(this._autoConvert));
      } else {
        ctx.value[targetKey] = [];
      }
    }
  }

  // FIXED: Properly adjust context stack based on indentation
  _adjustContextStack(currentIndent) {
    // Don't pop the root context (index 0)
    while (this.contextStack.length > 1) {
      const ctx = this.contextStack[this.contextStack.length - 1];
      
      // Check if we should pop this context
      if (this._shouldPopContext(ctx, currentIndent)) {
        // Finalize typed blocks before popping
        if (ctx.type && ctx.type !== "text") {
          this._finalizeTypedBlock(ctx);
        }
        this.contextStack.pop();
      } else {
        break;
      }
    }
  }

  // FIXED: Determine if a context should be popped based on indentation
  _shouldPopContext(ctx, currentIndent) {
    // For typed blocks (array, table, etc.), only pop when explicitly closed or at same/lower indent
    if (ctx.type && !ctx.indentedObject && !ctx.indentedBlock) {
      return false; // Braced blocks are only closed by explicit braces
    }
    
    // For indented objects or indented typed blocks
    if (ctx.indentedObject || ctx.indentedBlock) {
      // Pop if current line is at same or lower indentation than the context
      return currentIndent <= ctx.indent;
    }
    
    // For regular object contexts, pop if at same or lower indentation
    return currentIndent <= ctx.indent;
  }

  // ENHANCED: Parse TSON objects with unquoted keys
  _parseTSONObject(objectStr) {
    const content = objectStr.slice(1, -1).trim(); // Remove braces
    const result = {};
    
    if (!content) return result;
    
    // Split by commas, but respect nested structures
    const pairs = this._splitObjectPairs(content);
    
    for (const pair of pairs) {
      const colonIndex = pair.indexOf(':');
      if (colonIndex > 0) {
        const key = pair.substring(0, colonIndex).trim();
        const value = pair.substring(colonIndex + 1).trim();
        
        // Clean key (remove quotes if present)
        const cleanKey = this._cleanKey(key);
        
        // Parse value recursively
        result[cleanKey] = this._autoConvert(value);
      }
    }
    
    return result;
  }

  // ENHANCED: Split object pairs respecting nesting
  _splitObjectPairs(content) {
    const pairs = [];
    let current = '';
    let depth = 0;
    let inQuotes = false;
    let quoteChar = '';
    
    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      
      if (!inQuotes && (char === '"' || char === "'")) {
        inQuotes = true;
        quoteChar = char;
        current += char;
      } else if (inQuotes && char === quoteChar) {
        inQuotes = false;
        current += char;
      } else if (!inQuotes && (char === '{' || char === '[')) {
        depth++;
        current += char;
      } else if (!inQuotes && (char === '}' || char === ']')) {
        depth--;
        current += char;
      } else if (!inQuotes && char === ',' && depth === 0) {
        if (current.trim()) {
          pairs.push(current.trim());
        }
        current = '';
      } else {
        current += char;
      }
    }
    
    if (current.trim()) {
      pairs.push(current.trim());
    }
    
    return pairs;
  }
}
