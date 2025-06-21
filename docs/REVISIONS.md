# TSON Revisions

## v2.2.9 - June 21, 2025 ✅
- **Added configurable indentation to TSONCreator**
  - New `indentType` setting: 'spaces' | 'tabs'
  - New `indentSize` setting for custom space count
  - New `quoteValues` setting for consistency

## v2.2.8 - June 21, 2025 ✅
- **Fixed TSONCreator nested object indentation bug**
  - Eliminated extra indentation on nested object properties
  - Fixed the tuesday/thursday alignment issue

## v2.2.7 - June 21, 2025 ✅
- Fixed array block parsing to support TSON-style objects with unquoted keys and nested arrays

## v2.2.6 - June 21, 2025 ✅  
- Fixed critical indentation parsing bug - nested objects now properly close when indentation decreases

## v2.2.5 - June 21, 2025 ✅
- Fixed TSONCreator block type placement - now correctly puts block types directly after colons

## v2.2.4 - June 21, 2025 ✅
- **Added TSONCreator class**
  - Bidirectional TSON ↔ JavaScript object conversion
  - Configurable settings for serialization, structure detection, and formatting
  - Auto-detection of tables, matrices, and arrays

## v2.2.3 - June 21, 2025 ✅
- Added support for indented blocks without braces (table, maptable, matrix, array)
- Text blocks still require braces for safety

## v2.2.2 - June 21, 2025 ✅
- Fixed crash when key has no value (undefined rest parameter)

## v2.2.1 - June 21, 2025 ✅
- Added support for indented comments (whitespace before #)

## v2.2.0 - June 21, 2025 ✅
- Initial TSON parser implementation
- Full JSON compatibility 
- All TSON extensions: array, table, maptable, matrix, text blocks
- 6 core tests passing
- Zero dependencies

## Future Plans
- v2.3: Performance optimizations, TypeScript definitions  
- v2.4: Schema validation, bidirectional conversion
- v3.0: Advanced features, potential breaking changes

## Known Issues
- No schema validation
- Limited error context
- No streaming support
