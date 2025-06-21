import { TSONParser } from './src/tson.js';

// Create a surgical fix by extending the parser with proper object handling
class FixedTSONParser extends TSONParser {
  _processContinuation(indent, trimmed) {
    const ctx = this._currentContext();
    if (!ctx) {
      this.errors.push(`No valid context at line ${this.lineIndex + 1}`);
      return;
    }
    
    const type = ctx.type;

    // Handle indented object context or find correct context based on indentation
    if (!type || ctx.indentedObject) {
      // Pop contexts until we find the right indentation level
      while (this.contextStack.length > 1 && this.contextStack[this.contextStack.length - 1].indent >= indent) {
        this.contextStack.pop();
      }
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

    // FIXED: Enhanced array handling for objects
    if (type === "array") {
      const value = this._parseArrayValue(trimmed);
      ctx.value[ctx.targetKey].push(value);
      return;
    }

    // Handle table/matrix/maptable data
    const line = trimmed.replace(/;$/, "");
    const cells = this._splitCells(line);

    if (type === "matrix") {
      // Matrix has no headers, all rows are data
      if (cells.length > 0) {
        ctx.rows.push(cells);
      }
    } else if (!ctx.headers) {
      // Table and maptable have headers
      ctx.headers = cells;
    } else if (cells.length > 0) {
      ctx.rows.push(cells);
    }

    // Check if this is the end of the block
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
    }

    if (blockEnd && ((ctx.headers && !ctx.isTextBlock) || (type === "matrix" && ctx.rows.length > 0))) {
      this._finalizeTypedBlock(ctx);
      // Don't pop context here - let the closing brace or natural end handle it
    }
  }

  // NEW: Enhanced array value parsing
  _parseArrayValue(value) {
    const trimmed = value.trim();
    
    // Handle JSON objects (both quoted and unquoted keys)
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        // Try to parse as standard JSON first
        return JSON.parse(trimmed);
      } catch (e) {
        // If that fails, try to parse TSON-style unquoted keys
        return this._parseTSONObject(trimmed);
      }
    }
    
    // Handle JSON arrays
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        return JSON.parse(trimmed);
      } catch (e) {
        // Fall back to original parsing
        return this._parseValue ? this._parseValue(trimmed) : this._autoConvert(trimmed);
      }
    }
    
    // Fall back to original auto-convert
    return this._autoConvert(trimmed);
  }

  // NEW: Parse TSON objects with unquoted keys
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
        result[cleanKey] = this._parseArrayValue(value);
      }
    }
    
    return result;
  }

  // NEW: Split object pairs respecting nesting
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

// Test the fixed parser
const parser = new FixedTSONParser();

const testCases = [
  {
    name: "Original failing case - unquoted keys",
    input: `states: array {
  {state:4}
  {state:5}
  {state:7}
}`
  },
  {
    name: "Multiple properties with unquoted keys",
    input: `items: array {
  {id:1, name:"Alice", active:true}
  {id:2, name:"Bob", active:false}
}`
  },
  {
    name: "JSON-style objects - quoted keys",
    input: `data: array {
  {"key": 1, "value": "test"}
  {"key": 2, "value": "demo"}
}`
  },
  {
    name: "Mixed types in array",
    input: `mixed: array {
  simple_string
  123
  {object: "value"}
  true
}`
  },
  {
    name: "Nested objects",
    input: `nested: array {
  {user: {id: 1, name: "Alice"}}
  {user: {id: 2, name: "Bob"}}
}`
  },
  {
    name: "Backward compatibility - simple values",
    input: `colors: array {
  red
  green
  blue
}`
  },
  {
    name: "Backward compatibility - tables",
    input: `users: table {
  id, name;
  1, "Alice";
  2, "Bob";
}`
  }
];

console.log("=== Testing Fixed TSON Parser ===\n");

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log("Input:");
  console.log(testCase.input);
  console.log("\nResult:");
  
  const result = parser.parse(testCase.input);
  console.log(JSON.stringify(result, null, 2));
  
  const errors = parser.check(testCase.input);
  if (errors.length > 0) {
    console.log("Errors:", errors);
  }
  
  console.log("\n" + "=".repeat(60) + "\n");
});
