@echo off
echo Restarting VoltIQ Authentication Server...

echo.
echo Stopping any existing server processes...
taskkill /f /im node.exe 2>nul

echo.
echo Starting the authentication server...
cd ..\dashboard-electricity\server
start "Auth Server" cmd /k "npm start"

echo.
echo Server is starting on http://localhost:5000
echo.
echo Press any key to exit this script (server will continue running)
pause > nul 