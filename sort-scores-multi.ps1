$csvPath = 'c:\Users\dajoh\Documents\code\Medland-Cooks.github.io\ocr-raw-scores.csv'
$data = Import-Csv -Path $csvPath
$sorted = $data | Sort-Object @{ Expression = { [double]$_.Score }; Descending = $true }, Filename
$sorted | Export-Csv -Path $csvPath -NoTypeInformation
Write-Host "Sorted by Score (descending), then Filename (ascending). Total: $($sorted.Count) records"
