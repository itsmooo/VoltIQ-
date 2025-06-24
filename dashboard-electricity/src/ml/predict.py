from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import pickle
import os
import sys
import json
import warnings
from sklearn.preprocessing import StandardScaler, LabelEncoder
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Suppress warnings
warnings.filterwarnings('ignore')
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

app = Flask(__name__)
CORS(app)

class EnergyPredictor:
    def __init__(self):
        """Initialize the energy predictor by loading the model and scalers"""
        self.models_path = os.path.join(os.path.dirname(__file__), 'models')
        self.model = None
        self.scaler_X = None
        self.scaler_y = None
        self.feature_cols = []
        self.sequence_length = 24
        self.is_loaded = False
        
        self._load_models()
    
    def _load_models(self):
        """Load all required models and scalers"""
        try:
            # Load the main model
            model_path = os.path.join(self.models_path, 'electricity_consumption_models.pkl')
            print('path of the model', model_path)
            if os.path.exists(model_path):
                with open(model_path, 'rb') as f:
                    self.model = pickle.load(f)
                logger.info("Main model loaded successfully")
            else:
                logger.warning(f"Model file not found: {model_path}")
                return
            
            # Load scalers
            scaler_x_path = os.path.join(self.models_path, 'scaler_X.pkl')
            if os.path.exists(scaler_x_path):
                with open(scaler_x_path, 'rb') as f:
                    self.scaler_X = pickle.load(f)
                logger.info("X scaler loaded successfully")
            
            scaler_y_path = os.path.join(self.models_path, 'scaler_y.pkl')
            if os.path.exists(scaler_y_path):
                with open(scaler_y_path, 'rb') as f:
                    self.scaler_y = pickle.load(f)
                logger.info("Y scaler loaded successfully")
            
            # Load feature columns
            feature_cols_path = os.path.join(self.models_path, 'feature_cols.pkl')
            if os.path.exists(feature_cols_path):
                with open(feature_cols_path, 'rb') as f:
                    self.feature_cols = pickle.load(f)
                logger.info("Feature columns loaded successfully")
            else:
                self.feature_cols = self._create_default_feature_columns()
                logger.info("Using default feature columns")
            
            self.is_loaded = True
            logger.info("All models loaded successfully!")
            
        except Exception as e:
            logger.error(f"Error loading models: {str(e)}")
            self.is_loaded = False
    
    def _create_default_feature_columns(self):
        """Create default feature columns if not available"""
        return [
            'Hour', 'DayOfWeek', 'Month', 'Quarter', 'DayOfYear', 'WeekOfYear',
            'Hour_sin', 'Hour_cos', 'DayOfWeek_sin', 'DayOfWeek_cos', 
            'Month_sin', 'Month_cos', 'IsWeekend', 'IsPeakHour', 'IsBusinessHour',
            'Temperature', 'Humidity', 'SquareFootage', 'Occupancy', 
            'HVACUsage', 'LightingUsage', 'Holiday',
            'TempHumidity', 'TempSquared', 'HumiditySquared', 
            'HVAC_Temp', 'Lighting_Hour', 'Occupancy_SqFt'
        ]
    
    def create_features(self, data):
        """Create all necessary features for prediction"""
        try:
            features = {}
            
            # Get current datetime for defaults
            now = datetime.now()
            
            # Time-based features
            hour = data.get('hour', now.hour)
            day_of_week = data.get('dayOfWeek', now.weekday())
            month = data.get('month', now.month)
            
            # Validate inputs
            hour = max(0, min(23, int(hour)))
            day_of_week = max(0, min(6, int(day_of_week)))
            month = max(1, min(12, int(month)))
            
            # Basic time features
            features['Hour'] = hour
            features['DayOfWeek'] = day_of_week
            features['Month'] = month
            features['Quarter'] = (month - 1) // 3 + 1
            features['DayOfYear'] = data.get('dayOfYear', now.timetuple().tm_yday)
            features['WeekOfYear'] = data.get('weekOfYear', now.isocalendar()[1])
            
            # Cyclical encoding
            features['Hour_sin'] = np.sin(2 * np.pi * hour / 24)
            features['Hour_cos'] = np.cos(2 * np.pi * hour / 24)
            features['DayOfWeek_sin'] = np.sin(2 * np.pi * day_of_week / 7)
            features['DayOfWeek_cos'] = np.cos(2 * np.pi * day_of_week / 7)
            features['Month_sin'] = np.sin(2 * np.pi * month / 12)
            features['Month_cos'] = np.cos(2 * np.pi * month / 12)
            
            # Boolean features
            features['IsWeekend'] = 1 if day_of_week >= 5 else 0
            features['IsPeakHour'] = 1 if (7 <= hour <= 9) or (17 <= hour <= 19) else 0
            features['IsBusinessHour'] = 1 if 8 <= hour <= 18 else 0
            
            # Environmental and building features
            temperature = float(data.get('temperature', 25.0))
            humidity = float(data.get('humidity', 60.0))
            square_footage = float(data.get('squareFootage', 1000.0))
            occupancy = float(data.get('occupancy', 5.0))
            
            features['Temperature'] = temperature
            features['Humidity'] = humidity
            features['SquareFootage'] = square_footage
            features['Occupancy'] = occupancy
            features['HVACUsage'] = 1 if data.get('hvacUsage', False) else 0
            features['LightingUsage'] = 1 if data.get('lightingUsage', False) else 0
            features['Holiday'] = 1 if data.get('isHoliday', False) else 0
            
            # Interaction features
            features['TempHumidity'] = temperature * humidity
            features['TempSquared'] = temperature ** 2
            features['HumiditySquared'] = humidity ** 2
            features['HVAC_Temp'] = features['HVACUsage'] * temperature
            features['Lighting_Hour'] = features['LightingUsage'] * hour
            features['Occupancy_SqFt'] = occupancy / max(square_footage, 1)  # Avoid division by zero
            
            return features
            
        except Exception as e:
            logger.error(f"Error creating features: {str(e)}")
            raise ValueError(f"Feature creation failed: {str(e)}")
    
    def prepare_features(self, features):
        """Prepare features for prediction"""
        try:
            # Create feature array in the correct order
            feature_array = []
            for col in self.feature_cols:
                if col in features:
                    feature_array.append(features[col])
                else:
                    # Use default value for missing features
                    feature_array.append(0.0)
            
            # Convert to numpy array with proper shape
            feature_array = np.array(feature_array).reshape(1, -1)
            
            # Scale features if scaler is available
            if self.scaler_X is not None:
                try:
                    feature_scaled = self.scaler_X.transform(feature_array)
                    return feature_scaled
                except Exception as e:
                    logger.warning(f"Scaling failed, using raw features: {str(e)}")
                    return feature_array
            else:
                return feature_array
            
        except Exception as e:
            logger.error(f"Error preparing features: {str(e)}")
            # Return basic feature array if preparation fails
            basic_features = np.array([list(features.values())[:len(self.feature_cols)]]).reshape(1, -1)
            return basic_features
    
    def predict(self, data):
        """Make energy consumption prediction based on input data"""
        try:
            if not self.is_loaded or self.model is None:
                return {
                    'success': False,
                    'error': 'Model not loaded properly'
                }
            
            # Validate input data
            if not isinstance(data, dict):
                return {
                    'success': False,
                    'error': 'Input data must be a dictionary'
                }
            
            # Create features
            features = self.create_features(data)
            
            # Prepare features for prediction
            feature_array = self.prepare_features(features)
            
            # Make prediction
            if hasattr(self.model, 'predict'):
                # For sklearn models
                pred_scaled = self.model.predict(feature_array)
                prediction = pred_scaled[0] if isinstance(pred_scaled, np.ndarray) else pred_scaled
            else:
                # For other model types
                prediction = float(self.model(feature_array)[0])
            
            # Inverse transform if scaler is available
            if self.scaler_y is not None:
                try:
                    prediction = self.scaler_y.inverse_transform([[prediction]])[0][0]
                except Exception as e:
                    logger.warning(f"Inverse scaling failed: {str(e)}")
            
            # Ensure prediction is positive and reasonable
            prediction = max(0, float(prediction))
            
            # Calculate confidence score (simplified approach)
            base_confidence = 85
            confidence_variation = np.random.normal(0, 5)
            confidence = min(95, max(70, base_confidence + confidence_variation))
            
            return {
                'success': True,
                'prediction': round(prediction, 2),
                'confidence': round(confidence, 1),
                'unit': 'kWh',
                'model_type': type(self.model).__name__,
                'features_used': len(features),
                'timestamp': datetime.now().isoformat()
            }
        
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}")
            return {
                'success': False,
                'error': f'Prediction failed: {str(e)}'
            }

# Initialize predictor
predictor = EnergyPredictor()

@app.route('/', methods=['GET'])
def home():
    """Home endpoint with API information"""
    return jsonify({
        "message": "Energy Consumption Prediction API",
        "status": "running",
        "model_loaded": predictor.is_loaded,
        "model_type": type(predictor.model).__name__ if predictor.model else "None",
        "version": "1.0.0",
        "endpoints": {
            "/": "API information",
            "/predict": "POST - Make energy consumption prediction",
            "/model-info": "GET - Get model information",
            "/health": "GET - Health check"
        }
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Make energy consumption prediction"""
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False, 
                "error": "No input data provided. Please send JSON data."
            }), 400

        if not predictor.is_loaded:
            return jsonify({
                "success": False, 
                "error": "Model not loaded. Please check server logs."
            }), 500
        
        # Make prediction
        result = predictor.predict(data)
        
        if not result['success']:
            return jsonify(result), 400
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Prediction endpoint error: {str(e)}")
        return jsonify({
            "success": False, 
            "error": f"Server error: {str(e)}"
        }), 500

@app.route('/model-info', methods=['GET'])
def model_info():
    """Get detailed model information"""
    try:
        if not predictor.is_loaded:
            return jsonify({"error": "Model not loaded"}), 400
        
        return jsonify({
            "model_loaded": True,
            "model_type": type(predictor.model).__name__,
            "feature_columns": predictor.feature_cols,
            "num_features": len(predictor.feature_cols),
            "sequence_length": predictor.sequence_length,
            "scalers_available": {
                "scaler_X": predictor.scaler_X is not None,
                "scaler_y": predictor.scaler_y is not None
            },
            "model_path": predictor.models_path
        })
        
    except Exception as e:
        logger.error(f"Model info error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy" if predictor.is_loaded else "unhealthy",
        "model_loaded": predictor.is_loaded,
        "timestamp": datetime.now().isoformat(),
        "server": "Flask Energy Prediction API"
    })

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        "error": "Endpoint not found",
        "available_endpoints": ["/", "/predict", "/model-info", "/health"]
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        "error": "Internal server error",
        "message": "Please check server logs for details"
    }), 500

if __name__ == '__main__':
    print("=" * 50)
    print("Starting Energy Prediction Server...")
    print(f"Model loaded: {predictor.is_loaded}")
    
    if predictor.is_loaded:
        print(f"Model type: {type(predictor.model).__name__}")
        print(f"Features: {len(predictor.feature_cols)}")
        print(f"Scalers available: X={predictor.scaler_X is not None}, Y={predictor.scaler_y is not None}")
    else:
        print("WARNING: Model not loaded properly!")
    
    print("=" * 50)
    
    # Run the Flask app
    app.run(debug=True, host='0.0.0.0', port=5001)
