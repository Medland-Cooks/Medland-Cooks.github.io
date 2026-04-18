const fs = require('fs');

const recipePath = 'c:\\Users\\dajoh\\Documents\\code\\Medland-Cooks.github.io\\medland-cooks\\resources\\print-recipies';
const outputFile = 'c:\\Users\\dajoh\\Documents\\code\\Medland-Cooks.github.io\\ocr-raw-scores.csv';

function getOCRScore(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let score = 100;
    const issues = [];

    // 1. CHARACTER CORRUPTION - SEVERE PENALTY
    let garbledCount = 0;
    for (let i = 0; i < content.length; i++) {
      if (content.charCodeAt(i) > 127) {
        garbledCount++;
      }
    }
    
    if (garbledCount > 0) {
      // Any corruption is disqualifying from A-grade
      const penalty = Math.min(garbledCount, 30); // up to -30 points
      score -= penalty;
      issues.push('Corrupted');
    }

    // 2. MEASUREMENTS - CRITICAL QUALITY CHECK
    const fractionPattern = /\b\d+\s?\/\s?\d+\b/g;
    const fractions = (content.match(fractionPattern) || []).length;

    const unitPattern = /\b(cup|cups|tbsp|tablespoon|tsp|teaspoon|oz|ounce|lb|pound|ml|gram|g)\b/gi;
    const units = (content.match(unitPattern) || []).length;

    // Strict measurement requirements
    if (units === 0) {
      score -= 15; // Major penalty - no units found
      issues.push('NoUnits');
    } else if (units < 2) {
      score -= 10; // Significant penalty - very few units
      issues.push('MinimalUnits');
    }

    // For US-style recipes, expect fractions
    if (units > 0 && /\b(cup|tbsp|tsp|oz|lb)\b/i.test(content)) {
      if (fractions === 0) {
        score -= 12; // Substantial penalty - US recipe with no fractions
        issues.push('NoFractions');
      } else if (fractions === 1) {
        score -= 5; // Minor penalty - very few fractions
        issues.push('MinimalFractions');
      }
    }

    // 3. PUNCTUATION & INSTRUCTION CLARITY - IMPORTANT
    const punctPattern = /[.;:]/g;
    const punctTotal = (content.match(punctPattern) || []).length;
    const lines = content.split('\n');
    const lineCount = lines.length;

    if (lineCount > 3) {
      const punctPerLine = punctTotal / lineCount;
      if (punctPerLine < 0.05) {
        score -= 8;
        issues.push('VeryLowPunctuation');
      } else if (punctPerLine < 0.15) {
        score -= 3;
        issues.push('LowPunctuation');
      }
    }

    // 4. COMMON COOKING TERMS - LEGIBILITY TEST
    const cookingTerms = ['butter', 'sugar', 'flour', 'egg', 'salt', 'pepper', 'milk', 'cream', 'oil', 'bake', 'mix', 'combine', 'heat', 'cook', 'boil', 'simmer'];
    let foundTerms = 0;
    for (const term of cookingTerms) {
      if (new RegExp(`\\b${term}\\b`, 'i').test(content)) {
        foundTerms++;
      }
    }

    if (foundTerms < 2) {
      score -= 10;
      issues.push('FewCookingTerms');
    } else if (foundTerms < 4) {
      score -= 5;
      issues.push('MinimalCookingTerms');
    }

    // 5. FILE SIZE CHECK - Unusually large or small files may indicate problems
    const fileSize = content.length;
    if (fileSize < 50) {
      score -= 15;
      issues.push('VeryShortContent');
    } else if (fileSize < 200) {
      score -= 5;
      issues.push('ShortContent');
    }

    // Ensure score stays in 0-100 range
    score = Math.max(0, Math.min(100, score));

    return {
      score: Math.round(score * 10) / 10,
      issues: issues.join('|') || 'Perfect',
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
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'A-';
  if (score >= 80) return 'B+';
  if (score >= 75) return 'B';
  if (score >= 70) return 'B-';
  if (score >= 65) return 'C+';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

// Main execution
console.log('Processing with STRICT scoring criteria...');
const files = fs.readdirSync(recipePath).filter(f => 
  fs.statSync(require('path').join(recipePath, f)).isFile()
).sort();

const fileCount = files.length;
console.log(`Scoring ${fileCount} OCR recipe files (STRICT)...`);

const results = [];
let processed = 0;

for (const filename of files) {
  processed++;
  if (processed % 100 === 0) {
    console.log(`  Progress: ${processed} / ${fileCount}`);
  }

  const filePath = require('path').join(recipePath, filename);
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
const gradeDistribution = {};
for (const r of results) {
  gradeDistribution[r.Grade] = (gradeDistribution[r.Grade] || 0) + 1;
}

console.log('\nGRADE DISTRIBUTION (STRICT SCORING):');
const gradeOrder = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'F'];
for (const grade of gradeOrder) {
  if (gradeDistribution[grade]) {
    const count = gradeDistribution[grade];
    const pct = ((count / fileCount) * 100).toFixed(1);
    console.log(`  ${grade}: ${count} files (${pct}%)`);
  }
}

// Show A+ and A grades
const perfectFiles = results.filter(r => r.Grade === 'A+');
const aFiles = results.filter(r => r.Grade === 'A');
const aMinus = results.filter(r => r.Grade === 'A-');

console.log(`\nA+ GRADE FILES (${perfectFiles.length} - nearly perfect):`);
if (perfectFiles.length > 0) {
  perfectFiles.slice(0, 10).forEach(r => {
    console.log(`  ${r.Filename}: ${r.Score} (${r.Issues})`);
  });
} else {
  console.log('  None found');
}

console.log(`\nA GRADE FILES (${aFiles.length} - excellent):`);
if (aFiles.length > 0) {
  aFiles.slice(0, 10).forEach(r => {
    console.log(`  ${r.Filename}: ${r.Score} (${r.Issues})`);
  });
} else {
  console.log('  None found');
}

console.log(`\nA- GRADE FILES (${aMinus.length} - very good):`);
if (aMinus.length > 0) {
  aMinus.slice(0, 10).forEach(r => {
    console.log(`  ${r.Filename}: ${r.Score} (${r.Issues})`);
  });
} else {
  console.log('  None found');
}

console.log('\nRescoring complete!');
