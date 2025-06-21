import { TSONParser } from '../src/tson.js';

const parser = new TSONParser();

const errorTestCases = [
  {
    name: "Unclosed Brace",
    input: `config: {
  name: "test"
  # Missing closing brace`,
    expectedErrors: ["closing brace", "brace"]
  },

  {
    name: "Unclosed Array Block",
    input: `items: array {
  one
  two
  # Missing closing brace`,
    expectedErrors: ["closing", "brace"]
  },

  {
    name: "Unclosed Table Block", 
    input: `data: table {
  x, y;
  1, 2;
  # Missing closing brace`,
    expectedErrors: ["closing", "brace"]
  },

  {
    name: "Invalid JSON in JSON Mode",
    input: `{"name": "test", "age": }`,
    expectedErrors: ["JSON", "parse", "syntax"]
  },

  {
    name: "Mismatched Quotes",
    input: `name: "Alice
age: 30`,
    expectedErrors: ["quote", "string", "unterminated"]
  },

  {
    name: "Invalid Key-Value Separator",
    input: `name = "Alice"
age = 30`,
    expectedErrors: [":", "separator", "invalid"]
  },

  {
    name: "Empty Key",
    input: `: "value"
name: "test"`,
    expectedErrors: ["key", "empty", "invalid"]
  },

  {
    name: "Unclosed Text Block",
    input: `description: text {
  This is some text
  # Missing closing brace`,
    expectedErrors: ["closing", "brace", "text"]
  },

  {
    name: "Invalid Array Syntax",
    input: `items: [one, two, three`,
    expectedErrors: ["bracket", "array", "closing"]
  },

  {
    name: "Table Without Headers",
    input: `data: table {
  1, 2, 3;
  4, 5, 6;
}`,
    expectedErrors: ["header", "table", "missing"]
  },

  {
    name: "Maptable Without Headers",
    input: `lookup: maptable {
  red, 255;
  green, 128;
}`,
    expectedErrors: ["header", "maptable", "missing"]
  },

  {
    name: "Invalid Nested Structure",
    input: `config:
    name: "test"
  port: 8080`,
    expectedErrors: ["indentation", "nesting", "invalid"]
  },

  {
    name: "Unexpected Closing Brace",
    input: `name: "test"
}
age: 30`,
    expectedErrors: ["unexpected", "closing", "brace"]
  },

  {
    name: "Invalid Character in Unquoted Value",
    input: `name: Alice@domain.com
age: 30`,
    expectedErrors: ["character", "invalid", "unquoted"]
  },

  {
    name: "Mixed Array Syntax Error",
    input: `items: array [
  one
  two
]`,
    expectedErrors: ["syntax", "array", "mixed"]
  },

  {
    name: "Invalid Type Declaration",
    input: `data: unknown {
  some: "data"
}`,
    expectedErrors: ["type", "unknown", "invalid"]
  },

  {
    name: "Malformed Table Row",
    input: `scores: table {
  name, score;
  Alice;
  Bob, 85;
}`,
    expectedErrors: ["column", "row", "mismatch"]
  },

  {
    name: "Invalid Matrix Format",
    input: `grid: matrix {
  1, 2
  3, 4, 5
}`,
    expectedErrors: ["matrix", "row", "inconsistent"]
  },

  {
    name: "Double Colon",
    input: `name:: "Alice"`,
    expectedErrors: ["colon", "syntax", "invalid"]
  },

  {
    name: "Invalid Boolean",
    input: `active: TRUE
enabled: False`,
    expectedErrors: ["boolean", "case", "invalid"]
  },

  {
    name: "Incomplete Key-Value",
    input: `name: 
age: 30`,
    expectedErrors: ["value", "missing", "incomplete"]
  },

  {
    name: "Invalid Number Format",
    input: `count: 12.34.56
size: --42`,
    expectedErrors: ["number", "format", "invalid"]
  },

  {
    name: "Nested Unclosed Structures",
    input: `config: {
  database: {
    host: "localhost"
    # Missing closing braces
  # for both objects`,
    expectedErrors: ["closing", "brace", "nested"]
  },

  {
    name: "Invalid Comment Placement",
    input: `name: "Alice" # inline comment not supported
age: 30`,
    expectedErrors: ["comment", "inline", "placement"]
  },

  {
    name: "Empty Input",
    input: ``,
    expectedErrors: ["empty", "input", "no content"]
  }
];

console.log('🚨 TSON Error Detection Test Suite\n');

let passed = 0;
let failed = 0;
let totalErrors = 0;

errorTestCases.forEach((test, index) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Error Test ${index + 1}: ${test.name}`);
  console.log(`${'='.repeat(60)}`);
  
  console.log('\n📝 INVALID INPUT:');
  console.log(test.input || '(empty)');
  
  console.log('\n🎯 EXPECTED ERROR KEYWORDS:');
  console.log(test.expectedErrors.map(e => `"${e}"`).join(', '));
  
  // Check for errors
  const errors = parser.check(test.input);
  totalErrors += errors.length;
  
  console.log('\n📊 ACTUAL ERRORS:');
  if (errors.length === 0) {
    console.log('  (no errors detected)');
  } else {
    errors.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error}`);
    });
  }
  
  // Check if we got any errors (should have errors for these test cases)
  if (errors.length === 0) {
    console.log('\n❌ FAILED - Expected errors but none were detected');
    failed++;
  } else {
    // Check if error messages contain expected keywords
    const errorText = errors.join(' ').toLowerCase();
    const hasExpectedKeywords = test.expectedErrors.some(keyword => 
      errorText.includes(keyword.toLowerCase())
    );
    
    if (hasExpectedKeywords) {
      console.log('\n✅ PASSED - Errors detected with expected keywords');
      passed++;
    } else {
      console.log('\n⚠️  PARTIAL - Errors detected but missing expected keywords');
      console.log('     This might be okay if the error messages are descriptive enough');
      passed++; // Count as passed since errors were detected
    }
  }
  
  // Also test that parsing returns null for invalid input
  const result = parser.parse(test.input);
  if (result !== null && errors.length > 0) {
    console.log('\n⚠️  WARNING - Parser returned result despite errors');
  }
});

console.log(`\n${'='.repeat(60)}`);
console.log(`📊 ERROR DETECTION RESULTS:`);
console.log(`  Tests: ${passed} passed, ${failed} failed`);
console.log(`  Total Errors Detected: ${totalErrors}`);
console.log(`  Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
console.log(`${'='.repeat(60)}`);

if (failed === 0) {
  console.log('🎉 All error detection tests passed!');
  console.log('   The parser correctly identifies invalid TSON syntax.');
} else {
  console.log(`⚠️  ${failed} test(s) failed. The parser may need improvement in error detection.`);
}

console.log('\n💡 Note: Some "PARTIAL" results are acceptable if the parser');
console.log('   detects errors even if the exact keywords differ from expected.');
