$ErrorActionPreference = "Stop"

$api = Start-Process -FilePath "npm.cmd" -ArgumentList "run dev:server" -PassThru -WindowStyle Hidden
$web = Start-Process -FilePath "npm.cmd" -ArgumentList "run dev" -PassThru -WindowStyle Hidden

Write-Host "API: http://localhost:8000/api/health"
Write-Host "Web: http://localhost:3000"
Write-Host "Press Ctrl+C to stop both processes."

try {
  while ($true) {
    Start-Sleep -Seconds 1
    if ($api.HasExited -or $web.HasExited) {
      throw "One of the development processes exited."
    }
  }
}
finally {
  Stop-Process -Id $api.Id -ErrorAction SilentlyContinue
  Stop-Process -Id $web.Id -ErrorAction SilentlyContinue
}
