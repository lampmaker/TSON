import { TSONParser } from '../src/tson.js';

const parser = new TSONParser();

const indentedTests = [
  {
    name: "Indented Table",
    input: `scores: table
  name, math, english
  Alice, 95, 87
  Bob, 82, 91`,
    expected: {
      scores: [
        { name: "Alice", math: 95, english: 87 },
        { name: "Bob", math: 82, english: 91 }
      ]
    }
  },

  {
    name: "Indented Maptable", 
    input: `robots: maptable
  id, shape, speed
  fast, circle, 10
  slow, square, 5`,
    expected: {
      robots: {
        fast: { shape: "circle", speed: 10 },
        slow: { shape: "square", speed: 5 }
      }
    }
  },

  {
    name: "Indented Matrix",
    input: `grid: matrix
  1, 2, 3
  4, 5, 6`,
    expected: {
      grid: [
        [1, 2, 3],
        [4, 5, 6]
      ]
    }
  },

  {
    name: "Indented Array",
    input: `colors: array
  red
  green
  blue`,
    expected: {
      colors: ["red", "green", "blue"]
    }
  },

  {
    name: "Indented Text Block",
    input: `description: text
  This is multiline
  text without braces`,
    expected: {
      description: "This is multiline\ntext without braces"
    }
  },

  {
    name: "Mixed Indented and Braced",
    input: `data1: table {
  x, y;
  1, 2;
}
data2: table
  a, b
  3, 4`,
    expected: {
      data1: [{ x: 1, y: 2 }],
      data2: [{ a: 3, b: 4 }]
    }
  }
];

console.log('🔧 TSON Indented Block Tests\n');

let passed = 0;
let failed = 0;

indentedTests.forEach((test, index) => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Test ${index + 1}: ${test.name}`);
  console.log(`${'='.repeat(50)}`);
  
  console.log('\n📝 INPUT:');
  console.log(test.input);
  
  // Check for errors
  const errors = parser.check(test.input);
  if (errors.length > 0) {
    console.log('\n❌ SYNTAX ERRORS:');
    errors.forEach(error => console.log(`  • ${error}`));
    failed++;
    return;
  }
  
  // Parse and compare
  const actual = parser.parse(test.input);
  const actualJson = JSON.stringify(actual, null, 2);
  const expectedJson = JSON.stringify(test.expected, null, 2);
  
  console.log('\n📊 ACTUAL:');
  console.log(actualJson);
  
  console.log('\n🎯 EXPECTED:');
  console.log(expectedJson);
  
  if (actualJson === expectedJson) {
    console.log('\n✅ PASSED');
    passed++;
  } else {
    console.log('\n❌ FAILED');
    failed++;
  }
});

console.log(`\n${'='.repeat(50)}`);
console.log(`📊 INDENTED BLOCK RESULTS: ${passed} passed, ${failed} failed`);
console.log(`${'='.repeat(50)}`);

if (failed === 0) {
  console.log('🎉 All indented block tests passed!');
} else {
  console.log(`⚠️  ${failed} test(s) failed.`);
}
