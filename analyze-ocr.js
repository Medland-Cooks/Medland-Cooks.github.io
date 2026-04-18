const fs = require('fs');
const path = require('path');
const { createWriteStream } = require('fs');

const recipePath = 'c:\\Users\\dajoh\\Documents\\code\\Medland-Cooks.github.io\\medland-cooks\\resources\\print-recipies';
const outputFile = 'c:\\Users\\dajoh\\Documents\\code\\Medland-Cooks.github.io\\ocr-raw-scores.csv';

function getOCRScore(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let score = 100;
    const issues = [];

    // 1. Character corruption (high-byte characters)
    let garbledCount = 0;
    for (let i = 0; i < content.length; i++) {
      if (content.charCodeAt(i) > 127) {
        garbledCount++;
      }
    }
    if (garbledCount > 5) {
      const penalty = Math.min(garbledCount / 10, 15);
      score -= penalty;
      issues.push('Corrupted');
    }

    // 2. Fractions and units
    const fractionPattern = /\b\d+\s?\/\s?\d+\b/g;
    const fractions = (content.match(fractionPattern) || []).length;

    const unitPattern = /\b(cup|cups|tbsp|tablespoon|tsp|teaspoon|oz|ounce|lb|pound|ml|gram|g)\b/gi;
    const units = (content.match(unitPattern) || []).length;

    if (units === 0) {
      score -= 10;
      issues.push('NoUnits');
    } else if (fractions === 0) {
      score -= 3;
      issues.push('NoFractions');
    } else if (fractions > 3) {
      score += 3;
      issues.push('GoodFractions');
    }

    // 3. Punctuation
    const punctPattern = /[.,;:]/g;
    const punctTotal = (content.match(punctPattern) || []).length;
    const lines = content.split('\n');
    const lineCount = lines.length;

    if (lineCount > 5) {
      const punctPerLine = punctTotal / lineCount;
      if (punctPerLine < 0.1) {
        score -= 5;
        issues.push('LowPunctuation');
      }
    }

    // 4. Common cooking terms
    const cookingTerms = ['butter', 'sugar', 'flour', 'egg', 'salt', 'pepper', 'milk', 'cream', 'oil', 'bake', 'mix', 'combine'];
    let foundTerms = 0;
    for (const term of cookingTerms) {
      if (new RegExp(`\\b${term}\\b`, 'i').test(content)) {
        foundTerms++;
      }
    }

    if (foundTerms < 3) {
      score -= 5;
      issues.push('FewTerms');
    }

    score = Math.max(0, Math.min(100, score));

    return {
      score: Math.round(score * 10) / 10,
      issues: issues.join('|'),
      fractions,
      units,
      lines: lineCount,
      punctuation: punctTotal
    };
  } catch (e) {
    return null;
  }
}

function getGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

// Main execution
console.log('Reading files...');
const files = fs.readdirSync(recipePath).filter(f => 
  fs.statSync(path.join(recipePath, f)).isFile()
).sort();

const fileCount = files.length;
console.log(`Processing ${fileCount} OCR recipe files...`);

const results = [];
let processed = 0;

for (const filename of files) {
  processed++;
  if (processed % 100 === 0) {
    console.log(`  Progress: ${processed} / ${fileCount}`);
  }

  const filePath = path.join(recipePath, filename);
  const scoreData = getOCRScore(filePath);

  if (scoreData) {
    const grade = getGrade(scoreData.score);
    results.push({
      Filename: filename,
      Score: scoreData.score,
      Grade: grade,
      Issues: scoreData.issues,
      Fractions: scoreData.fractions,
      Units: scoreData.units,
      Lines: scoreData.lines,
      Punctuation: scoreData.punctuation
    });
  }
}

// Export to CSV
const csvContent = [
  ['Filename', 'Score', 'Grade', 'Issues', 'Fractions', 'Units', 'Lines', 'Punctuation'],
  ...results.map(r => [r.Filename, r.Score, r.Grade, r.Issues, r.Fractions, r.Units, r.Lines, r.Punctuation])
]
  .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  .join('\n');

fs.writeFileSync(outputFile, csvContent);
console.log(`\nSaved to: ${outputFile}`);

// Statistics
const gradeCounts = { A: 0, B: 0, C: 0, D: 0, F: 0 };
for (const r of results) {
  gradeCounts[r.Grade]++;
}

console.log('\nGRADE DISTRIBUTION:');
for (const grade of ['A', 'B', 'C', 'D', 'F']) {
  const count = gradeCounts[grade];
  const pct = ((count / fileCount) * 100).toFixed(1);
  console.log(`  ${grade}: ${count} files (${pct}%)`);
}

// Top A-grade files
const aFiles = results
  .filter(r => r.Grade === 'A')
  .sort((a, b) => b.Score - a.Score)
  .slice(0, 20);

console.log(`\nTOP A-GRADE FILES (${aFiles.length} found):`);
if (aFiles.length > 0) {
  aFiles.slice(0, 10).forEach(r => {
    console.log(`  ${r.Filename}: Score ${r.Score}`);
  });
} else {
  console.log('  No A-grade files found');
}

// Top B-grade files
const bFiles = results
  .filter(r => r.Grade === 'B')
  .sort((a, b) => b.Score - a.Score)
  .slice(0, 10);

console.log(`\nSAMPLE B-GRADE FILES (${bFiles.length} found):`);
if (bFiles.length > 0) {
  bFiles.slice(0, 5).forEach(r => {
    console.log(`  ${r.Filename}: Score ${r.Score}`);
  });
}

console.log('\nDone!');
