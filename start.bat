@echo off
echo Starting Bug Triaging System...

start "Backend" cmd /k "cd /d "%~dp0automated bug prediction\backend" && python -m uvicorn app:app --host 127.0.0.1 --port 8000"

timeout /t 3 /nobreak >nul

start "Frontend" cmd /k "cd /d "%~dp0automated bug prediction\frontend" && npm run dev"

timeout /t 3 /nobreak >nul

start "" "http://localhost:5173"

echo Both servers started. Check the two terminal windows.
