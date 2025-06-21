/**
 * Script to start both the Node.js server and the Flask API server
 */
const { spawn } = require('child_process');
const path = require('path');

// Start Flask API server
console.log('Starting Flask Energy Prediction API server...');
const flaskProcess = spawn('python', [
  path.join(__dirname, '..', 'src', 'ml', 'run_prediction_api.py')
], {
  stdio: 'pipe',
  detached: false
});

flaskProcess.stdout.on('data', (data) => {
  console.log(`[Flask API] ${data.toString().trim()}`);
});

flaskProcess.stderr.on('data', (data) => {
  console.error(`[Flask API Error] ${data.toString().trim()}`);
});

flaskProcess.on('close', (code) => {
  console.log(`Flask API server exited with code ${code}`);
});

// Wait a moment for Flask to start
setTimeout(() => {
  // Start Node.js server
  console.log('Starting Node.js server...');
  const nodeProcess = spawn('node', [
    path.join(__dirname, 'src', 'integrated_server.js')
  ], {
    stdio: 'inherit',
    detached: false
  });

  nodeProcess.on('close', (code) => {
    console.log(`Node.js server exited with code ${code}`);
    // Kill Flask server when Node.js server exits
    flaskProcess.kill();
    process.exit(code);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('Shutting down servers...');
    nodeProcess.kill();
    flaskProcess.kill();
    process.exit(0);
  });
}, 2000);

console.log('Starting servers. Press Ctrl+C to stop.');
