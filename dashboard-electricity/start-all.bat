@echo off
echo Starting VoltIQ Energy Prediction System...
echo.

echo Starting Node.js Server...
start "Node.js Server" cmd /k "cd server && npm start"

echo Starting Python ML API...
start "Python ML API" cmd /k "cd ml && python run_prediction_api.py"

echo Starting React Frontend...
start "React Frontend" cmd /k "npm run dev"

echo.
echo All servers are starting...
echo - Node.js Server: http://localhost:5000
echo - Python ML API: http://localhost:5001
echo - React Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause > nul 