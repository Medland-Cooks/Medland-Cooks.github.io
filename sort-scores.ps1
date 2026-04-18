$csvPath = 'c:\Users\dajoh\Documents\code\Medland-Cooks.github.io\ocr-raw-scores.csv'
$data = Import-Csv -Path $csvPath
$sorted = $data | Sort-Object { [double]$_.Score } -Descending
$sorted | Export-Csv -Path $csvPath -NoTypeInformation
Write-Host "Sorted by Score (descending). Total: $($sorted.Count) records"
