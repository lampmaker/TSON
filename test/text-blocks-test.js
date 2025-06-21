import { TSONCreator } from '../src/tson-creator.js';

console.log('=== Testing Text Block Requirements ===\n');

const creator = new TSONCreator();

// Test multiline text
const multilineText = "Line 1\nLine 2\nLine 3 with : colon\nLine 4 with\ttab";
console.log('Multiline text with special characters:');
console.log(creator.stringify(multilineText));
console.log();

// Test object with multiline text property
const objWithText = {
  title: "Document",
  content: "First paragraph\nSecond paragraph with : special chars\nThird paragraph with\ttabs",
  author: "John Doe"
};
console.log('Object with multiline text property:');
console.log(creator.stringify(objWithText));
console.log();

// Verify text blocks always use braces
console.log('=== Text blocks always use braces (safe from ambiguity) ===\n');

const ambiguousText = "name: John\nage: 30\n\tdetails: sensitive info";
console.log('Potentially ambiguous text (looks like object):');
console.log(creator.stringify(ambiguousText));
console.log('Note: Uses braces to prevent misinterpretation');
