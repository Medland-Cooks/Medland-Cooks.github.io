const fs = require('fs');

const csvPath = 'c:\\Users\\dajoh\\Documents\\code\\Medland-Cooks.github.io\\ocr-raw-scores.csv';
const csv = fs.readFileSync(csvPath, 'utf8');
const lines = csv.trim().split('\n');

// Parse header and data
const header = lines[0];
const data = lines.slice(1).map((line) => {
  const parts = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') inQuotes = !inQuotes;
    else if (c === ',' && !inQuotes) {
      parts.push(current);
      current = '';
      continue;
    }
    current += c;
  }
  parts.push(current);
  return {
    line: line,
    score: parseFloat(parts[1])
  };
});

// Sort by score descending
data.sort((a, b) => b.score - a.score);

// Write back
const output = [header, ...data.map(d => d.line)].join('\n');
fs.writeFileSync(csvPath, output);

console.log('Sorted by Score (descending). Total records: ' + data.length);
