import { TSONParser } from '../src/tson.js';

console.log('📝 Text Block Bracket Requirement Documentation Test\n');

const parser = new TSONParser();

// Test 1: Valid text block with braces
console.log('✅ Test 1: Valid text block with braces');
const validText = `content: text {
  This is safe multiline text
  name: John Doe
  age: 30
  	status: active
}`;

console.log('Input:');
console.log(validText);
console.log('\nResult:');
console.log(JSON.stringify(parser.parse(validText), null, 2));
console.log();

// Test 2: Invalid text block without braces (would be ambiguous)
console.log('❌ Test 2: Invalid text block without braces');
const invalidText = `content: text
  This would be ambiguous
  name: John Doe
  age: 30`;

console.log('Input:');
console.log(invalidText);
console.log('\nErrors:');
const errors = parser.check(invalidText);
if (errors.length > 0) {
  errors.forEach(error => console.log(`  - ${error}`));
} else {
  console.log('  (no errors detected - parser may be permissive)');
}
console.log();

// Test 3: Show why braces are necessary
console.log('🛡️ Test 3: Demonstration of why braces are necessary');
console.log('Without braces, this text content:');
console.log(`  name: John Doe
  age: 30
  details:
    status: active`);
console.log('\nCould be misinterpreted as a nested object structure!');
console.log('With braces, it\'s clearly text content:');
console.log(`text {
  name: John Doe
  age: 30
  details:
    status: active
}`);
console.log();

// Test 4: Comparison with other block types that support indented syntax
console.log('📊 Test 4: Other block types support indented syntax safely');
const indentedTable = `scores: table
  name score
  Alice 95
  Bob 87`;

console.log('Indented table (works fine):');
console.log(indentedTable);
console.log('\nResult:');
console.log(JSON.stringify(parser.parse(indentedTable), null, 2));
console.log('\n✨ Tables work indented because they have clear structure (headers + data rows)');
console.log('📝 Text blocks need braces because content is freeform and unpredictable');

console.log('\n🎯 Summary: Text blocks ALWAYS require braces { } for safety and clarity!');
