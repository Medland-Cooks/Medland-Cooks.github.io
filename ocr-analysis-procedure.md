# OCR Analysis Procedure

## Overview
Analyze and grade OCR-harvested recipe text files from printed magazine/cookbook photos for legibility and accuracy.

## Sources & Locations
- **Source Photos**: `./recipe-photos/print/`
- **OCR Text Files**: `./medland-cooks/resources/print-recipies/` (~70+ files)
- **Filename Mapping**: OCR text filename matches source photo filename

## Grading Criteria

### 1. **Ingredient Measurements & Units** (35% weight)
- Accuracy of numeric values (quantities)
- Proper recognition of **fractions** (1/2, 1/4, 3/8, etc.) - HIGH PRIORITY
- Unit accuracy (cups, tbsp, tsp, ml, oz, lb, etc.)
- Clear separation between amounts and ingredient names

**Red flags**: Missing/corrupted fractions, nonsensical measurements, confused units

### 2. **Punctuation & Instruction Clarity** (35% weight)
- Proper punctuation in recipe steps (periods, commas, colons)
- Readability of instructions (identify run-on sentences, missing punctuation)
- Proper line breaks/paragraph structure
- Number formatting for steps (Step 1:, etc.)

**Red flags**: Missing punctuation, garbled instructions, unclear step sequence

### 3. **Spelling & Overall Quality** (30% weight)
- Ingredient name spelling accuracy
- Common cooking term spelling (simmer, sauté, julienne, etc.)
- General text legibility
- Obvious OCR errors (e.g., "l" instead of "1", "O" instead of "0")

**Red flags**: Multiple misspellings, unintelligible words, widespread corruption

## Grading Scale

| Grade | Score | Criteria |
|-------|-------|----------|
| A | 90-100% | Minimal errors, text is highly legible. Minor "finessing" only (1-2 corrections). |
| B | 80-89% | Some errors but generally usable. Moderate editing needed (3-5 corrections). |
| C | 70-79% | Multiple errors affecting usability. Significant editing needed (6-10 corrections). |
| D | 60-69% | Heavy corruption. Major editing required or manual retyping recommended. |
| F | <60% | Unusable. Recommend manual typing or photo re-scanning. |

## Analysis Workflow

### Phase 1: Bulk Sampling & Assessment
1. Randomly select 5-10 representative files to establish baseline
2. Grade each sample file against criteria
3. Identify common error patterns
4. Document OCR tool performance observations

### Phase 2: Complete Analysis
1. Grade all files systematically
2. Categorize by grade (A, B, C, D, F)
3. Track frequency of each error type
4. Note any files that may need re-OCR

### Phase 3: Recommendations Document
For each **A-grade file** (90-100%), document:
- Specific remaining finessing needed (if any)
- Example corrections
- Estimated effort to finalize

## Output Deliverables

### Summary Report (Primary)
Create `ocr-analysis-summary.md` containing:
- **Statistics**: Total files analyzed, grade distribution (% in each grade)
- **Grade Breakdown**: List files by grade category **ordered from highest (A) to lowest (F)**
- **Common Issues**: Top OCR-detected problems with examples
- **A-Grade Recommendations**: Detailed suggestions for highest-quality files
- **Next Steps**: Prioritized action plan for finalizing recipes

### Detailed Audit Log (Optional)
Create `ocr-analysis-detailed.md` with:
- File-by-file grades and notes
- Specific errors found in each file
- Confidence indicators

## Execution Steps

1. **Inventory**: Count print-recipies files to confirm total volume
2. **Sample**: Select representative batch to establish patterns
3. **Evaluate**: Grade each file using rubric above
4. **Aggregate**: Collect statistics and categorize results
5. **Summarize**: Write analysis report with recommendations
6. **Document**: Upload summary to workspace root (sibling to analyze.md)

## Success Criteria
- All files graded
- Grade distribution clearly documented
- A-grade files have specific finessing recommendations
- Clear prioritization for next phase (editing/finalization)
