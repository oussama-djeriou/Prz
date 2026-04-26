@echo off
echo ==========================================
echo Starting Freelance Platform MVP
echo ==========================================

:: Check for Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in your PATH.
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b
)

:: Check for Node.js
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in your PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b
)

echo [INFO] Both Python and Node.js are installed.

:: Start Backend
echo [INFO] Starting Backend in a new window...
start cmd /k "cd backend && echo Installing backend requirements... && pip install -r requirements.txt && echo Starting Flask server... && python app.py"

:: Start Frontend
echo [INFO] Starting Frontend in a new window...
start cmd /k "cd frontend && if not exist node_modules (echo Installing frontend dependencies... && npm install) else (echo Frontend dependencies already installed.) && echo Starting React Vite server... && npm run dev"

echo ==========================================
echo Application is starting up. 
echo - Backend will run on http://127.0.0.1:5000
echo - Frontend will run on http://localhost:5173
echo Close the newly opened windows to stop the servers.
echo ==========================================
pause
