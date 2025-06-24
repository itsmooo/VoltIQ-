const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

// Configure CORS properly
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// In-memory storage for demo purposes
const users = [];
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Add default admin user
const initializeDefaultUser = async () => {
  if (users.length === 0) {
    const hashedPassword = await bcrypt.hash('password', 10);
    users.push({
      id: '1',
      name: 'Demo User',
      email: 'demo@example.com',
      password: hashedPassword,
      role: 'admin'
    });
    console.log('Default user created: demo@example.com / password');
  }
};

initializeDefaultUser();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Function to run Python prediction script
const predictEnergyConsumption = async (data) => {
  return new Promise((resolve, reject) => {
    // Ensure dayOfWeek is a number (0-6) for the Python script
    if (typeof data.dayOfWeek === 'string') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      data.dayOfWeek = days.indexOf(data.dayOfWeek);
      if (data.dayOfWeek === -1) data.dayOfWeek = new Date().getDay(); // Default to current day if invalid
    }

    const pythonProcess = spawn('python', [
      path.join(__dirname, '..', '..', 'src', 'ml', 'api_bridge.py'),
      JSON.stringify(data)
    ]);

    let result = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
      console.log('Python output:', data.toString());
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error(`Python Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}. Error: ${errorOutput}`));
        return;
      }
      try {
        const trimmedResult = result.trim();
        console.log('Trying to parse:', trimmedResult);
        resolve(JSON.parse(trimmedResult));
      } catch (e) {
        console.error('Parse error:', e);
        reject(new Error(`Failed to parse prediction result: ${result}`));
      }
    });
  });
};

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      password: hashedPassword,
      role: 'viewer'
    };

    users.push(user);

    // Create token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected route example
app.get('/api/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });
});

// Energy consumption prediction endpoint - PUBLIC VERSION (no auth required)
app.post('/api/public/predict', async (req, res) => {
  try {
    const prediction = await predictEnergyConsumption(req.body);
    res.json(prediction);
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to make prediction: ' + error.message 
    });
  }
});

// Energy consumption prediction endpoint - PROTECTED VERSION (auth required)
app.post('/api/predict', authenticateToken, async (req, res) => {
  try {
    const prediction = await predictEnergyConsumption(req.body);
    res.json(prediction);
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to make prediction: ' + error.message 
    });
  }
});

// Check if Python and TensorFlow are available
app.get('/api/system/check', (req, res) => {
  const pythonProcess = spawn('python', ['-c', 'import sys; print(sys.version); import tensorflow; print(f"TensorFlow version: {tensorflow.__version__}")']);
  
  let result = '';
  let errorOutput = '';

  pythonProcess.stdout.on('data', (data) => {
    result += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  pythonProcess.on('close', (code) => {
    res.json({
      success: code === 0,
      pythonOutput: result,
      pythonError: errorOutput,
      nodeVersion: process.version
    });
  });
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '..', '..', 'build')));

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '..', '..', 'build', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send('Server is running, but the React app is not built. Please run "npm run build" in the client directory.');
  }
});

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Integrated server is running on port ${PORT}`);
  console.log(`- Auth API: http://localhost:${PORT}/api/login`);
  console.log(`- ML API (protected): http://localhost:${PORT}/api/predict`);
  console.log(`- ML API (public): http://localhost:${PORT}/api/predict/public`);
  console.log(`- System check: http://localhost:${PORT}/api/system/check`);
});
