const fs = require('fs');
const path = require('path');

const docsDir = path.resolve(__dirname, '../src/docs');
const outputFile = path.resolve(__dirname, '../src/generated/data.js');

function toSnakeCase(str) {
  return str.trim().toLowerCase().replace(/\s+/g, '_');
}

const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.txt'));

const result = [];

for (const file of files) {
  const version = path.basename(file, '.txt');
  const content = fs.readFileSync(path.join(docsDir, file), 'utf-8');

  const lines = content.split('\n').map(line => line.trim()).filter(Boolean);
  for (const line of lines) {
    const match = line.match(/^- ([\w\s]+):(.+)$/i);
    if (match) {
      const type = toSnakeCase(match[1]);
      const text = match[2].trim();
      result.push({ version, type, text });
    }
  }
}

const jsOutput = `export const changeLogs = ${JSON.stringify(result, null, 2)};`;
fs.writeFileSync(outputFile, jsOutput, 'utf-8');

console.log(`✅ Data written to ${outputFile}`);
