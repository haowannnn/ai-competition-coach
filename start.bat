@echo off
REM One-click launcher for the AI Competition Coach demo.
REM Double-click this file to start the dev server, then open the URL it prints.

cd /d "%~dp0"

if not exist node_modules (
  echo Installing dependencies for the first time...
  call npm install
)

echo.
echo Starting the dev server. Open the URL shown below in your browser.
echo Press Ctrl+C in this window to stop.
echo.
call npm run dev
pause
