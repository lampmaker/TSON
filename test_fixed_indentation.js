import { TSONParser } from './src/tson.js';

// Create a fixed version of the parser with proper indentation handling
class FixedTSONParser extends TSONParser {
  parse(text) {
    this._reset(text);

    // Handle root-level JSON arrays and objects
    const trimmedText = text.trim();
    if (trimmedText.startsWith('[') || trimmedText.startsWith('{')) {
      try {
        // Try parsing as JSON first
        return JSON.parse(text);
      } catch (e) {
        // Fall back to TSON parsing
      }
    }

    while (this.lineIndex < this.lines.length) {
      const line = this.lines[this.lineIndex];
      const trimmed = line.trim();
      const indent = line.match(/^\s*/)[0].length;

      if (!trimmed || trimmed.startsWith("#")) {
        this.lineIndex++;
        continue;
      }

      if (trimmed === "}" || trimmed === "]") {
        if (this.contextStack.length > 1) {
          const ctx = this._currentContext();
          // Handle completion of typed blocks
          if (ctx && ctx.type) {
            // For text blocks, make sure we don't treat content lines as errors
            if (ctx.type !== "text") {
              this._finalizeTypedBlock(ctx);
            }
          }
          this.contextStack.pop();
        } else {
          this.errors.push(`Unexpected closing brace at line ${this.lineIndex + 1}`);
        }
        this.lineIndex++;
        continue;
      }

      // FIXED: Always check indentation context before processing any line
      this._adjustContextStack(indent);

      if (trimmed.includes(":")) {
        // Handle comma-separated pairs on the same line (JSON style)
        const pairs = this._splitPairs(trimmed);
        for (const pair of pairs) {
          const splitResult = pair.split(/:(.+)/);
          const key = splitResult[0]?.trim() || '';
          const rest = splitResult[1]?.trim() || '';
          this._processKeyValue(key, rest, indent);
        }
      } else {
        this._processContinuation(indent, trimmed);
      }

      this.lineIndex++;
    }

    // Finalize any remaining typed blocks at end of file
    while (this.contextStack.length > 1) {
      const ctx = this._currentContext();
      if (ctx && ctx.type) {
        this._finalizeTypedBlock(ctx);
      }
      this.contextStack.pop();
    }

    return this.errors.length ? null : this.result;
  }

  // NEW: Properly adjust context stack based on indentation
  _adjustContextStack(currentIndent) {
    // Don't pop the root context (index 0)
    while (this.contextStack.length > 1) {
      const ctx = this.contextStack[this.contextStack.length - 1];
      
      // Check if we should pop this context
      if (this._shouldPopContext(ctx, currentIndent)) {
        // Finalize typed blocks before popping
        if (ctx.type && ctx.type !== "text") {
          this._finalizeTypedBlock(ctx);
        }
        this.contextStack.pop();
      } else {
        break;
      }
    }
  }

  // NEW: Determine if a context should be popped based on indentation
  _shouldPopContext(ctx, currentIndent) {
    // For typed blocks (array, table, etc.), only pop when explicitly closed or at same/lower indent
    if (ctx.type && !ctx.indentedObject && !ctx.indentedBlock) {
      return false; // Braced blocks are only closed by explicit braces
    }
    
    // For indented objects or indented typed blocks
    if (ctx.indentedObject || ctx.indentedBlock) {
      // Pop if current line is at same or lower indentation than the context
      return currentIndent <= ctx.indent;
    }
    
    // For regular object contexts, pop if at same or lower indentation
    return currentIndent <= ctx.indent;
  }

  // UPDATED: Simplified _processContinuation since indentation is handled elsewhere
  _processContinuation(indent, trimmed) {
    const ctx = this._currentContext();
    if (!ctx) {
      this.errors.push(`No valid context at line ${this.lineIndex + 1}`);
      return;
    }
    
    const type = ctx.type;

    // Handle non-typed contexts (regular objects)
    if (!type || ctx.indentedObject) {
      // Process this line in the correct context
      if (trimmed && trimmed.includes(":")) {
        const pairs = this._splitPairs(trimmed);
        for (const pair of pairs) {
          const splitResult = pair.split(/:(.+)/);
          const key = splitResult[0]?.trim() || '';
          const rest = splitResult[1]?.trim() || '';
          this._processKeyValue(key, rest, indent);
        }
        return;
      }
      return;
    }

    // Handle typed block content
    if (type === "text") {
      const currentText = ctx.value[ctx.targetKey] || "";
      ctx.value[ctx.targetKey] = currentText + (currentText ? "\n" : "") + trimmed;
      return;
    }

    if (type === "array") {
      ctx.value[ctx.targetKey].push(this._autoConvert(trimmed));
      return;
    }

    // Handle table/matrix/maptable data
    const line = trimmed.replace(/;$/, "");
    const cells = this._splitCells(line);

    if (type === "matrix") {
      // Matrix has no headers, all rows are data
      if (cells.length > 0) {
        ctx.rows.push(cells);
      }
    } else if (!ctx.headers) {
      // Table and maptable have headers
      ctx.headers = cells;
    } else if (cells.length > 0) {
      ctx.rows.push(cells);
    }

    // Check if this is the end of the block
    const nextLine = this.lines[this.lineIndex + 1];
    const nextTrimmed = nextLine ? nextLine.trim() : "";
    const nextIndent = nextLine ? nextLine.match(/^\s*/)[0].length : 0;
    
    let blockEnd = false;
    
    if (ctx.indentedBlock) {
      // For indented blocks, end when indentation decreases or at end of file
      blockEnd = !nextLine || 
                 nextTrimmed === "" ||
                 nextTrimmed.startsWith("#") ||
                 nextIndent <= ctx.indent;
    } else {
      // For braced blocks, end at closing brace or explicit markers
      blockEnd = !nextLine || 
                 nextTrimmed === "}" || 
                 nextTrimmed === "]" ||
                 (nextLine && nextTrimmed && !nextLine.startsWith(" ") && !nextLine.startsWith("\t") && nextTrimmed.length > 0 && !nextTrimmed.startsWith("#"));
    }

    if (blockEnd && ((ctx.headers && !ctx.isTextBlock) || (type === "matrix" && ctx.rows.length > 0))) {
      this._finalizeTypedBlock(ctx);
      // Don't pop context here - let the closing brace or natural end handle it
    }
  }
}

// Test the fixed parser
const parser = new FixedTSONParser();

const testCases = [
  {
    name: "Original problematic case",
    input: `name: "Alice"
age: 30
workdays: 
   monday: true
   tuesday: false
kids: 3`
  },
  {
    name: "Multiple nested levels",
    input: `root: value
level1:
  item1: value1
  nested:
    deep1: value
    deep2: value
  item2: value2
back_to_root: value`
  },
  {
    name: "Mixed with typed blocks",
    input: `person: "Alice"
scores: array {
  95
  87
  92
}
metadata:
  created: "2023"
  tags:
    important: true
    priority: high
final: done`
  },
  {
    name: "Consistent minimal indentation",
    input: `name: "Bob"
work:
  monday: true
  tuesday: false
age: 25`
  }
];

console.log("=== Testing Fixed TSON Parser ===\n");

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log("Input:");
  console.log(testCase.input);
  console.log("\nResult:");
  
  const result = parser.parse(testCase.input);
  console.log(JSON.stringify(result, null, 2));
  
  const errors = parser.check(testCase.input);
  if (errors.length > 0) {
    console.log("Errors:", errors);
  }
  
  console.log("\n" + "=".repeat(60) + "\n");
});
