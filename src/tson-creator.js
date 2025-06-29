/*
 * AI-Generated Project: This project was realized as a test of GitHub Copilot Agent, and as such, 99% of the code, documentation and is AI-generated. It demonstrates the capabilities of AI-assisted software development for creating complete, functional programming language implementations.
 * IN OTHER WORDS: Use at your own risk — lampmaker
 * 
 * GitHub: https://github.com/lampmaker/TSON
 */

export class TSONCreator {  constructor(settings = {}) {
    this.settings = {
      // Block style preference
      blockStyle: 'indented',           // 'indented' | 'braced' | 'auto'
        // Delimiters
      tableDelimiter: 'space',          // 'space' | 'comma' | 'tab' | 'auto'
      rowTerminator: 'none',            // 'none' | 'semicolon'
      
      // Formatting
      indentType: 'spaces',             // 'spaces' | 'tabs'
      indentSize: 2,                    // number of spaces (ignored for tabs)
      quoteKeys: 'minimal',             // 'minimal' | 'always' | 'never'
      quoteValues: 'minimal',           // 'minimal' | 'always' | 'never'      
      // Structure detection thresholds
      arrayThreshold: 3,                // Convert to array block if >=3 items
      tableThreshold: 2,                // Convert to table if >=2 objects with shared keys
      maptableThreshold: 2,             // Convert to maptable if appropriate
        // Missing property handling
      fillMissingProperties: false,     // true: use null, false: omit columns
      missingValue: null,               // value to use for missing properties
      
      ...settings
    };
      // Compute the actual indent string based on settings
    this.indentString = this.settings.indentType === 'tabs' ? '\t' : ' '.repeat(this.settings.indentSize);
  }

  _getTableDelimiter() {
    switch (this.settings.tableDelimiter) {
      case 'space': return ' ';
      case 'comma': return ', ';
      case 'tab': return '\t';
      default: return ' '; // fallback to space
    }
  }stringify(obj, currentIndent = 0) {
    if (obj === null) return 'null';
    if (obj === undefined) return 'null';
    if (typeof obj === 'boolean') return obj.toString();
    if (typeof obj === 'number') return obj.toString();
    if (typeof obj === 'string') {
      return this._handleString(obj);
    }
    
    if (Array.isArray(obj)) {
      return this._handleArray(obj, currentIndent);
    }
    
    if (typeof obj === 'object') {
      return this._handleObject(obj, currentIndent);
    }
    
    return JSON.stringify(obj);
  }

  _handleString(str) {    // Handle multiline strings as text blocks
    if (str.includes('\n')) {
      const lines = str.split('\n');
      let result = 'text {\n';
      lines.forEach(line => {
        result += this.indentString + line + '\n';
      });
      result += '}';
      return result;
    }
    
    // Quote if necessary
    if (this._shouldQuote(str)) {
      return `"${str}"`;
    }
    return str;
  }

  _shouldQuote(str) {
    if (this.settings.quoteValues === 'always') return true;
    if (this.settings.quoteValues === 'never') return false;
    
    // Quote if contains spaces, special chars, or looks like other types
    return /[\s,;:{}[\]"'#]/.test(str) || 
           str === 'true' || str === 'false' || str === 'null' ||
           !isNaN(Number(str));
  }
  _shouldQuoteKey(key) {
    if (this.settings.quoteKeys === 'always') return true;
    if (this.settings.quoteKeys === 'never') return false;
    
    // Quote keys with spaces or special chars
    return /[\s,;:{}[\]"'#]/.test(key);
  }  _handleArray(arr, currentIndent) {
    if (arr.length === 0) return '[]';
    
    // Check for matrix pattern (2D array of numbers)
    if (this._canBeMatrix(arr)) {
      return this._createMatrix(arr, currentIndent);
    }
    
    // Check if can convert to table (array of similar objects)
    if (this._canBeTable(arr)) {
      return this._createTable(arr, currentIndent);
    }
    
    // Check if should convert to array block 
    // Avoid array blocks for arrays that contain other arrays
    if (arr.length >= this.settings.arrayThreshold && 
        !arr.some(item => Array.isArray(item)) && // Don't convert if contains arrays
        arr.every(item => (typeof item !== 'object' || item === null))) {
      return this._createArrayBlock(arr, currentIndent);
    }
    
    // Regular JSON array
    return '[' + arr.map(item => this.stringify(item, currentIndent)).join(', ') + ']';
  }

  _handleObject(obj, currentIndent) {
    if (Object.keys(obj).length === 0) return '{}';
    
    // Priority order: maptable -> table -> regular object
    
    // Check for maptable pattern (object where values are similar objects)
    if (this._canBeMaptable(obj)) {
      return this._createMaptable(obj, currentIndent);
    }
    
    // Check if should be a table (object with array of similar objects)
    const tableCandidate = this._findTableCandidate(obj);
    if (tableCandidate) {
      return this._createObjectWithTable(obj, tableCandidate, currentIndent);
    }
    
    // Regular object
    return this._createRegularObject(obj, currentIndent);
  }
  _canBeTable(arr) {
    return arr.length >= this.settings.tableThreshold &&
           arr.every(item => item && typeof item === 'object' && !Array.isArray(item)) &&
           this._haveSharedKeys(arr);
  }

  _canBeMatrix(arr) {
    // Check if it's a 2D array of numbers with consistent row lengths
    return arr.length >= 2 &&
           arr.every(row => Array.isArray(row) && row.length > 0 && 
                           row.every(item => typeof item === 'number')) &&
           arr.every(row => row.length === arr[0].length);
  }

  _canBeMaptable(obj) {
    const values = Object.values(obj);
    return values.length >= this.settings.maptableThreshold &&
           values.every(val => val && typeof val === 'object' && !Array.isArray(val)) &&
           this._haveSharedKeys(values);
  }

  _haveSharedKeys(objects) {
    if (objects.length < 2) return false;
    
    const allKeys = objects.map(obj => Object.keys(obj));
    const firstKeys = allKeys[0];
    
    // Check if at least 2 keys are shared across most objects
    const sharedKeys = firstKeys.filter(key => 
      allKeys.filter(keys => keys.includes(key)).length >= Math.ceil(objects.length * 0.7)
    );
    
    return sharedKeys.length >= 2;
  }  _createArrayBlock(arr, currentIndent) {
    const indentStr = this.indentString.repeat(currentIndent);
    const itemIndentStr = this.indentString.repeat(currentIndent + 1);
    
    if (this.settings.blockStyle === 'braced') {
      let result = 'array {\n';
      arr.forEach(item => {
        result += itemIndentStr + this.stringify(item, currentIndent + 1) + '\n';
      });
      result += indentStr + '}';
      return result;    } else {
      let result = 'array\n';
      arr.forEach(item => {
        result += itemIndentStr + this.stringify(item, currentIndent + 1) + '\n';
      });
      return result.trimEnd();
    }
  }_createTable(arr, currentIndent) {
    const headers = this._extractHeaders(arr);
    const delimiter = this._getTableDelimiter();
    const indentStr = this.indentString.repeat(currentIndent);
    const itemIndentStr = this.indentString.repeat(currentIndent + 1);
    
    if (this.settings.blockStyle === 'braced') {
      let result = 'table {\n';
      result += itemIndentStr + headers.join(delimiter) + '\n';
      
      arr.forEach(row => {
        const values = headers.map(header => {
          const val = row[header];
          return val !== undefined ? this.stringify(val, currentIndent + 1) : 
                 (this.settings.fillMissingProperties ? this.stringify(this.settings.missingValue, currentIndent + 1) : '');
        });
        result += itemIndentStr + values.join(delimiter) + '\n';
      });
      
      result += indentStr + '}';
      return result;    } else {
      let result = 'table\n';
      result += itemIndentStr + headers.join(delimiter) + '\n';
      
      arr.forEach(row => {
        const values = headers.map(header => {
          const val = row[header];
          return val !== undefined ? this.stringify(val, currentIndent + 1) : 
                 (this.settings.fillMissingProperties ? this.stringify(this.settings.missingValue, currentIndent + 1) : '');
        });
        result += itemIndentStr + values.join(delimiter) + '\n';
      });
      
      return result.trimEnd();
    }
  }
  _createMatrix(arr, currentIndent) {
    const indentStr = this.indentString.repeat(currentIndent);
    const itemIndentStr = this.indentString.repeat(currentIndent + 1);
    
    if (this.settings.blockStyle === 'braced') {
      let result = 'matrix {\n';
      arr.forEach(row => {
        result += itemIndentStr + row.join(' ') + '\n';
      });
      result += indentStr + '}';
      return result;    } else {
      let result = 'matrix\n';
      arr.forEach(row => {
        result += itemIndentStr + row.join(' ') + '\n';
      });
      return result.trimEnd();
    }
  }  _createMaptable(obj, currentIndent) {
    const values = Object.values(obj);
    const headers = ['key', ...this._extractHeaders(values)];
    const delimiter = this._getTableDelimiter();
    const indentStr = this.indentString.repeat(currentIndent);
    const itemIndentStr = this.indentString.repeat(currentIndent + 1);
    
    if (this.settings.blockStyle === 'braced') {
      let result = 'maptable {\n';
      result += itemIndentStr + headers.join(delimiter) + '\n';
      
      Object.entries(obj).forEach(([key, value]) => {
        const rowValues = [this.stringify(key, currentIndent + 1)];
        headers.slice(1).forEach(header => {
          const val = value[header];
          rowValues.push(val !== undefined ? this.stringify(val, currentIndent + 1) : 
                        (this.settings.fillMissingProperties ? this.stringify(this.settings.missingValue, currentIndent + 1) : ''));
        });
        result += itemIndentStr + rowValues.join(delimiter) + '\n';
      });
      
      result += indentStr + '}';
      return result;    } else {
      let result = 'maptable\n';
      result += itemIndentStr + headers.join(delimiter) + '\n';
      
      Object.entries(obj).forEach(([key, value]) => {
        const rowValues = [this.stringify(key, currentIndent + 1)];
        headers.slice(1).forEach(header => {
          const val = value[header];
          rowValues.push(val !== undefined ? this.stringify(val, currentIndent + 1) : 
                        (this.settings.fillMissingProperties ? this.stringify(this.settings.missingValue, currentIndent + 1) : ''));
        });
        result += itemIndentStr + rowValues.join(delimiter) + '\n';
      });
      
      return result.trimEnd();
    }
  }
  _extractHeaders(objects) {
    if (!this.settings.fillMissingProperties) {
      // Only include keys that are present in all objects
      const commonKeys = new Set();
      if (objects.length > 0) {
        const firstKeys = Object.keys(objects[0] || {});
        firstKeys.forEach(key => {
          if (objects.every(obj => obj && obj.hasOwnProperty(key))) {
            commonKeys.add(key);
          }
        });
      }
      return Array.from(commonKeys);
    }
    
    // Original logic for when we fill missing properties
    const allKeys = new Set();
    objects.forEach(obj => {
      if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(key => allKeys.add(key));
      }
    });
    
    // Sort keys by frequency and priority (most common first, with id/name/key types prioritized)
    const keyFreq = {};
    const priorityKeys = new Set(['id', 'name', 'key', 'title', 'type']);
    
    objects.forEach(obj => {
      if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
          keyFreq[key] = (keyFreq[key] || 0) + 1;
        });
      }
    });
    
    return Array.from(allKeys).sort((a, b) => {
      // Prioritize common identifier keys
      const aPriority = priorityKeys.has(a) ? 1000 : 0;
      const bPriority = priorityKeys.has(b) ? 1000 : 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      // Then sort by frequency
      return (keyFreq[b] || 0) - (keyFreq[a] || 0);
    });
  }

  _findTableCandidate(obj) {
    // Look for properties that are arrays of objects
    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value) && this._canBeTable(value)) {
        return key;
      }
    }
    return null;
  }
  _createObjectWithTable(obj, tableKey, currentIndent) {
    const result = [];
    const indentStr = this.indentString.repeat(currentIndent);
    
    Object.entries(obj).forEach(([key, value]) => {
      const quotedKey = this._shouldQuoteKey(key) ? `"${key}"` : key;
      
      if (key === tableKey) {
        // Convert this array to a table
        const tableStr = this._createTable(value, currentIndent + 1);
        result.push(`${quotedKey}: ${tableStr}`);
      } else {
        result.push(`${quotedKey}: ${this.stringify(value, currentIndent + 1)}`);
      }
    });
    
    return result.join('\n' + indentStr);
  }  _createRegularObject(obj, currentIndent) {
    const result = [];
    const indentStr = this.indentString.repeat(currentIndent);
    
    Object.entries(obj).forEach(([key, value]) => {
      const quotedKey = this._shouldQuoteKey(key) ? `"${key}"` : key;
      
      if (Array.isArray(value)) {
        // Handle arrays (might be tables or matrices)
        const arrayStr = this.stringify(value, currentIndent + 1);
        if (arrayStr.startsWith('table') || arrayStr.startsWith('matrix') || arrayStr.startsWith('array')) {
          result.push(`${quotedKey}: ${arrayStr}`);
        } else {
          result.push(`${quotedKey}: ${arrayStr}`);
        }
      } else if (typeof value === 'object' && value !== null) {
        // Check if this nested object should be a maptable
        if (this._canBeMaptable(value)) {
          const maptableStr = this._createMaptable(value, currentIndent + 1);
          result.push(`${quotedKey}: ${maptableStr}`);        } else {
          // Regular nested object
          const nestedObj = this.stringify(value, 0); // Get unindented nested object
          if (nestedObj.includes('\n')) {
            // For multiline nested objects, put them on the next line with proper indentation
            const indentedNestedObj = nestedObj.split('\n').map((line, index) => {
              // Don't indent empty lines
              if (line.trim() === '') return line;
              // Add indentation to all lines
              return this.indentString.repeat(currentIndent + 1) + line;
            }).join('\n');
            result.push(`${quotedKey}:\n${indentedNestedObj}`);
          } else {
            result.push(`${quotedKey}: ${nestedObj}`);
          }
        }
      } else {
        result.push(`${quotedKey}: ${this.stringify(value, currentIndent + 1)}`);
      }
    });
    
    return result.join('\n' + indentStr);
  }
}
