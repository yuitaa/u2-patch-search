const fs = require('fs');
const fm = require('front-matter');
const path = require('path');

const docsDir = path.resolve(__dirname, '../src/docs');
const outputFile = path.resolve(__dirname, '../src/generated/data.js');

function toSnakeCase(str) {
  return str.trim().toLowerCase().replace(/\s+/g, '_');
}

function parseDate(dateStr) {
  const [datePart, timePart] = dateStr.split(' ');
  const [year, month, day] = datePart.split('/');
  let [hour, minute] = timePart.split(':');

  hour = hour.padStart(2, '0');
  minute = minute.padStart(2, '0');

  return `${year}-${month}-${day}T${hour}:${minute}:00+09:00`;
}

const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.md'));

const result = [];
const versions = [];
const types = new Set();

for (const file of files) {
  const version = path.basename(file, '.md');
  const content = fm(fs.readFileSync(path.join(docsDir, file), 'utf-8'));

  const lines = content.body.split('\n').map(line => line.trim()).filter(Boolean);

  const date = parseDate(content.attributes.date);
  const url = content.attributes.url;
  const exp = !!content.attributes.exp;

  versions.push({ version, date, url, exp })

  for (const line of lines) {
    const match = line.match(/^- ([\w\s]+):(.+)$/i);
    if (match) {
      const type = toSnakeCase(match[1]);
      const text = match[2].trim();
      result.push({ version, type, text });
      types.add(type);
    }
  }
}

const jsOutput = `export const fixTypes = ${JSON.stringify(Array.from(types), null, 2)}

export const versions = ${JSON.stringify(versions.sort((a, b) => new Date(a.date) - new Date(b.date)), null, 2)}

export const changeLogs = ${JSON.stringify(result, null, 2)};`;

fs.writeFileSync(outputFile, jsOutput, 'utf-8');

console.log(`✅ Data written to ${outputFile}`);
