const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { spawn } = require('child_process');
const path = require('path');
dotenv.config();
// Import database connection
const connectDB = require('./src/config/connetDB');

// Import routes
const authRoutes = require('./src/routes/auth');

// Import middleware
const { authenticateToken } = require('./src/middleware/auth');



const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Configure CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to database
connectDB();

// Routes
app.use('/api/auth', authRoutes);

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
      path.join(__dirname, '..', '..', 'ml', 'api_bridge.py'),
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Protected prediction endpoint
app.post('/api/predict', authenticateToken, async (req, res) => {
  try {
    const prediction = await predictEnergyConsumption(req.body);
    res.json({
      success: true,
      prediction
    });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to make prediction',
      error: error.message
    });
  }
});

// Public prediction endpoint (for demo purposes)
app.post('/api/public/predict', async (req, res) => {
  try {
    const prediction = await predictEnergyConsumption(req.body);
    res.json({
      success: true,
      prediction
    });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to make prediction',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  // console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  // console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  // console.log(`🤖 Prediction endpoints: http://localhost:${PORT}/api/predict`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});
