import { TSONCreator } from '../src/tson-creator.js';

console.log('=== Debugging Array Block Logic ===\n');

const creator = new TSONCreator();

// Test the problematic array
const testArray = [3, 4, 5];
console.log('Test array [3, 4, 5]:');
console.log('- Length:', testArray.length);
console.log('- arrayThreshold:', creator.settings.arrayThreshold);
console.log('- Length >= threshold:', testArray.length >= creator.settings.arrayThreshold);

console.log('- Every item check:');
testArray.forEach((item, index) => {
  console.log(`  [${index}] ${item}: typeof=${typeof item}, isObject=${typeof item === 'object'}, isNull=${item === null}, isArray=${Array.isArray(item)}`);
  console.log(`    Passes condition: ${(typeof item !== 'object' || item === null) && !Array.isArray(item)}`);
});

const everyCondition = testArray.every(item => (typeof item !== 'object' || item === null) && !Array.isArray(item));
console.log('- Every condition result:', everyCondition);

console.log('\nShould be array block:', testArray.length >= creator.settings.arrayThreshold && everyCondition);

console.log('\nActual output:');
console.log(creator.stringify(testArray));

console.log('\n=== Test with arrayThreshold = 5 ===');
const creator2 = new TSONCreator({ arrayThreshold: 5 });
console.log('With arrayThreshold = 5:');
console.log(creator2.stringify(testArray));
