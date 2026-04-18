const fs = require('fs');
const csv = fs.readFileSync('c:\\Users\\dajoh\\Documents\\code\\Medland-Cooks.github.io\\ocr-raw-scores.csv', 'utf8');
const lines = csv.trim().split('\n');
const data = lines.map((line, idx) => {
  if(idx === 0) return null;
  const parts = [];
  let current = '';
  let inQuotes = false;
  for(let i = 0; i < line.length; i++) {
    const c = line[i];
    if(c === '"') inQuotes = !inQuotes;
    else if(c === ',' && !inQuotes) { parts.push(current); current = ''; continue; }
    current += c;
  }
  parts.push(current);
  return { filename: parts[0].replace(/"/g, ''), score: parseFloat(parts[1]), grade: parts[2].replace(/"/g, ''), issues: parts[3] };
}).filter(x=>x);

// Top 30 A-grade files
const topA = data.filter(d => d.grade === 'A').sort((a,b) => b.score - a.score).slice(0, 30);
console.log('Top 30 A-Grade Files:');
topA.forEach((f,i) => console.log((i+1) + '. ' + f.filename + ' (' + f.score + ')'));

console.log('\n\nTop 20 B-Grade Files:');
const topB = data.filter(d => d.grade === 'B').sort((a,b) => b.score - a.score).slice(0, 20);
topB.forEach((f,i) => console.log((i+1) + '. ' + f.filename + ' (' + f.score + ')'));

console.log('\n\nAll C-Grade Files:');
const allC = data.filter(d => d.grade === 'C').sort((a,b) => b.score - a.score);
allC.forEach((f,i) => console.log((i+1) + '. ' + f.filename + ' (' + f.score + ' - Issues: ' + f.issues + ')'));
