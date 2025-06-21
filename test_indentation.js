import { TSONParser } from './src/tson.js';

const parser = new TSONParser();

// Test the indentation issue
const problematicExample = `name: "Alice"
age: 30
workdays: 
   monday: true
   tuesday: false
kids: 3`;

console.log('=== Indentation Issue Test ===');
console.log('Input:');
console.log(problematicExample);
console.log('\nParsing...');

const result = parser.parse(problematicExample);
console.log('Result:', JSON.stringify(result, null, 2));

const errors = parser.check(problematicExample);
console.log('Errors:', errors);

// Test what the expected structure should be
const expectedExample = `name: "Alice"
age: 30
workdays: {
   monday: true
   tuesday: false
}
kids: 3`;

console.log('\n=== Expected Structure with Braces ===');
console.log('Input:');
console.log(expectedExample);
console.log('\nParsing...');

const result2 = parser.parse(expectedExample);
console.log('Result:', JSON.stringify(result2, null, 2));

const errors2 = parser.check(expectedExample);
console.log('Errors:', errors2);

// Test another variation
const alternativeExample = `name: "Alice"
age: 30
workdays: 
  monday: true
  tuesday: false
kids: 3`;

console.log('\n=== Different Indentation Level ===');
console.log('Input:');
console.log(alternativeExample);
console.log('\nParsing...');

const result3 = parser.parse(alternativeExample);
console.log('Result:', JSON.stringify(result3, null, 2));

const errors3 = parser.check(alternativeExample);
console.log('Errors:', errors3);
