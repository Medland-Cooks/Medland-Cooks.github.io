#!/usr/bin/env python3
import os
import re
import csv

recipe_path = r"c:\Users\dajoh\Documents\code\Medland-Cooks.github.io\medland-cooks\resources\print-recipies"
output_file = r"c:\Users\dajoh\Documents\code\Medland-Cooks.github.io\ocr-raw-scores.csv"

def get_ocr_score(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
    except:
        return None
    
    score = 100
    issues = []
    
    # 1. Check for corrupted characters (high-byte encodings)
    garbled_count = sum(1 for c in content if ord(c) > 127)
    if garbled_count > 5:
        penalty = min(garbled_count / 10, 15)
        score -= penalty
        issues.append("Corrupted")
    
    # 2. Fractions and units
    fraction_pattern = r'\b\d+\s?/\s?\d+\b'
    fractions = len(re.findall(fraction_pattern, content))
    
    unit_pattern = r'\b(cup|cups|tbsp|tablespoon|tsp|teaspoon|oz|ounce|lb|pound|ml|gram|g)\b'
    units = len(re.findall(unit_pattern, content, re.IGNORECASE))
    
    if units == 0:
        score -= 10
        issues.append("NoUnits")
    elif fractions == 0:
        score -= 3
        issues.append("NoFractions")
    elif fractions > 3:
        score += 3
        issues.append("GoodFractions")
    
    # 3. Punctuation
    punct_count = len(re.findall(r'[.,:]', content))
    lines = content.split('\n')
    line_count = len(lines)
    
    if line_count > 5:
        punct_per_line = punct_count / line_count
        if punct_per_line < 0.1:
            score -= 5
            issues.append("LowPunctuation")
    
    # 4. Common cooking terms
    cooking_terms = ['butter', 'sugar', 'flour', 'egg', 'salt', 'pepper', 'milk', 'cream', 'oil', 'bake', 'mix', 'combine']
    found_terms = sum(1 for term in cooking_terms if re.search(fr'\b{term}\b', content, re.IGNORECASE))
    
    if found_terms < 3:
        score -= 5
        issues.append("FewTerms")
    
    score = max(0, min(100, score))
    
    return {
        'score': score,
        'issues': '|'.join(issues),
        'fractions': fractions,
        'units': units,
        'lines': line_count,
        'punctuation': punct_count
    }

def get_grade(score):
    if score >= 90:
        return 'A'
    elif score >= 80:
        return 'B'
    elif score >= 70:
        return 'C'
    elif score >= 60:
        return 'D'
    else:
        return 'F'

# Get all files
files = sorted([f for f in os.listdir(recipe_path) if os.path.isfile(os.path.join(recipe_path, f))])
file_count = len(files)
print(f"Processing {file_count} OCR recipe files...")

results = []
for idx, filename in enumerate(files, 1):
    if idx % 100 == 0:
        print(f"  Progress: {idx} / {file_count}")
    
    file_path = os.path.join(recipe_path, filename)
    score_data = get_ocr_score(file_path)
    
    if score_data:
        grade = get_grade(score_data['score'])
        results.append({
            'Filename': filename,
            'Score': score_data['score'],
            'Grade': grade,
            'Issues': score_data['issues'],
            'Fractions': score_data['fractions'],
            'Units': score_data['units'],
            'Lines': score_data['lines'],
            'Punctuation': score_data['punctuation']
        })

# Export to CSV
with open(output_file, 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['Filename', 'Score', 'Grade', 'Issues', 'Fractions', 'Units', 'Lines', 'Punctuation'])
    writer.writeheader()
    writer.writerows(results)

print(f"Saved to: {output_file}")

# Statistics
grade_counts = {'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0}
for r in results:
    grade_counts[r['Grade']] += 1

print("\nGRADE DISTRIBUTION:")
for grade in ['A', 'B', 'C', 'D', 'F']:
    count = grade_counts[grade]
    pct = (count / file_count) * 100 if file_count > 0 else 0
    print(f"  {grade}: {count} files ({pct:.1f}%)")

# Top A-grade files
a_files = sorted([r for r in results if r['Grade'] == 'A'], key=lambda x: x['Score'], reverse=True)[:20]
print(f"\nTOP A-GRADE FILES (showing up to 20):")
if a_files:
    for r in a_files[:10]:
        print(f"  {r['Filename']}: Score {r['Score']}")
else:
    print("  No A-grade files found")

print("\nDone!")
