import { TSONCreator } from '../src/tson-creator.js';

console.log('=== Testing Edge Cases ===\n');

// Use a higher threshold to avoid array blocks for small arrays in tests
const creator = new TSONCreator({ arrayThreshold: 5 });

// Test inconsistent row lengths
const inconsistentRows = [[1, 2], [3, 4, 5]];
console.log('Inconsistent row lengths:');
console.log(creator.stringify(inconsistentRows));
console.log('Expected: Regular array format\n');

// Test mixed types
const mixedTypes = [[1, 2], ['a', 'b']];
console.log('Mixed types:');
console.log(creator.stringify(mixedTypes));
console.log('Expected: Regular array format\n');

// Test too small
const tooSmall = [[1]];
console.log('Too small:');
console.log(creator.stringify(tooSmall));
console.log('Expected: Regular array format\n');

// Test valid matrix
const validMatrix = [[1, 2], [3, 4]];
console.log('Valid matrix:');
console.log(creator.stringify(validMatrix));
console.log('Expected: Matrix format\n');

// Test matrix detection logic directly
console.log('=== Matrix detection logic ===');
console.log('inconsistentRows _canBeMatrix:', creator._canBeMatrix(inconsistentRows));
console.log('mixedTypes _canBeMatrix:', creator._canBeMatrix(mixedTypes));
console.log('tooSmall _canBeMatrix:', creator._canBeMatrix(tooSmall));
console.log('validMatrix _canBeMatrix:', creator._canBeMatrix(validMatrix));

// Test with a legitimate array block
console.log('\n=== Array block test ===');
const largeArray = [1, 2, 3, 4, 5, 6, 7];
console.log('Large simple array:');
console.log(creator.stringify(largeArray));
console.log('Expected: Array block format');
