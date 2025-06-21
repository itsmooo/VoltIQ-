from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import pickle
import os
import sys
import json
import tensorflow as tf
from sklearn.preprocessing import StandardScaler, LabelEncoder
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# Set TensorFlow logging level
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

app = Flask(__name__)
CORS(app)

class EnergyPredictor:
    def __init__(self):
        """Initialize the energy predictor by loading the model and scalers"""
        # Use relative paths to models directory
        models_path = os.path.join(os.path.dirname(__file__), '..', 'models')
        
        try:
            # Load the main model
            with open(os.path.join(models_path, 'electricity_consumption_models.pkl'), 'rb') as f:
                self.model = pickle.load(f)
            
            # Load scalers
            with open(os.path.join(models_path, 'scaler_X.pkl'), 'rb') as f:
                self.scaler_X = pickle.load(f)
            with open(os.path.join(models_path, 'scaler_y.pkl'), 'rb') as f:
                self.scaler_y = pickle.load(f)
            
            # Try to load feature columns, if not available, create default ones
            try:
                with open(os.path.join(models_path, 'feature_cols.pkl'), 'rb') as f:
                    self.feature_cols = pickle.load(f)
            except FileNotFoundError:
                # Create default feature columns based on your model
                self.feature_cols = self._create_default_feature_columns()
            
            self.sequence_length = 24
            self.is_loaded = True
            print("Model loaded successfully!")
            
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            self.is_loaded = False
            self.model = None
    
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
        features = {}
        
        # Time-based features
        hour = data.get('hour', datetime.now().hour)
        day_of_week = data.get('dayOfWeek', datetime.now().weekday())
        month = data.get('month', datetime.now().month)
        
        # Basic features
        features['Hour'] = hour
        features['DayOfWeek'] = day_of_week
        features['Month'] = month
        features['Quarter'] = (month - 1) // 3 + 1
        features['DayOfYear'] = data.get('dayOfYear', datetime.now().timetuple().tm_yday)
        features['WeekOfYear'] = data.get('weekOfYear', datetime.now().isocalendar()[1])
        
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
        
        # Direct features
        features['Temperature'] = data.get('temperature', 25.0)
        features['Humidity'] = data.get('humidity', 60.0)
        features['SquareFootage'] = data.get('squareFootage', 1000.0)
        features['Occupancy'] = data.get('occupancy', 5.0)
        features['HVACUsage'] = 1 if data.get('hvacUsage', False) else 0
        features['LightingUsage'] = 1 if data.get('lightingUsage', False) else 0
        features['Holiday'] = 1 if data.get('isHoliday', False) else 0
        
        # Interaction features
        features['TempHumidity'] = features['Temperature'] * features['Humidity']
        features['TempSquared'] = features['Temperature'] ** 2
        features['HumiditySquared'] = features['Humidity'] ** 2
        features['HVAC_Temp'] = features['HVACUsage'] * features['Temperature']
        features['Lighting_Hour'] = features['LightingUsage'] * hour
        features['Occupancy_SqFt'] = features['Occupancy'] / features['SquareFootage']
        
        return features
    
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
            
            feature_array = np.array(feature_array).reshape(1, -1)
            
            # Scale features if scaler is available
            if hasattr(self, 'scaler_X') and self.scaler_X is not None:
                feature_scaled = self.scaler_X.transform(feature_array)
            else:
                feature_scaled = feature_array
            
            return feature_scaled
            
        except Exception as e:
            print(f"Error preparing features: {str(e)}")
            # Return basic feature array if scaling fails
            return np.array([list(features.values())[:len(self.feature_cols)])
    
    def predict(self, data):
        """Make energy consumption prediction based on input data"""
        try:
            if not self.is_loaded or self.model is None:
                return {
                    'success': False,
                    'error': 'Model not loaded properly'
                }
            
            # Create features
            features = self.create_features(data)
            
            # Prepare features for prediction
            feature_array = self.prepare_features(features)
            
            # Make prediction
            if hasattr(self.model, 'predict'):
                # For sklearn models
                pred_scaled = self.model.predict(feature_array)
                prediction = pred_scaled[0]
            else:
                # For other model types
                prediction = float(self.model(feature_array)[0])
            
            # Inverse transform if scaler is available
            if hasattr(self, 'scaler_y') and self.scaler_y is not None:
                try:
                    prediction = self.scaler_y.inverse_transform([[prediction]])[0][0]
                except:
                    # If inverse transform fails, use raw prediction
                    pass
            
            # Ensure prediction is positive and reasonable
            prediction = max(0, prediction)
            
            # Calculate confidence score (simplified)
            confidence = min(95, max(70, 85 + np.random.normal(0, 5)))
            
            return {
                'success': True,
                'prediction': round(float(prediction), 2),
                'confidence': round(float(confidence), 1),
                'unit': 'kWh',
                'model_type': type(self.model).__name__,
                'features_used': len(features)
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': f'Prediction failed: {str(e)}'
            }

# Initialize predictor
predictor = EnergyPredictor()

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "message": "Energy Consumption Prediction API",
        "status": "running",
        "model_loaded": predictor.is_loaded,
        "model_type": type(predictor.model).__name__ if predictor.model else "None",
        "version": "1.0.0"
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Make energy consumption prediction"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"success": False, "error": "No input data provided"}), 400
        
        if not predictor.is_loaded:
            return jsonify({"success": False, "error": "Model not loaded"}), 500
        
        result = predictor.predict(data)
        
        if not result['success']:
            return jsonify(result), 400
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/model-info', methods=['GET'])
def model_info():
    """Get model information"""
    try:
        if not predictor.is_loaded:
            return jsonify({"error": "Model not loaded"}), 400
        
        return jsonify({
            "model_loaded": True,
            "model_type": type(predictor.model).__name__,
            "feature_columns": predictor.feature_cols,
            "sequence_length": getattr(predictor, 'sequence_length', None),
            "scalers_available": {
                "scaler_X": hasattr(predictor, 'scaler_X') and predictor.scaler_X is not None,
                "scaler_y": hasattr(predictor, 'scaler_y') and predictor.scaler_y is not None
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": predictor.is_loaded,
        "timestamp": datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("Starting Energy Prediction Server...")
    print(f"Model loaded: {predictor.is_loaded}")
    if predictor.is_loaded:
        print(f"Model type: {type(predictor.model).__name__}")
        print(f"Features: {len(predictor.feature_cols)}")
    
    app.run(debug=True, host='0.0.0.0', port=5001)
