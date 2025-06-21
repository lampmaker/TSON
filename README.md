# 📘 TSON 2.2 - Typed Structured Object Notation

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)

TSON (Typed Structured Object Notation) is a **human-friendly, compact superset of JSON** designed for structured data representation. It introduces concise notation for tables, arrays, and blocks while preserving **full compatibility with JSON**.

## ✨ Key Features

- 🔄 **100% JSON Compatible** - All valid JSON is valid TSON
- 📋 **Structured Tables** - First-class support for tabular data
- 🗺️ **Map Tables** - Convert tables to key-value object maps
- 🔢 **Matrices** - 2D arrays without headers
- 📝 **Text Blocks** - Multiline strings without escaping
- 🏷️ **Unquoted Keys** - Cleaner syntax for simple identifiers
- 🎯 **Type Declarations** - Explicit `array`, `table`, `matrix`, `text` blocks

## 📖 Quick Examples

### Basic Syntax
```tson
name: "Alice"
age: 30
active: true
```
**Parses to:**
```javascript
{
  name: "Alice",
  age: 30,
  active: true
}
```

### Array Blocks
```tson
colors: array {
  red
  green
  blue
}
```
**Parses to:**
```javascript
{
  colors: ["red", "green", "blue"]
}
```

### Structured Tables
```tson
strokes: table {
  x, y, pressure;
  10, 20, 0.3;
  11, 22, 0.4;
}
```
**Parses to:**
```javascript
{
  strokes: [
    { x: 10, y: 20, pressure: 0.3 },
    { x: 11, y: 22, pressure: 0.4 }
  ]
}
```

### Map Tables
```tson
robots: maptable {
  id, shape, count;
  fast, circle, 2;
  slow, square, 1;
}
```
**Parses to:**
```javascript
{
  robots: {
    fast: { shape: "circle", count: 2 },
    slow: { shape: "square", count: 1 }
  }
}
```

### Matrices
```tson
points: matrix {
  1, 2, 3
  4, 5, 6
}
```
**Parses to:**
```javascript
{
  points: [
    [1, 2, 3],
    [4, 5, 6]
  ]
}
```

### Text Blocks
```tson
description: text {
  This is a multiline
  paragraph with no
  quotes or escaping needed.
}
```
**Parses to:**
```javascript
{
  description: "This is a multiline\nparagraph with no\nquotes or escaping needed."
}
```

> **⚠️ Important:** Text blocks **always require braces** (`text { ... }`), even when using indented block syntax. This prevents ambiguity when multiline text contains colons, tabs, or other characters that could be misinterpreted as TSON syntax.

```tson
# Safe - no ambiguity possible
content: text {
  name: John
  age: 30
  	details: sensitive info
}

# Indented blocks work for other types
data: table
  key value
  a   1
  b   2
```

## 🚀 Installation

```bash
npm install tson
```

## 💻 Usage

### ES Modules
```javascript
import { TSONParser } from 'tson';

const parser = new TSONParser();

// Parse TSON text
const result = parser.parse(`
  name: Alice
  scores: array { 95, 87, 92 }
  data: table {
    x, y;
    1, 2;
    3, 4;
  }
`);

console.log(result);
// Output: {
//   name: "Alice",
//   scores: [95, 87, 92],
//   data: [{x: 1, y: 2}, {x: 3, y: 4}]
// }
```

### Validation
```javascript
// Check for syntax errors
const errors = parser.check(tsonText);
if (errors.length === 0) {
  console.log('✅ Valid TSON');
} else {
  console.log('❌ Errors:', errors);
}
```

### Browser Usage
```html
<!DOCTYPE html>
<html>
<head>
    <script type="module">
        import { TSONParser } from './src/tson.js';
        
        const parser = new TSONParser();
        const result = parser.parse('name: "World"');
        console.log(result); // { name: "World" }
    </script>
</head>
</html>
```

## 📋 Syntax Rules

### JSON Compatibility
- All standard JSON syntax works unchanged
- Objects: `{ "key": "value" }`
- Arrays: `[1, 2, 3]`
- Primitives: strings, numbers, booleans, null

### TSON Extensions

#### Unquoted Keys
```tson
name: "Alice"        # Instead of "name": "Alice"
age: 30             # Numbers, booleans auto-parsed
```

#### Comments
```tson
# Full-line comments
  # Indented comments also work
name: "Alice"
```

#### Type Declarations
- `array { ... }` - Collection of values
- `table { ... }` - Tabular data with headers
- `maptable { ... }` - Table converted to object map
- `matrix { ... }` - 2D array without headers  
- `text { ... }` - Multiline string block

> **📝 Text Block Requirements**: Unlike other block types, text blocks **always require braces** for safety. This prevents ambiguity when text content contains TSON syntax characters like colons `:`, tabs, or nested structures.

#### Indented Block Support
Most block types support both braced and indented syntax:

```tson
# Braced syntax
data: table {
  name age
  Alice 30
  Bob 25
}

# Indented syntax (same result)
data: table
  name age
  Alice 30
  Bob 25

# Text blocks ALWAYS need braces (for safety)
content: text {
  This can contain: colons and	tabs safely
  Without being misinterpreted as TSON syntax
}
```

#### Flexible Delimiters
- **Tables/Matrices**: Columns separated by spaces or commas
- **Rows**: Separated by newlines or semicolons `;`
- **Objects**: Commas optional outside arrays

## 🔧 API Reference

### `TSONParser`

#### Methods

##### `parse(text: string): object | null`
Parses TSON text and returns the resulting object. Returns `null` if there are syntax errors.

##### `check(text: string): string[]`
Validates TSON text and returns an array of error messages. Empty array means valid syntax.

## 📄 Documentation

- [`docs/tson_2.2.md`](docs/tson_2.2.md) - Complete formal specification and EBNF grammar
- [`docs/REVISIONS.md`](docs/REVISIONS.md) - Version history and change tracking

## 🧪 Development

```bash
# Clone the repository
git clone https://github.com/yourusername/tson.git
cd tson

# Install dependencies (if any)
npm install

# Run tests
npm test

# Start development server
npm start
```

## 📁 Project Structure

```
├── src/
│   └── tson.js          # Main parser implementation
├── docs/
│   ├── tson_2.2.md      # Formal specification
│   └── tsonspec.txt     # EBNF grammar
├── test/
│   └── test.js          # Test suite
├── index.html           # Browser demo
├── package.json
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related

- [JSON](https://www.json.org/) - The original data format
- [YAML](https://yaml.org/) - Another human-readable data format
- [TOML](https://toml.io/) - Configuration file format

---

**TSON 2.2** - Making structured data more human-friendly while staying JSON-compatible.
