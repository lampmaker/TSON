import { TSONParser } from '../src/tson.js';

const parser = new TSONParser();

const testCases = [
  {
    name: "Basic Primitives",
    input: `name: "Alice"
age: 30
active: true
score: null`,
    expected: {
      name: "Alice",
      age: 30,
      active: true,
      score: null
    }
  },

  {
    name: "JSON Objects (Compatibility)",
    input: `{"name": "Bob", "age": 25}`,
    expected: { name: "Bob", age: 25 }
  },

  {
    name: "JSON Arrays (Compatibility)", 
    input: `[1, "hello", true, null]`,
    expected: [1, "hello", true, null]
  },

  {
    name: "Mixed JSON and TSON",
    input: `person: {"name": "Charlie", "hobbies": ["reading"]}
count: 42`,
    expected: {
      person: { name: "Charlie", hobbies: ["reading"] },
      count: 42
    }
  },

  {
    name: "Array Block - Simple",
    input: `colors: array {
  red
  green
  blue
}`,
    expected: { colors: ["red", "green", "blue"] }
  },

  {
    name: "Array Block - Mixed Types",
    input: `data: array {
  100
  "text"
  true
  null
}`,
    expected: { data: [100, "text", true, null] }
  },

  {
    name: "Array Block - Inline",
    input: `items: array { one, two, three }`,
    expected: { items: ["one", "two", "three"] }
  },

  {
    name: "Array Block - Empty",
    input: `empty: array {}`,
    expected: { empty: [] }
  },

  {
    name: "Table - Basic",
    input: `scores: table {
  name, math, english;
  Alice, 95, 87;
  Bob, 82, 91;
}`,
    expected: {
      scores: [
        { name: "Alice", math: 95, english: 87 },
        { name: "Bob", math: 82, english: 91 }
      ]
    }
  },

  {
    name: "Table - Space Delimited",
    input: `data: table {
  x y z;
  1 2 3;
  4 5 6;
}`,
    expected: {
      data: [
        { x: 1, y: 2, z: 3 },
        { x: 4, y: 5, z: 6 }
      ]
    }
  },

  {
    name: "Table - Empty",
    input: `empty_table: table {}`,
    expected: { empty_table: {} }
  },

  {
    name: "Maptable - Basic",
    input: `robots: maptable {
  id, shape, speed;
  fast, circle, 10;
  slow, square, 5;
}`,
    expected: {
      robots: {
        fast: { shape: "circle", speed: 10 },
        slow: { shape: "square", speed: 5 }
      }
    }
  },

  {
    name: "Maptable - Single Column Data",
    input: `lookup: maptable {
  key, value;
  red, 255;
  green, 128;
}`,
    expected: {
      lookup: {
        red: { value: 255 },
        green: { value: 128 }
      }
    }
  },

  {
    name: "Matrix - Basic",
    input: `points: matrix {
  1, 2, 3
  4, 5, 6
  7, 8, 9
}`,
    expected: {
      points: [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ]
    }
  },

  {
    name: "Matrix - Space Delimited",
    input: `grid: matrix {
  1 0 1
  0 1 0
}`,
    expected: {
      grid: [
        [1, 0, 1],
        [0, 1, 0]
      ]
    }
  },

  {
    name: "Text Block - Multiline",
    input: `description: text {
  This is a long
  multiline description
  with no escaping needed.
}`,
    expected: {
      description: "This is a long\nmultiline description\nwith no escaping needed."
    }
  },

  {
    name: "Text Block - Single Line",
    input: `note: text {
  Just one line here
}`,
    expected: { note: "Just one line here" }
  },

  {
    name: "Text Block - Empty",
    input: `empty_text: text {}`,
    expected: { empty_text: "" }
  },

  {
    name: "Nested Objects - Braces",
    input: `config: {
  database: {
    host: "localhost"
    port: 5432
  }
  cache: {
    enabled: true
  }
}`,
    expected: {
      config: {
        database: { host: "localhost", port: 5432 },
        cache: { enabled: true }
      }
    }
  },

  {
    name: "Nested Objects - Indentation",
    input: `server:
    host: "127.0.0.1"
    port: 8080
    ssl:
        enabled: false
        cert: null`,
    expected: {
      server: {
        host: "127.0.0.1",
        port: 8080,
        ssl: { enabled: false, cert: null }
      }
    }
  },

  {
    name: "Comments - Full Line and Indented",
    input: `# Configuration file
name: "test"
  # This is indented
age: 25
# End comment`,
    expected: { name: "test", age: 25 }
  },

  {
    name: "Complex Nested Structure",
    input: `game: {
  players: array {
    "Alice"
    "Bob"
  }
  scores: table {
    player, round1, round2;
    Alice, 100, 150;
    Bob, 80, 120;
  }
  settings: {
    difficulty: "hard"
    timer: 60
  }
}`,
    expected: {
      game: {
        players: ["Alice", "Bob"],
        scores: [
          { player: "Alice", round1: 100, round2: 150 },
          { player: "Bob", round1: 80, round2: 120 }
        ],
        settings: { difficulty: "hard", timer: 60 }
      }
    }
  },

  {
    name: "Quoted Keys and Values",
    input: `"user name": "John Doe"
"complex key": "complex value"
"numbers": "123"`,
    expected: {
      "user name": "John Doe",
      "complex key": "complex value",
      "numbers": "123"
    }
  },

  {
    name: "Mixed Delimiters in Tables",
    input: `data: table {
  a, b, c;
  1 2 3;
  4, 5, 6
}`,
    expected: {
      data: [
        { a: 1, b: 2, c: 3 },
        { a: 4, b: 5, c: 6 }
      ]
    }
  },

  {
    name: "Numbers - Various Formats",
    input: `integers: 42
floats: 3.14159
negative: -17
zero: 0`,
    expected: {
      integers: 42,
      floats: 3.14159,
      negative: -17,
      zero: 0
    }
  },

  {
    name: "Empty Structures",
    input: `empty_obj: {}
empty_arr: []
empty_array_block: array {}
empty_text_block: text {}`,
    expected: {
      empty_obj: {},
      empty_arr: [],
      empty_array_block: [],
      empty_text_block: ""
    }
  },

  {
    name: "Single Character Values",
    input: `a: 1
b: "x"
c: true`,
    expected: { a: 1, b: "x", c: true }
  }
];

console.log('🧪 TSON Comprehensive Test Suite\n');

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Test ${index + 1}: ${test.name}`);
  console.log(`${'='.repeat(60)}`);
  
  console.log('\n📝 INPUT:');
  console.log(test.input);
  
  console.log('\n🎯 EXPECTED:');
  console.log(JSON.stringify(test.expected, null, 2));
  
  // Check for syntax errors
  const errors = parser.check(test.input);
  if (errors.length > 0) {
    console.log('\n❌ SYNTAX ERRORS:');
    errors.forEach(error => console.log(`  • ${error}`));
    failed++;
    return;
  }
  
  // Parse and get actual result
  const actual = parser.parse(test.input);
  console.log('\n📊 ACTUAL:');
  console.log(JSON.stringify(actual, null, 2));
  
  // Compare results
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(test.expected);
  
  if (actualJson === expectedJson) {
    console.log('\n✅ PASSED');
    passed++;
  } else {
    console.log('\n❌ FAILED - Results do not match');
    console.log('\nDifferences:');
    console.log(`Expected: ${expectedJson}`);
    console.log(`Actual:   ${actualJson}`);
    failed++;
  }
});

console.log(`\n${'='.repeat(60)}`);
console.log(`📊 FINAL RESULTS: ${passed} passed, ${failed} failed`);
console.log(`Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
console.log(`${'='.repeat(60)}`);

if (failed === 0) {
  console.log('🎉 All tests passed!');
} else {
  console.log(`⚠️  ${failed} test(s) failed. Review the output above.`);
}
