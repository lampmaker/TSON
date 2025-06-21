import { TSONParser } from '../src/tson.js';

const parser = new TSONParser();

// Additional edge case tests
const edgeTests = [
  {
    name: "JSON compatibility - objects",
    input: `{"name": "Alice", "age": 30}`,
    expected: { name: "Alice", age: 30 }
  },
  
  {
    name: "JSON compatibility - arrays", 
    input: `[1, 2, "hello", true]`,
    expected: [1, 2, "hello", true]
  },
  
  {
    name: "Mixed JSON and TSON",
    input: `person: {
  name: "Bob"
  hobbies: ["reading", "coding"]
}
count: 42`,
    expected: {
      person: { name: "Bob", hobbies: ["reading", "coding"] },
      count: 42
    }
  },
  
  {
    name: "Nested indentation",
    input: `robot: {
  name: Vinny
  speed: 12.5
}
layers:
    base:
        color: white`,
    expected: {
      robot: { name: "Vinny", speed: 12.5 },
      layers: { base: { color: "white" } }
    }
  },
  
  {
    name: "Empty structures",
    input: `empty_array: array {}
empty_table: table {}
empty_object: {}`,
    expected: {
      empty_array: [],
      empty_table: {},
      empty_object: {}
    }
  },
  
  {
    name: "Inline array",
    input: `colors: array { red, green, blue }`,
    expected: { colors: ["red", "green", "blue"] }
  },
  
  {
    name: "Comments and empty lines",
    input: `# This is a comment
name: Alice

# Another comment
age: 30`,
    expected: { name: "Alice", age: 30 }
  }
];

console.log('🔬 TSON Parser Edge Case Tests\n');

let passed = 0;
let failed = 0;

edgeTests.forEach((test, index) => {
  console.log(`Edge Test ${index + 1}: ${test.name}`);
  console.log(`Input:\n${test.input}`);
  
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
  
  if (resultJson === expectedJson) {
    console.log('✅ PASSED');
    passed++;
  } else {
    console.log('❌ FAILED');
    console.log(`Expected:\n${expectedJson}`);
    failed++;
  }
  
  console.log('');
});

console.log(`\n📊 Edge Test Summary: ${passed} passed, ${failed} failed`);
