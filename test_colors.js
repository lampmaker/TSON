import { TSONParser } from './src/tson.js';

const parser = new TSONParser();

// Test the user's example
const example1 = `colors: 
  red
  green
  blue
  yellow`;

console.log('=== Test 1: User\'s example ===');
console.log('Input:');
console.log(example1);
console.log('\nParsing...');

const result1 = parser.parse(example1);
console.log('Result:', JSON.stringify(result1, null, 2));

const errors1 = parser.check(example1);
console.log('Errors:', errors1);

// Test the correct TSON syntax
const example2 = `colors: array {
  red
  green
  blue
  yellow
}`;

console.log('\n=== Test 2: Correct TSON array syntax ===');
console.log('Input:');
console.log(example2);
console.log('\nParsing...');

const result2 = parser.parse(example2);
console.log('Result:', JSON.stringify(result2, null, 2));

const errors2 = parser.check(example2);
console.log('Errors:', errors2);

// Test alternative correct syntax
const example3 = `colors: ["red", "green", "blue", "yellow"]`;

console.log('\n=== Test 3: JSON array syntax ===');
console.log('Input:');
console.log(example3);
console.log('\nParsing...');

const result3 = parser.parse(example3);
console.log('Result:', JSON.stringify(result3, null, 2));

const errors3 = parser.check(example3);
console.log('Errors:', errors3);

// Test array with object elements
const example4 = `states: array {
  {state:4}
  {state:5}
  {state:7}
}`;

console.log('\n=== Test 4: Array with object elements ===');
console.log('Input:');
console.log(example4);
console.log('\nParsing...');

const result4 = parser.parse(example4);
console.log('Result:', JSON.stringify(result4, null, 2));

const errors4 = parser.check(example4);
console.log('Errors:', errors4);

// Test array with properly quoted object elements
const example5 = `states: array {
  {"state": 4}
  {"state": 5}
  {"state": 7}
}`;

console.log('\n=== Test 5: Array with quoted object elements ===');
console.log('Input:');
console.log(example5);
console.log('\nParsing...');

const result5 = parser.parse(example5);
console.log('Result:', JSON.stringify(result5, null, 2));

const errors5 = parser.check(example5);
console.log('Errors:', errors5);

// Test standard JSON array syntax with objects
const example6 = `states: [
  {"state": 4},
  {"state": 5},
  {"state": 7}
]`;

console.log('\n=== Test 6: Standard JSON array with objects ===');
console.log('Input:');
console.log(example6);
console.log('\nParsing...');

const result6 = parser.parse(example6);
console.log('Result:', JSON.stringify(result6, null, 2));

const errors6 = parser.check(example6);
console.log('Errors:', errors6);

// Test table syntax for object-like data
const example7 = `states: table {
  state;
  4;
  5;
  7;
}`;

console.log('\n=== Test 7: Table syntax for state data ===');
console.log('Input:');
console.log(example7);
console.log('\nParsing...');

const result7 = parser.parse(example7);
console.log('Result:', JSON.stringify(result7, null, 2));

const errors7 = parser.check(example7);
console.log('Errors:', errors7);

// Test simple JSON object array
const example8 = `states: [{"state":4}, {"state":5}, {"state":7}]`;

console.log('\n=== Test 8: Simple JSON object array ===');
console.log('Input:');
console.log(example8);
console.log('\nParsing...');

const result8 = parser.parse(example8);
console.log('Result:', JSON.stringify(result8, null, 2));

const errors8 = parser.check(example8);
console.log('Errors:', errors8);
