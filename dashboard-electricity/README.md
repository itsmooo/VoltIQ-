# VoltIQ Energy Prediction System

This system provides energy consumption prediction capabilities using machine learning. It consists of a Node.js backend server, a Flask-based ML API, and a React frontend.

## System Architecture

The system has the following components:

1. **Node.js Server**: Handles authentication, user management, and API endpoints
2. **Flask ML API**: Provides advanced machine learning capabilities for energy prediction
3. **React Frontend**: User interface for interacting with the system

## Setup and Installation

### Prerequisites
- Node.js and npm
- Python 3.6+ with pip
- TensorFlow 2.x

### Installation

1. Install Node.js dependencies:
```bash
cd server
npm install
```

2. Install Python dependencies:
```bash
pip install flask flask-cors pandas numpy tensorflow scikit-learn matplotlib seaborn
```

## Running the System

### Option 1: Start Everything Together (Recommended)

This will start both the Node.js server and the Flask ML API:

```bash
cd server
npm run start:all
```

The system will be available at:
- Node.js Server: http://localhost:5000
- Flask ML API: http://localhost:5001

### Option 2: Start Components Separately

Start the Node.js server:
```bash
cd server
npm start
```

Start the Flask ML API:
```bash
cd src/ml
python run_prediction_api.py
```

## Training the Model

To train the energy prediction model:

1. Ensure you have the dataset at `data/Energy_consumption.csv`
2. Run the training endpoint:
```bash
curl -X POST http://localhost:5001/train
```

Or visit the `/train` endpoint in your browser.

## API Endpoints

### Node.js Server Endpoints

- **POST /api/signup**: Create a new user account
- **POST /api/login**: Authenticate and get JWT token
- **GET /api/profile**: Get user profile (requires authentication)
- **POST /api/predict**: Make energy prediction (requires authentication)
- **POST /api/public/predict**: Public endpoint for energy prediction (no authentication)

### Flask ML API Endpoints

- **GET /**: API status
- **POST /train**: Train the ML model
- **POST /predict**: Make energy prediction
- **GET /model-info**: Get information about the trained model
- **GET /plots/{filename}**: Access visualization plots
- **GET /dataset-info**: Get dataset statistics

## Authentication

The system uses JWT (JSON Web Token) for authentication. To access protected endpoints:

1. Login to get a token
2. Include the token in the Authorization header: `Authorization: Bearer <token>`

## Visualization

The ML API generates several visualizations during training:

1. Training history (loss and MAE)
2. Prediction vs Actual scatter plot
3. Feature correlation heatmap
4. Energy consumption distribution
5. Feature importance chart

These can be accessed via the `/plots/{filename}` endpoint.

## Troubleshooting

If you encounter issues:

1. Check if both servers are running
2. Verify the dataset exists and is properly formatted
3. Check for error messages in the server logs
4. Ensure the model has been trained before making predictions

## License

This project is licensed under the MIT License.
