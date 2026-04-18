# OCR Quality Scoring Script for Recipe Files

$recipePath = "c:\Users\dajoh\Documents\code\Medland-Cooks.github.io\medland-cooks\resources\print-recipies\"
$outputFile = "c:\Users\dajoh\Documents\code\Medland-Cooks.github.io\ocr-raw-scores.csv"

# Initialize results array
$results = @()

# Define OCR quality scoring function
function Get-OCRScore {
    param([string]$filePath)
    
    $content = Get-Content -Path $filePath -Raw -ErrorAction SilentlyContinue
    if (-not $content) { return $null }
    
    $score = 100
    $issues = @()
    
    # 1. CHARACTER CORRUPTION (Major penalty)
    $garbledCount = 0
    for ($i = 0; $i -lt $content.Length - 2; $i++) {
        $char = $content[$i]
        if ([int][char]$char -gt 127) {
            $garbledCount++
        }
    }
    
    if ($garbledCount -gt 5) {
        $penalty = [math]::Min(($garbledCount / 10), 15)
        $score -= $penalty
        $issues += "Corrupted chars"
    }
    
    # 2. MEASUREMENT PRESERVATION
    $fractionPattern = [regex]::Matches($content, '\b[0-9]+\s?/\s?[0-9]+\b')
    $fractionCount = $fractionPattern.Count
    
    $unitPattern = [regex]::Matches($content, '\b(cup|cups|tbsp|tablespoon|tsp|teaspoon|oz|ounce|lb|pound|ml|l|gram|g)\b', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    $unitCount = $unitPattern.Count
    
    if ($unitCount -eq 0) {
        $score -= 10
        $issues += "No units"
    } elseif ($fractionCount -eq 0) {
        $score -= 3
        $issues += "No fractions"
    } elseif ($fractionCount -gt 3) {
        $score += 3
        $issues += "Good-fractions"
    }
    
    # 3. PUNCTUATION
    $periods = [regex]::Matches($content, '\.').Count
    $commas = [regex]::Matches($content, ',').Count
    $colons = [regex]::Matches($content, ':').Count
    $punctTotal = $periods + $commas + $colons
    
    $lines = $content -split [environment]::NewLine
    $lineCount = $lines.Count
    
    if ($lineCount -gt 5) {
        $avgPunctPerLine = $punctTotal / $lineCount
        if ($avgPunctPerLine -lt 0.1) {
            $score -= 5
            $issues += "Low-punctuation"
        }
    }
    
    # 4. COMMON COOKING TERMS
    $commonIngredients = @('butter', 'sugar', 'flour', 'egg', 'salt', 'pepper', 'milk', 'cream', 'oil', 'bake', 'mix', 'combine')
    $foundIngredients = 0
    foreach ($ingredient in $commonIngredients) {
        if ($content -match "\b$ingredient\b") {
            $foundIngredients++
        }
    }
    
    if ($foundIngredients -lt 3) {
        $score -= 5
        $issues += "Few-terms"
    }
    
    # Ensure score stays in 0-100 range
    $score = [Math]::Max(0, [Math]::Min(100, $score))
    
    return @{
        Score = $score
        Issues = $issues -join "|"
        FractionCount = $fractionCount
        UnitCount = $unitCount
        LineCount = $lineCount
        PunctTotal = $punctTotal
    }
}

# Convert score to letter grade
function Get-LetterGrade {
    param([int]$score)
    
    if ($score -ge 90) { return "A" }
    elseif ($score -ge 80) { return "B" }
    elseif ($score -ge 70) { return "C" }
    elseif ($score -ge 60) { return "D" }
    else { return "F" }
}

# Process all files
Write-Host "Processing OCR recipe files..."
$files = Get-ChildItem -Path $recipePath -File | Sort-Object Name
$fileCount = $files.Count
$processed = 0

foreach ($file in $files) {
    $processed++
    if ($processed % 100 -eq 0) {
        Write-Host "  Progress: $processed / $fileCount..."
    }
    
    $scoreData = Get-OCRScore -filePath $file.FullName
    
    if ($scoreData) {
        $grade = Get-LetterGrade -score $scoreData.Score
        $results += [PSCustomObject]@{
            Filename = $file.Name
            Score = $scoreData.Score
            Grade = $grade
            Issues = $scoreData.Issues
            Fractions = $scoreData.FractionCount
            Units = $scoreData.UnitCount
            Lines = $scoreData.LineCount
            Punctuation = $scoreData.PunctTotal
        }
    }
}

# Export raw results
$results | Export-Csv -Path $outputFile -NoTypeInformation
Write-Host "Raw scores saved to: $outputFile"
Write-Host "Processed $fileCount files"

# Summary statistics
$gradeDistribution = $results | Group-Object -Property Grade | Sort-Object Name -Descending
Write-Host "`n=== GRADE DISTRIBUTION ==="
foreach ($group in $gradeDistribution) {
    $percentage = [math]::Round(($group.Count / $fileCount) * 100, 1)
    Write-Host "$($group.Name): $($group.Count) files ($percentage%)"
}

# Show top A-grade files
$topFiles = $results | Where-Object { $_.Grade -eq "A" } | Sort-Object Score -Descending | Select-Object -First 20
Write-Host "`n=== TOP A-GRADE FILES ==="
if ($topFiles) {
    $topFiles | Format-Table -AutoSize
} else {
    Write-Host "No A-grade files"
}

# Show some B-grade 
$bFiles = $results | Where-Object { $_.Grade -eq "B" } | Sort-Object Score -Descending | Select-Object -First 10
Write-Host "`n=== SAMPLE B-GRADE FILES ==="
if ($bFiles) {
    $bFiles | Format-Table -AutoSize
} else {
    Write-Host "No B-grade files"
}

Write-Host "`nAnalysis complete!"
# OCR Quality Scoring Script for 1,144 Recipe Files

$recipePath = "c:\Users\dajoh\Documents\code\Medland-Cooks.github.io\medland-cooks\resources\print-recipies\"
$outputFile = "c:\Users\dajoh\Documents\code\Medland-Cooks.github.io\ocr-raw-scores.csv"

# Initialize results array
$results = @()

# Define OCR quality scoring function
function Get-OCRScore {
    param([string]$filePath)
    
    $content = Get-Content -Path $filePath -Raw -ErrorAction SilentlyContinue
    if (-not $content) { return $null }
    
    $score = 100
    $issues = @()
    
    # 1. CHARACTER CORRUPTION (Major penalty - weight: 35%)
    # Special characters that indicate OCR errors
    $corruptedChars = @('€', '©', '®', '℠', '™', '°', 'ﬂ', 'ﬀ', 'ﬁ', 'ﬃ', 'ﬄ', '§', '¶', '†', '‡')
    $cornerruptCount = $corruptedChars | Where-Object { $content.Contains($_) } | Measure-Object | Select-Object -ExpandProperty Count
    if ($cornerruptCount -gt 0) {
        $score -= $cornerruptCount * 3
        $issues += "Corrupted chars ($cornerruptCount)"
    }
    
    # Obvious substitution errors (l->1, O->0 in wrong context is harder to detect automatically)
    # Look for common OCR failures: multiple consecutive non-space non-letter chars
    $strangePairs = @('lI', 'rn->m', '0O', '()[]')
    $garbledSections = [regex]::Matches($content, '[^a-zA-Z0-9\s\'-.,]/]{3,}')
    if ($garbledSections.Count -gt 2) {
        $score -= 5
        $issues += "Garbled text sections"
    }
    
    # 2. MEASUREMENT PRESERVATION (Weight: 35%)
    # Good indicators: proper fractions, measurement units
    $fractionPattern = [regex]::Matches($content, '\b[0-9]+\s?/\s?[0-9]+\b')
    $fractionCount = $fractionPattern.Count
    
    $unitPattern = [regex]::Matches($content, '\b(cup|cups|tbsp|tablespoon|tsp|teaspoon|oz|ounce|lb|pound|ml|l|gram|g)\b', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    $unitCount = $unitPattern.Count
    
    # Mixed units
    $mixedMetric = [regex]::Matches($content, '\b(ml|cl|gram|g|kg)\b', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase).Count
    $usStandard = [regex]::Matches($content, '\b(cup|tbsp|tsp|oz|lb)\b', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase).Count
    
    if ($unitCount -eq 0) {
        $score -= 10
        $issues += "No measurement units found"
    } elseif ($fractionCount -eq 0 -and $usStandard -gt 0) {
        $score -= 5
        $issues += "No fractions detected (US recipe)"
    } elseif ($fractionCount -gt 3) {
        $score += 3
        $issues += "Good fraction preservation"
    }
    
    # 3. PUNCTUATION & CLARITY (Weight: 30%)
    $periods = [regex]::Matches($content, '\.').Count
    $commas = [regex]::Matches($content, ',').Count
    $colons = [regex]::Matches($content, ':').Count
    $punctTotal = $periods + $commas + $colons
    
    $lines = $content -split [environment]::NewLine
    $lineCount = $lines.Count
    
    # Calculate average punctuation per line
    if ($lineCount -gt 5) {
        $avgPunctPerLine = $punctTotal / $lineCount
        if ($avgPunctPerLine -lt 0.1) {
            $score -= 8
            $issues += "Low punctuation (sparse formatting)"
        }
    }
    
    # Look for obviously corrupted sentences (extreme length)
    $avgLineLength = ($content.Length / $lineCount)
    $longLines = $lines | Where-Object { $_.Length -gt ($avgLineLength * 3) } | Measure-Object | Select-Object -ExpandProperty Count
    if ($longLines -gt $lineCount * 0.2) {
        $score -= 5
        $issues += "Multiple very long lines (possible corruption)"
    }
    
    # 4. GENERAL TEXT QUALITY (Additional factors)
    # Look for common ingredient words
    $commonIngredients = @('butter', 'sugar', 'flour', 'egg', 'salt', 'pepper', 'milk', 'cream', 'oil', 'bake', 'mix', 'combine')
    $foundIngredients = 0
    foreach ($ingredient in $commonIngredients) {
        if ($content -match "\b$ingredient\b") {
            $foundIngredients++
        }
    }
    
    if ($foundIngredients -lt 3) {
        $score -= 5
        $issues += "Few common cooking terms recognized"
    }
    
    # Ensure score stays in 0-100 range
    $score = [Math]::Max(0, [Math]::Min(100, $score))
    
    return @{
        Score = $score
        Issues = $issues -join " | "
        FractionCount = $fractionCount
        UnitCount = $unitCount
        LineCount = $lineCount
        PunctTotal = $punctTotal
    }
}

# Convert score to letter grade
function Get-LetterGrade {
    param([int]$score)
    
    if ($score -ge 90) { return "A" }
    elseif ($score -ge 80) { return "B" }
    elseif ($score -ge 70) { return "C" }
    elseif ($score -ge 60) { return "D" }
    else { return "F" }
}

# Process all files
Write-Host "Processing 1,144 OCR recipe files..."
Write-Host "This may take a few minutes..."

$files = Get-ChildItem -Path $recipePath -File | Sort-Object Name
$fileCount = $files.Count
$processed = 0

foreach ($file in $files) {
    $processed++
    if ($processed % 100 -eq 0) {
        Write-Host "  Progress: $processed / $fileCount files processed..."
    }
    
    $scoreData = Get-OCRScore -filePath $file.FullName
    
    if ($scoreData) {
        $grade = Get-LetterGrade -score $scoreData.Score
        $results += [PSCustomObject]@{
            Filename = $file.Name
            Score = $scoreData.Score
            Grade = $grade
            Issues = $scoreData.Issues
            Fractions = $scoreData.FractionCount
            Units = $scoreData.UnitCount
            Lines = $scoreData.LineCount
            Punctuation = $scoreData.PunctTotal
        }
    }
}

# Export raw results
$results | Export-Csv -Path $outputFile -NoTypeInformation
Write-Host "✓ Raw scores saved to: $outputFile"
Write-Host "Processed $fileCount files total"

# Summary statistics
$gradeDistribution = $results | Group-Object -Property Grade | Sort-Object Name -Descending
Write-Host "`n=== GRADE DISTRIBUTION ==="
foreach ($group in $gradeDistribution) {
    $percentage = [math]::Round(($group.Count / $fileCount) * 100, 1)
    Write-Host "$($group.Name): $($group.Count) files ($percentage%)"
}

# Show top A-grade files
$topFiles = $results | Where-Object { $_.Grade -eq "A" } | Sort-Object Score -Descending | Select-Object -First 20
Write-Host "`n=== TOP A-GRADE FILES (Score 90+) ==="
$topFiles | Format-Table -AutoSize

# Show some B-grade for reference
$bFiles = $results | Where-Object { $_.Grade -eq "B" } | Sort-Object Score -Descending | Select-Object -First 10
Write-Host "`n=== SAMPLE B-GRADE FILES (Score 80-89) ==="
$bFiles | Format-Table -AutoSize

Write-Host "`nAnalysis complete!"
