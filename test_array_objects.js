import { TSONParser } from './src/tson.js';

const parser = new TSONParser();

// Test the array with object issue
const problematicExample = `colors: array {
  {red:[1,2,3],green:[3,4,5]}
  green
  blue
  yellow
}
numbers: [1, 2, 3, 4]`;

console.log('=== Array with Object Issue Test ===');
console.log('Input:');
console.log(problematicExample);
console.log('\nParsing...');

const result = parser.parse(problematicExample);
console.log('Result:', JSON.stringify(result, null, 2));

const errors = parser.check(problematicExample);
console.log('Errors:', errors);

// Test what we expect vs what we get
console.log('\n=== Expected Result ===');
const expected = {
  colors: [
    {red: [1,2,3], green: [3,4,5]},
    "green", 
    "blue",
    "yellow"
  ],
  numbers: [1, 2, 3, 4]
};
console.log(JSON.stringify(expected, null, 2));

// Test individual parts
const simpleObject = `test: array {
  {simple:123}
  other
}`;

console.log('\n=== Simple Object in Array Test ===');
console.log('Input:');
console.log(simpleObject);
console.log('\nResult:');
const result2 = parser.parse(simpleObject);
console.log(JSON.stringify(result2, null, 2));

// Test just the problematic line
const justObject = `{red:[1,2,3],green:[3,4,5]}`;
console.log('\n=== Testing object parsing directly ===');
console.log('Input:', justObject);
try {
  const directParse = JSON.parse(justObject);
  console.log('JSON.parse works:', JSON.stringify(directParse, null, 2));
} catch (e) {
  console.log('JSON.parse fails:', e.message);
}
