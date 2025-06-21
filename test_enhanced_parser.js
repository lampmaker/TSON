import { TSONParser } from './src/tson.js';

// Create a modified parser that can handle objects in arrays
class ExtendedTSONParser extends TSONParser {
  _processBlockContent(line) {
    const ctx = this._currentContext();
    if (!ctx || !ctx.type) {
      return;
    }

    const trimmed = line.trim();
    if (!trimmed) return;

    const type = ctx.type;

    if (type === "text") {
      const currentText = ctx.value[ctx.targetKey] || "";
      ctx.value[ctx.targetKey] = currentText + (currentText ? "\n" : "") + trimmed;
      return;
    }

    if (type === "array") {
      // Enhanced array handling for objects
      const value = this._parseArrayValue(trimmed);
      ctx.value[ctx.targetKey].push(value);
      return;
    }

    // Handle table/matrix/maptable data (unchanged)
    const cleanLine = trimmed.replace(/;$/, "");
    const cells = this._splitCells(cleanLine);

    if (type === "matrix") {
      if (cells.length > 0) {
        ctx.rows.push(cells);
      }
    } else if (!ctx.headers) {
      ctx.headers = cells;
    } else if (cells.length > 0) {
      ctx.rows.push(cells);
    }

    // Check if this is the end of the block (unchanged logic)
    const nextLine = this.lines[this.lineIndex + 1];
    const nextTrimmed = nextLine ? nextLine.trim() : "";
    const nextIndent = nextLine ? nextLine.match(/^\s*/)[0].length : 0;
    
    let blockEnd = false;
    
    if (ctx.indentedBlock) {
      blockEnd = !nextLine || 
                 nextTrimmed === "" ||
                 nextTrimmed.startsWith("#") ||
                 nextIndent <= ctx.indent;
    } else {
      blockEnd = !nextLine || 
                 nextTrimmed === "}" || 
                 nextTrimmed === "]" ||
                 (nextLine && nextTrimmed && !nextLine.startsWith(" ") && !nextLine.startsWith("\t") && nextTrimmed.length > 0 && !nextTrimmed.startsWith("#"));
    }

    if (blockEnd && ((ctx.headers && !ctx.isTextBlock) || (type === "matrix" && ctx.rows.length > 0))) {
      this._finalizeTypedBlock(ctx);
    }
  }

  _parseArrayValue(value) {
    const trimmed = value.trim();
    
    // Handle JSON objects
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
        return this._parseValue(trimmed);
      }
    }
    
    // Fall back to original auto-convert
    return this._autoConvert(trimmed);
  }

  _parseTSONObject(objectStr) {
    // Parse TSON-style object with unquoted keys like {state:4}
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
        
        // Parse value
        result[cleanKey] = this._autoConvert(value);
      }
    }
    
    return result;
  }

  _splitObjectPairs(content) {
    // Split object content by commas, respecting nested structures
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

// Test the enhanced parser
const parser = new ExtendedTSONParser();

const testCases = [
  {
    name: "Original failing case",
    input: `states: array {
  {state:4}
  {state:5}
  {state:7}
}`
  },
  {
    name: "JSON-style objects",
    input: `states: array {
  {"state": 4}
  {"state": 5}
  {"state": 7}
}`
  },
  {
    name: "Mixed object properties",
    input: `items: array {
  {id:1, name:"Alice"}
  {id:2, name:"Bob"}
  {id:3, name:"Charlie"}
}`
  },
  {
    name: "Simple values still work",
    input: `colors: array {
  red
  green
  blue
}`
  }
];

console.log("=== Testing Enhanced TSON Parser ===\n");

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
  
  console.log("\n" + "=".repeat(50) + "\n");
});
