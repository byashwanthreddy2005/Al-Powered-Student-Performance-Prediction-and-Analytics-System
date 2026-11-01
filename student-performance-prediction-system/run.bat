@echo off
title AI-Powered Student Performance Prediction System
cd /d "%~dp0"

echo ===================================================================
echo   Starting AI-Powered Student Performance Prediction System
echo ===================================================================

if exist ".venv\Scripts\python.exe" (
    echo Using project virtual environment (.venv)...
    ".venv\Scripts\python.exe" run.py
) else (
    echo Using system Python...
    python run.py
)

pause
