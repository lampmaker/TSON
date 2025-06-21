import { TSONParser } from './src/tson.js';

const parser = new TSONParser();

// Test comprehensive cases to ensure no regressions
const testCases = [
  {
    name: "Original fixed case",
    input: `name: "Alice"
age: 30
workdays: 
   monday: true
   tuesday: false
kids: 3`
  },
  {
    name: "Deep nesting",
    input: `level0: value
level1:
  item1: value1
  level2:
    item2a: value2a
    level3:
      deep: value
    item2b: value2b
  item1b: value1b
back_to_root: value`
  },
  {
    name: "Arrays still work",
    input: `colors: array {
  red
  green
  blue
}
metadata:
  created: today
final: done`
  },
  {
    name: "Tables still work", 
    input: `users: table {
  id, name;
  1, "Alice";
  2, "Bob";
}
summary: complete`
  },
  {
    name: "Mixed braced and indented",
    input: `braced: {
  key1: value1
  key2: value2
}
indented:
  key3: value3
  key4: value4
final: value`
  },
  {
    name: "JSON compatibility",
    input: `{"name": "Alice", "age": 30}`
  }
];

console.log("=== Comprehensive Test Suite ===\n");

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
  } else {
    console.log("✅ No errors");
  }
  
  console.log("\n" + "=".repeat(50) + "\n");
});
