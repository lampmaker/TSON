# 📘 TSON 2.2 Formal Specification

## Overview
TSON (Typed Structured Object Notation) is a human-friendly, compact superset of JSON designed for structured data representation. It introduces concise notation for tables, arrays, and blocks while preserving full compatibility with JSON.

- All valid **JSON** is valid **TSON**.
- TSON adds **typed blocks**, **minimal syntax**, and **optional quotes**, reducing verbosity for structured data.

## Core Concepts

### 🔹 JSON Compatibility
- JSON objects `{ "key": value }`, arrays `[1, 2, 3]`, numbers, booleans, null, and strings are all valid TSON.
- Quoted keys and values are supported.

### 🔹 TSON Enhancements
TSON supports these additional features:

#### 1. Unquoted keys
```tson
name: "Alice"
age: 30
```

#### 2. Type-declared blocks
```tson
colors: array {
  red
  green
  blue
}
```

#### 3. Structured tables
```tson
strokes: table {
  x, y, pressure;
  10, 20, 0.3;
  11, 22, 0.4;
}
```

#### 4. Named object maps (`maptable`)
```tson
types: maptable {
  color, y;
  red,   10;
  blue,  11;
}
```
Parses as:
```js
{
  red: { y: 10 },
  blue: { y: 11 }
}
```

#### 5. Matrices
```tson
points: matrix {
  1, 2, 3
  4, 5, 6
}
```

#### 6. Multiline text blocks
```tson
description: text {
  This is a multiline
  paragraph with no
  quotes or escaping.
}
```

> **⚠️ Important:** Text blocks **always require braces** (`text { ... }`), even when using indented block syntax elsewhere. This design choice prevents ambiguity when multiline text contains special characters like colons, tabs, or other TSON syntax that could be misinterpreted.

**Example of why braces are required:**
```tson
# Safe - unambiguous with braces
content: text {
  name: John Doe
  age: 30
  	status: active
}

# Would be ambiguous without braces - looks like nested object!
# content: text
#   name: John Doe
#   age: 30
```

## Syntax Rules

### Block Type Declaration Format
**Critical Rule:** Block type declarations must appear **immediately after the colon** on the same line:

```tson
# ✅ CORRECT SYNTAX
key: blocktype {
  content...
}

# Examples:
robots: maptable {
  id shape speed
  fast circle 10
}

scores: table {
  name grade
  Alice 95
}

data: matrix {
  1 2 3
  4 5 6
}

# ❌ INCORRECT SYNTAX - Parser Error
key:
  blocktype {
    content...
  }
```

**Rationale:** This syntax requirement ensures unambiguous parsing. The block type is part of the value assignment, not a separate statement.

### Types
- `object:` (default)
- `array:`
- `table:`
- `maptable:`
- `matrix:`
- `text:`

### Braces and Indentation
- Braced blocks `{ ... }` are the canonical format.
- Indented blocks may be supported for most block types but must be fully consistent.
- **Exception**: Text blocks (`text { ... }`) **always require braces** for safety and unambiguous parsing.
- Mixed styles are discouraged.

**Indented block support:**
- ✅ `array`, `table`, `maptable`, `matrix` - support both braced and indented syntax
- ❌ `text` - always requires braces to prevent ambiguity

### Delimiters
- Within tables and matrices:
  - Columns may be separated by space **or** commas.
  - Rows may be separated by newline or `;`.
- Commas are **optional** and **ignored** outside arrays or JSON-like objects.

### Quoting
- Keys and strings may use `"..."` (optional if no spaces/symbols).
- Numbers and booleans are auto-parsed.

---

## 🧠 Machine-Readable Grammar (AI / Tooling)

```ebnf
TSON        ::= WS? VALUE WS?
VALUE       ::= OBJECT | ARRAY | TABLE | MAPTABLE | MATRIX | TEXTBLOCK | PRIMITIVE

OBJECT      ::= '{' PAIR (',' PAIR)* '}'
PAIR        ::= KEY ':' VALUE

ARRAY       ::= '[' VALUE (',' VALUE)* ']'
TABLE       ::= 'table' BLOCK_TABLE
MAPTABLE    ::= 'maptable' BLOCK_MAPTABLE
MATRIX      ::= 'matrix' BLOCK_MATRIX
TEXTBLOCK   ::= 'text' '{' TEXT_CONTENT '}'

BLOCK_TABLE     ::= '{' HEADER ROW+ '}'
BLOCK_MAPTABLE  ::= '{' HEADER ROW+ '}'
BLOCK_MATRIX    ::= '{' ROW+ '}'

HEADER      ::= CELL (SEP CELL)* ';'?
ROW         ::= CELL (SEP CELL)* ';'?
CELL        ::= PRIMITIVE

PRIMITIVE   ::= BOOLEAN | NUMBER | QUOTED_STRING | UNQUOTED_LITERAL
BOOLEAN     ::= 'true' | 'false'
NUMBER      ::= /-?[0-9]+(\.[0-9]+)?/
QUOTED_STRING ::= '"' (ESCAPED | [^"])* '"'
UNQUOTED_LITERAL ::= /[^\s{},:\[\];]+/

KEY         ::= UNQUOTED_LITERAL | QUOTED_STRING
SEP         ::= WS+ | ','
WS          ::= /[ \t]*/
TEXT_CONTENT::= /.*/ (multiline string)
```

## 🔄 TSONCreator - Bidirectional Conversion

Starting with v2.2.4, TSON includes a `TSONCreator` class for converting JavaScript objects back to TSON format.

### Features
- **Structure Detection**: Automatically converts arrays of objects to tables
- **Matrix Recognition**: Detects 2D numeric arrays and formats as matrices  
- **Configurable Formatting**: Customizable indentation, quoting, and block styles
- **Indentation Options**: Supports both spaces and tabs with configurable sizing (v2.2.9+)

### Usage
```javascript
import { TSONCreator } from 'tson/creator';

const creator = new TSONCreator({
  indentType: 'spaces',     // 'spaces' | 'tabs'
  indentSize: 2,            // number of spaces
  blockStyle: 'indented',   // 'indented' | 'braced'
  arrayThreshold: 3         // convert to array block if >=3 items
});

const jsObject = {
  name: 'Alice',
  scores: [95, 87, 92, 88, 91],
  data: [
    { x: 1, y: 2 },
    { x: 3, y: 4 }
  ]
};

console.log(creator.stringify(jsObject));
// Output:
// name: Alice
// scores: array
//   95
//   87
//   92
//   88
//   91
// data: table
//   x y
//   1 2
//   3 4
```

---

Let me know if you want this exported as a Markdown spec, HTML page, or JSON-based formal grammar for tooling (e.g., JSON Schema, PEG.js, or ANTLR).
