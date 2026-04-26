#!/bin/bash
echo "=========================================="
echo "Starting Freelance Platform MVP"
echo "=========================================="

# Check for Python
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "[ERROR] Python is not installed or not in your PATH."
    echo "Please install Python 3.8+ from https://www.python.org/"
    exit 1
fi

# Use 'python3' if available, otherwise fallback to 'python'
PYTHON_CMD="python"
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
fi

# Check for Node.js
if ! command -v npm &> /dev/null; then
    echo "[ERROR] Node.js/npm is not installed or not in your PATH."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "[INFO] Both Python and Node.js are installed."

# Start Backend
echo "[INFO] Starting Backend in the background..."
(
    cd backend
    echo "Installing backend requirements..."
    $PYTHON_CMD -m pip install -r requirements.txt
    echo "Starting Flask server..."
    $PYTHON_CMD app.py
) &
BACKEND_PID=$!

# Start Frontend
echo "[INFO] Starting Frontend..."
(
    cd frontend
    if [ ! -d "node_modules" ]; then
        echo "Installing frontend dependencies..."
        npm install
    else
        echo "Frontend dependencies already installed."
    fi
    echo "Starting React Vite server..."
    npm run dev
) &
FRONTEND_PID=$!

echo "=========================================="
echo "Application is starting up."
echo "- Backend will run on http://127.0.0.1:5000"
echo "- Frontend will run on http://localhost:5173"
echo "Press [CTRL+C] to stop both servers."
echo "=========================================="

# Trap SIGINT (Ctrl+C) to kill both processes
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

wait
