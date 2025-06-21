import { TSONCreator } from '../src/tson-creator.js';

console.log('=== Step by step analysis ===\n');

const creator = new TSONCreator();
const inconsistentRows = [[1, 2], [3, 4, 5]];

console.log('Parent array:', JSON.stringify(inconsistentRows));
console.log('- Contains arrays:', inconsistentRows.some(item => Array.isArray(item)));

console.log('\nProcessing each element:');
inconsistentRows.forEach((item, index) => {
  console.log(`Element ${index}:`, JSON.stringify(item));
  console.log('- Is array:', Array.isArray(item));
  if (Array.isArray(item)) {
    console.log('- Length:', item.length);
    console.log('- Contains arrays:', item.some(subItem => Array.isArray(subItem)));
    console.log('- All non-objects or null:', item.every(subItem => (typeof subItem !== 'object' || subItem === null)));
    console.log('- Would be array block:', item.length >= 3 && !item.some(subItem => Array.isArray(subItem)) && item.every(subItem => (typeof subItem !== 'object' || subItem === null)));
  }
  console.log('- Stringified result:', creator.stringify(item));
  console.log();
});
