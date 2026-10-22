# 요약 서버를 시작한다(Windows). Ollama가 꺼져 있으면 먼저 켠다. 종료되면 10초 뒤 다시 시작한다.
# 로그인 때 자동 실행하려면 README의 "자동 시작"을 본다.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot

function Find-Tool($name, $candidates) {
  $cmd = Get-Command $name -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  foreach ($c in $candidates) { $found = Get-Item $c -ErrorAction SilentlyContinue | Select-Object -First 1; if ($found) { return $found.FullName } }
  throw "$name 을(를) 찾을 수 없습니다."
}

$node = Find-Tool 'node' @("$env:LOCALAPPDATA\Programs\nodejs-*\*\node.exe", "$env:ProgramFiles\nodejs\node.exe")
$ollama = Find-Tool 'ollama' @("$env:LOCALAPPDATA\Programs\Ollama\ollama.exe")

try { Invoke-RestMethod http://127.0.0.1:11434/api/tags -TimeoutSec 3 | Out-Null }
catch { Start-Process $ollama -ArgumentList 'serve' -WindowStyle Hidden; Start-Sleep 5 }

New-Item -ItemType Directory -Force "$root\logs" | Out-Null
Set-Location $root
while ($true) {
  & $node --env-file-if-exists=.env src/index.ts *>> "$root\logs\server.log"
  Start-Sleep 10
}
