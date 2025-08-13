@echo off
echo Starting VoltIQ Electricity Website with Server...

echo.
echo Starting the authentication server...
cd ..\dashboard-electricity\server
start "Auth Server" cmd /k "npm start"

echo.
echo Waiting for server to start...
timeout /t 3 /nobreak > nul

echo.
echo Starting the electricity website...
cd ..\..\electricity-website
start "Electricity Website" cmd /k "npm run dev"

echo.
echo Both applications are starting...
echo.
echo Auth Server: http://localhost:5000
echo Electricity Website: http://localhost:5173
echo.
echo Press any key to exit this script (applications will continue running)
pause > nul 