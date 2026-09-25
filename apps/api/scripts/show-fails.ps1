$log = Join-Path $env:TEMP "svc.log"
if (-not (Test-Path $log)) { Write-Output "no log"; exit }
$lines = Get-Content $log -Encoding UTF8
for ($i = 0; $i -lt $lines.Count; $i++) {
  if ($lines[$i] -match "^  \u25CF | FAIL |PASS ") {
    $j = 0
    $hit = $false
    for ($j = $i + 1; $j -lt $lines.Count; $j++) {
      if ($lines[$j] -match "^\s*at |^\s*$") { }
      if ($lines[$j] -match "●") { $hit = $true }
      if ($hit -and $lines[$j] -match "^\s*at |^\s*$") { break }
    }
    $slice = $lines[$i..$j] | Where-Object { $_ -notmatch "^\s*$" } | Select-Object -First 22
    "[$(($slice | Where-Object { $_ -match "^  ●" } | Select-Object -First 1))]"
    $slice | ForEach-Object { $_ }
    ""
  }
}
