// Test implementation to see if we can fix the array object parsing issue
// This creates a minimal patch to the TSON parser

import { TSONParser } from './src/tson.js';

// Create a patched version that handles objects in arrays
class PatchedTSONParser extends TSONParser {
  parse(text) {
    // First, try a simple preprocessing approach
    // Replace object patterns in array blocks with JSON-parseable versions
    const preprocessed = this._preprocessArrayObjects(text);
    return super.parse(preprocessed);
  }

  _preprocessArrayObjects(text) {
    // Look for array blocks and fix object syntax
    const lines = text.split('\n');
    const result = [];
    let inArrayBlock = false;
    let braceDepth = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Detect array block start
      if (trimmed.includes(': array {')) {
        inArrayBlock = true;
        braceDepth = 1;
        result.push(line);
        continue;
      }
      
      // Track brace depth
      if (inArrayBlock) {
        for (const char of trimmed) {
          if (char === '{') braceDepth++;
          if (char === '}') braceDepth--;
        }
        
        // Check if this line contains an object-like structure
        if (braceDepth > 0 && trimmed.startsWith('{') && trimmed.endsWith('}')) {
          // Convert TSON object to JSON format
          const jsonObject = this._convertTSONObjectToJSON(trimmed);
          const indent = line.match(/^\s*/)[0];
          result.push(indent + jsonObject);
        } else {
          result.push(line);
        }
        
        // End of array block
        if (braceDepth === 0) {
          inArrayBlock = false;
        }
      } else {
        result.push(line);
      }
    }
    
    return result.join('\n');
  }

  _convertTSONObjectToJSON(tsonObject) {
    // Convert {key:value, key2:value2} to {"key": value, "key2": value2}
    try {
      // If it's already valid JSON, return as-is
      JSON.parse(tsonObject);
      return tsonObject;
    } catch (e) {
      // Convert unquoted keys to quoted keys
      let result = tsonObject;
      
      // Find all key:value patterns
      result = result.replace(/\{(\s*)/g, '{ '); // Ensure space after opening brace
      result = result.replace(/(\s*)\}/g, ' }'); // Ensure space before closing brace
      
      // Quote unquoted keys: word: -> "word":
      result = result.replace(/(\{|,)\s*([a-zA-Z_]\w*)\s*:/g, '$1"$2":');
      
      // Fix spacing
      result = result.replace(/\s+/g, ' ').trim();
      
      return result;
    }
  }
}

// Test the patched parser
const parser = new PatchedTSONParser();

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
    name: "Multiple properties",
    input: `items: array {
  {id:1, name:"Alice"}
  {id:2, name:"Bob"}
}`
  },
  {
    name: "Already quoted keys",
    input: `data: array {
  {"key": 1}
  {"key": 2}
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

console.log("=== Testing Patched TSON Parser ===\n");

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log("Input:");
  console.log(testCase.input);
  
  // Show preprocessed version
  const patched = new PatchedTSONParser();
  const preprocessed = patched._preprocessArrayObjects(testCase.input);
  if (preprocessed !== testCase.input) {
    console.log("\nPreprocessed:");
    console.log(preprocessed);
  }
  
  console.log("\nResult:");
  const result = parser.parse(testCase.input);
  console.log(JSON.stringify(result, null, 2));
  
  const errors = parser.check(testCase.input);
  if (errors.length > 0) {
    console.log("Errors:", errors);
  }
  
  console.log("\n" + "=".repeat(60) + "\n");
});
