import { TSONCreator } from '../src/tson-creator.js';

console.log('=== Testing TSONCreator Improvements ===\n');

// Test data
const testData = {
  // Matrix test data
  matrix2x3: [
    [1, 2, 3],
    [4, 5, 6]
  ],
  
  matrix3x3: [
    [1.5, 2.7, 3.1],
    [4.2, 5.8, 6.3],
    [7.9, 8.1, 9.4]
  ],
  
  // Table with missing properties
  incompleteTable: [
    { id: 1, name: 'Alice', age: 30, email: 'alice@example.com' },
    { id: 2, name: 'Bob', age: 25 },  // missing email
    { id: 3, name: 'Charlie', email: 'charlie@example.com' },  // missing age
    { id: 4, name: 'Diana', age: 28, email: 'diana@example.com', role: 'admin' }  // extra property
  ],
  
  // Maptable with missing properties
  incompleteMaptable: {
    user1: { name: 'Alice', age: 30, department: 'Engineering' },
    user2: { name: 'Bob', age: 25 },  // missing department
    user3: { name: 'Charlie', department: 'Marketing' },  // missing age
    user4: { name: 'Diana', age: 28, department: 'Sales', role: 'Manager' }  // extra property
  }
};

// Test 1: Matrix detection and formatting
console.log('Test 1: Matrix blocks\n');

const creator1 = new TSONCreator();
console.log('2x3 Matrix (indented):');
console.log(creator1.stringify(testData.matrix2x3));
console.log();

console.log('3x3 Matrix (indented):');
console.log(creator1.stringify(testData.matrix3x3));
console.log();

const creator1Braced = new TSONCreator({ blockStyle: 'braced' });
console.log('2x3 Matrix (braced):');
console.log(creator1Braced.stringify(testData.matrix2x3));
console.log();

// Test 2: Tables with missing properties (fillMissingProperties = false)
console.log('Test 2: Tables with missing properties (skip columns)\n');

const creator2 = new TSONCreator({ fillMissingProperties: false });
console.log('Table with missing properties (only common columns):');
console.log(creator2.stringify(testData.incompleteTable));
console.log();

// Test 3: Tables with missing properties (fillMissingProperties = true)
console.log('Test 3: Tables with missing properties (fill with null)\n');

const creator3 = new TSONCreator({ fillMissingProperties: true, missingValue: null });
console.log('Table with missing properties (fill with null):');
console.log(creator3.stringify(testData.incompleteTable));
console.log();

const creator3Empty = new TSONCreator({ fillMissingProperties: true, missingValue: '' });
console.log('Table with missing properties (fill with empty string):');
console.log(creator3Empty.stringify(testData.incompleteTable));
console.log();

// Test 4: Maptables with missing properties
console.log('Test 4: Maptables with missing properties\n');

const creator4 = new TSONCreator({ fillMissingProperties: false });
console.log('Maptable with missing properties (only common columns):');
console.log(creator4.stringify(testData.incompleteMaptable));
console.log();

const creator4Fill = new TSONCreator({ fillMissingProperties: true, missingValue: 'N/A' });
console.log('Maptable with missing properties (fill with N/A):');
console.log(creator4Fill.stringify(testData.incompleteMaptable));
console.log();

// Test 5: Key prioritization (id, name, key should come first)
console.log('Test 5: Key prioritization\n');

const priorityTestData = [
  { description: 'First item', category: 'A', id: 1, name: 'Item 1', value: 100 },
  { description: 'Second item', category: 'B', id: 2, name: 'Item 2', value: 200 },
  { description: 'Third item', category: 'A', id: 3, name: 'Item 3', value: 150 }
];

const creator5 = new TSONCreator({ fillMissingProperties: true });
console.log('Table with priority keys (id, name should be first):');
console.log(creator5.stringify(priorityTestData));
console.log();

// Test 6: Edge cases for matrix detection
console.log('Test 6: Matrix detection edge cases\n');

const notMatrix1 = [[1, 2], [3, 4, 5]]; // inconsistent row lengths
const notMatrix2 = [[1, 2], ['a', 'b']]; // mixed types
const notMatrix3 = [[1]]; // too small
const isMatrix4 = [[1, 2], [3, 4]]; // should be matrix

const creator6 = new TSONCreator();
console.log('Inconsistent row lengths (should not be matrix):');
console.log(creator6.stringify(notMatrix1));
console.log();

console.log('Mixed types (should not be matrix):');
console.log(creator6.stringify(notMatrix2));
console.log();

console.log('Too small (should not be matrix):');
console.log(creator6.stringify(notMatrix3));
console.log();

console.log('Valid 2x2 matrix:');
console.log(creator6.stringify(isMatrix4));
console.log();

// Test 7: Complex nested structure with matrices
console.log('Test 7: Complex structure with matrices\n');

const complexData = {
  metadata: {
    title: 'Dataset Analysis',
    version: '1.0'
  },
  transformMatrix: [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ],
  samples: [
    { id: 'S001', name: 'Sample A', values: [1.2, 3.4, 5.6] },
    { id: 'S002', name: 'Sample B', values: [2.1, 4.3, 6.5] }
  ]
};

const creator7 = new TSONCreator();
console.log('Complex structure with matrix:');
console.log(creator7.stringify(complexData));
console.log();

console.log('=== All tests completed ===');
