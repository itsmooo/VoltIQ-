Write-Host "Starting VoltIQ Electricity Website with Server..." -ForegroundColor Green

Write-Host ""
Write-Host "Starting the authentication server..." -ForegroundColor Yellow
Set-Location "..\dashboard-electricity\server"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal

Write-Host ""
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Starting the electricity website..." -ForegroundColor Yellow
Set-Location "..\..\electricity-website"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "Both applications are starting..." -ForegroundColor Green
Write-Host ""
Write-Host "Auth Server: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Electricity Website: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this script (applications will continue running)" -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 