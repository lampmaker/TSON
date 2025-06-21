import { TSONParser } from '../src/tson.js';

const parser = new TSONParser();

// Test cases based on the TSON 2.2 specification
const testCases = [
  {
    name: "Basic key-value pairs",
    input: `name: "Alice"
age: 30
active: true`,
    expected: { name: "Alice", age: 30, active: true }
  },
  
  {
    name: "Array block",
    input: `colors: array {
  red
  green
  blue
}`,
    expected: { colors: ["red", "green", "blue"] }
  },
  
  {
    name: "Table structure", 
    input: `strokes: table {
  x, y, pressure;
  10, 20, 0.3;
  11, 22, 0.4;
}`,
    expected: { 
      strokes: [
        { x: 10, y: 20, pressure: 0.3 },
        { x: 11, y: 22, pressure: 0.4 }
      ]
    }
  },
  
  {
    name: "Maptable structure",
    input: `types: maptable {
  color, y;
  red, 10;
  blue, 11;
}`,
    expected: {
      types: {
        red: { y: 10 },
        blue: { y: 11 }
      }
    }
  },
  
  {
    name: "Matrix",
    input: `points: matrix {
  1, 2, 3
  4, 5, 6
}`,
    expected: {
      points: [
        [1, 2, 3],
        [4, 5, 6]
      ]
    }
  },
  
  {
    name: "Text block",
    input: `description: text {
  This is a multiline
  paragraph with no quotes
}`,
    expected: {
      description: "This is a multiline\nparagraph with no quotes"
    }
  }
];

console.log('🧪 TSON Parser Test Suite\n');

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
    console.log('=============================================');
  console.log(`Test ${index + 1}: ${test.name}`);
  console.log(`Input:\n----------------------\n${test.input}\n---------`);
  
  // Check for errors
  const errors = parser.check(test.input);
  if (errors.length > 0) {
    console.log(`❌ ERRORS: ${errors.join(', ')}`);
    failed++;
    console.log('');
    return;
  }
  
  // Parse and compare
  const result = parser.parse(test.input);
  const resultJson = JSON.stringify(result, null, 2);
  const expectedJson = JSON.stringify(test.expected, null, 2);
  
  console.log(`Result:\n${resultJson}`);
  console.log(`Expected:\n${expectedJson}`);
  
  if (resultJson === expectedJson) {
    console.log('✅ PASSED');
    passed++;
  } else {
    console.log('❌ FAILED - Output does not match expected');
    failed++;
  }
  
  console.log('');
});

console.log(`\n📊 Test Summary: ${passed} passed, ${failed} failed`);
