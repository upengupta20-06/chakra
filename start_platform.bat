@echo off
title Cyclone Intelligence Platform - SIH
color 0B

echo ======================================================================
echo    CYCLONE INTELLIGENCE PLATFORM (SIH'26)
echo    AI-Based Tropical Cyclone Identification, Classification, 
echo    Prediction ^& Early-Warning Platform
echo ======================================================================
echo.

:: Detect Python executable
set PYTHON_EXE=C:\Python311\python.exe
if not exist "%PYTHON_EXE%" (
    set PYTHON_EXE=python
)

:: Detect NPM executable
set NPM_CMD="C:\Program Files\nodejs\npm.cmd"
if not exist %NPM_CMD% (
    set NPM_CMD=npm
)

echo [1/2] Starting Cyclone Intelligence Backend Server on http://127.0.0.1:8000 ...
start "Cyclone Intelligence - Backend" cmd /k "%PYTHON_EXE% backend\run_backend.py"

echo [2/2] Starting Cyclone Intelligence Frontend on http://127.0.0.1:5173 ...
cd frontend
start "Cyclone Intelligence - Frontend" cmd /k "%NPM_CMD% run dev"
cd ..

echo.
echo ======================================================================
echo Platform launched successfully!
echo.
echo - Backend API:  http://127.0.0.1:8000/api/health
echo - API Docs:     http://127.0.0.1:8000/docs
echo - Web Client:   http://127.0.0.1:5173
echo ======================================================================
echo.
pause
