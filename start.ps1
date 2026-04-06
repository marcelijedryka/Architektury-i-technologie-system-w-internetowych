# Setup & Run — Digital Community Archive
# Usage: right-click -> "Run with PowerShell"  OR  .\start.ps1

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

Write-Host "=== Installing dependencies ===" -ForegroundColor Cyan

if (-not (Test-Path "$root\backend\node_modules")) {
    Write-Host "Installing backend deps..." -ForegroundColor Yellow
    Push-Location "$root\backend"
    npm install
    Pop-Location
} else {
    Write-Host "Backend deps already installed." -ForegroundColor Green
}

if (-not (Test-Path "$root\frontend\node_modules")) {
    Write-Host "Installing frontend deps..." -ForegroundColor Yellow
    Push-Location "$root\frontend"
    npm install
    Pop-Location
} else {
    Write-Host "Frontend deps already installed." -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Starting servers ===" -ForegroundColor Cyan
Write-Host "Backend  -> http://localhost:3000" -ForegroundColor White
Write-Host "Frontend -> http://localhost:5173" -ForegroundColor White
Write-Host ""

# Start backend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\backend'; npm run start:dev" -WindowStyle Normal

# Give backend a moment to boot before opening frontend
Start-Sleep -Seconds 2

# Start frontend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\frontend'; npm run dev" -WindowStyle Normal

Write-Host "Both servers are starting in separate windows." -ForegroundColor Green
Write-Host "Open http://localhost:5173 in your browser." -ForegroundColor Cyan
