Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "   Starting AI-Powered Student Performance Prediction System" -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan

Set-Location $PSScriptRoot

if (Test-Path ".\.venv\Scripts\python.exe") {
    Write-Host "Using project virtual environment (.venv)..." -ForegroundColor Green
    & ".\.venv\Scripts\python.exe" run.py
} else {
    Write-Host "Using system Python..." -ForegroundColor Yellow
    python run.py
}
