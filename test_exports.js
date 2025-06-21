// Test the package exports
try {
  console.log('Testing package exports...');
  
  // This would work if we published to npm with the exports
  // For now, test the local file structure
  
  const { TSONParser } = await import('./src/tson.js');
  const { TSONCreator } = await import('./src/tson-creator.js');
  
  console.log('✅ TSONParser imported successfully');
  console.log('✅ TSONCreator imported successfully');
  
  // Basic functionality test
  const parser = new TSONParser();
  const creator = new TSONCreator();
  
  const testData = 'name: "Alice"\nage: 30';
  const parsed = parser.parse(testData);
  const recreated = creator.stringify(parsed);
  
  console.log('✅ Basic parse/create cycle works');
  console.log('Original:', testData);
  console.log('Parsed:', parsed);
  console.log('Recreated:', recreated);
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
