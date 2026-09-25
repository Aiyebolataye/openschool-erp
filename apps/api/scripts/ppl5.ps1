$ErrorActionPreference = 'Continue'
$out = "svc2.log"
Remove-Item $out -ErrorAction SilentlyContinue
cmd /c "set NO_COLOR=1 && npx jest --runInBand --forceExit --testPathPattern=people/applicants.service.spec --testPathPattern=people/people-merge.service.spec --testPathPattern=people/people-documents.service.spec > $out 2>&1"
$l = Get-Content $out
"lines=" + $l.Count
$b = @()
for ($i = 0; $i -lt $l.Count; $i++) {
  if ($l[$i] -match "^\s*● ") { $b += $i }
}
"blocks=" + $b.Count
foreach ($k in $b) {
  "`n#### " + $l[$k].Trim()
  $e = [Math]::Min($k + 16, $l.Count - 1)
  for ($j = $k + 1; $j -le $e; $j++) {
    if ($l[$j] -match "^\s*at |^\s*$") { continue }
    $l[$j].TrimEnd()
  }
}
