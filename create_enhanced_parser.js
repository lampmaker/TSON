// Enhanced TSON Parser that supports objects in arrays
// This modifies only the array content parsing to handle JSON objects

import fs from 'fs';

// Read the original parser
const originalCode = fs.readFileSync('./src/tson.js', 'utf8');

// Create enhanced version by replacing the array handling in _processContinuation
const enhancedCode = originalCode.replace(
  /if \(type === "array"\) \{\s*ctx\.value\[ctx\.targetKey\]\.push\(this\._autoConvert\(trimmed\)\);\s*return;\s*\}/,
  `if (type === "array") {
      // Enhanced array handling for objects
      const value = this._parseArrayValue(trimmed);
      ctx.value[ctx.targetKey].push(value);
      return;
    }`
).replace(
  // Add the new method before the last closing brace
  /(\s*}\s*)$/,
  `
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
        
        // Parse value recursively
        result[cleanKey] = this._parseArrayValue(value);
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
$1`
);

// Write the enhanced parser
fs.writeFileSync('./src/tson-enhanced.js', enhancedCode);

console.log("Enhanced TSON parser created as tson-enhanced.js");

// Test the enhanced parser
const enhancedModule = await import('./src/tson-enhanced.js');
const { TSONParser: EnhancedTSONParser } = enhancedModule;

const parser = new EnhancedTSONParser();

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
    name: "JSON-style objects - quoted keys",
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
    name: "Nested objects",
    input: `data: array {
  {user:{id:1, name:"Alice"}}
  {user:{id:2, name:"Bob"}}
}`
  },
  {
    name: "Simple values still work",
    input: `colors: array {
  red
  green
  blue
}`
  },
  {
    name: "Backward compatibility - tables still work",
    input: `users: table {
  id, name;
  1, "Alice";
  2, "Bob";
}`
  }
];

console.log("\n=== Testing Enhanced TSON Parser ===\n");

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
