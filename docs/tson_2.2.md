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

## Syntax Rules

### Types
- `object:` (default)
- `array:`
- `table:`
- `maptable:`
- `matrix:`
- `text:`

### Braces and Indentation
- Braced blocks `{ ... }` are the canonical format.
- Indented blocks may be supported but must be fully consistent.
- Mixed styles are discouraged.

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

---

Let me know if you want this exported as a Markdown spec, HTML page, or JSON-based formal grammar for tooling (e.g., JSON Schema, PEG.js, or ANTLR).
