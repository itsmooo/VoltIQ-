Write-Host "Restarting VoltIQ Authentication Server..." -ForegroundColor Green

Write-Host ""
Write-Host "Stopping any existing server processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Starting the authentication server..." -ForegroundColor Yellow
Set-Location "..\dashboard-electricity\server"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal

Write-Host ""
Write-Host "Server is starting on http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this script (server will continue running)" -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 