$ErrorActionPreference = 'Continue'
$log = Join-Path $env:TEMP 'ppl5.log'
$env:NO_COLOR = '1'
& npx jest --runInBand --forceExit --testPathPattern='(applicants|people-merge|people-documents).*service.spec' *> $log
$l = Get-Content $log
for ($i = 0; $i -lt $l.Count; $i++) {
  if ($l[$i] -match '^\s*● ') {
    "##### " + $l[$i].Trim()
    $e = [Math]::Min($i + 1 + 16, $l.Count - 1)
    for ($j = $i + 1; $j -le $e; $j++) {
      $t = $l[$j].TrimEnd()
      if ($t -match '^\s*at ' -or $t -eq '' -and $j -gt $i + 28) { }
      if ($t -match '^\s*at ' -or $t -match '^FAIL ' -or $t -match '^  ' -or $t -eq '') { continue }
      $t
    }
    ''
  }
}
