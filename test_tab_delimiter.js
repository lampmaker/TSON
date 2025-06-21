import { TSONCreator } from './src/tson-creator.js';

// Test tab delimiter functionality
const creator = new TSONCreator({
  tableDelimiter: 'tab'
});

const testData = [
  { name: "Alice", age: 25, city: "New York" },
  { name: "Bob", age: 30, city: "Los Angeles" },
  { name: "Carol", age: 28, city: "Chicago" }
];

console.log("Testing tab delimiter:");
console.log(creator.stringify(testData));
console.log("\n" + "=".repeat(50) + "\n");

// Compare with space delimiter
const spaceCreator = new TSONCreator({
  tableDelimiter: 'space'
});

console.log("Comparing with space delimiter:");
console.log(spaceCreator.stringify(testData));
