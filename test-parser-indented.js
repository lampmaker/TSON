import { TSONParser } from './src/tson.js';

const parser = new TSONParser();

// Test indented syntax for regular objects
const testCases = [
  {
    name: 'Simple indented object',
    tson: `person:
  name: "Alice"
  age: 30`
  },
  {
    name: 'Nested indented objects',
    tson: `person:
  name: "Alice"
  age: 30
  address:
    street: "123 Main St"
    city: "Boston"`
  },
  {
    name: 'Mixed braced and indented',
    tson: `person: {
  name: "Alice"
  age: 30
}
workdays:
  sunday: false
  monday: true`
  }
];

console.log('🧪 Testing Parser Indented Syntax...\n');

testCases.forEach(testCase => {
  console.log(`📋 Testing: ${testCase.name}`);
  console.log('Input TSON:');
  console.log(testCase.tson);
  console.log('');
  
  const errors = parser.check(testCase.tson);
  if (errors.length > 0) {
    console.log('❌ ERRORS:');
    errors.forEach(error => console.log('  -', error));
  } else {
    console.log('✅ No syntax errors');
  }
  
  const result = parser.parse(testCase.tson);
  if (result) {
    console.log('✅ PARSED RESULT:');
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log('❌ Parse failed');
  }
  
  console.log('─'.repeat(50));
});
