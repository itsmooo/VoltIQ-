#!/usr/bin/env python3
"""
Test script to verify the prediction fix for dictionary-based models
"""

import sys
import os
import json
import pickle
from pathlib import Path

# Add the ml directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'ml'))

from predict import EnergyPredictor

def test_prediction():
    """Test the prediction functionality"""
    print("Testing Energy Predictor...")
    print("=" * 50)
    
    # Initialize predictor
    predictor = EnergyPredictor()
    
    print(f"Model loaded: {predictor.is_loaded}")
    if predictor.is_loaded:
        print(f"Model type: {type(predictor.model)}")
        if isinstance(predictor.model, dict):
            print("Model is a dictionary")
            if 'model' in predictor.model:
                print(f"Actual model type: {type(predictor.model['model'])}")
            else:
                print("Dictionary keys:", list(predictor.model.keys()))
        print(f"Features: {len(predictor.feature_cols)}")
        print(f"Scalers: X={predictor.scaler_X is not None}, Y={predictor.scaler_y is not None}")
    else:
        print("❌ Model not loaded!")
        return
    
    print("\n" + "=" * 50)
    print("Testing prediction...")
    
    # Test data
    test_data = {
        'temperature': 25.0,
        'humidity': 60.0,
        'squareFootage': 1000.0,
        'occupancy': 5,
        'hvacUsage': True,
        'lightingUsage': True,
        'isHoliday': False,
        'hour': 14,
        'dayOfWeek': 1,
        'month': 6
    }
    
    print("Input data:")
    for key, value in test_data.items():
        print(f"  {key}: {value}")
    
    print("\nMaking prediction...")
    
    try:
        result = predictor.predict(test_data)
        
        print("\nPrediction result:")
        print(f"  Success: {result['success']}")
        
        if result['success']:
            print(f"  Prediction: {result['prediction']} {result['unit']}")
            print(f"  Confidence: {result['confidence']}%")
            print(f"  Model type: {result['model_type']}")
            print(f"  Features used: {result['features_used']}")
            print(f"  Fallback mode: {result.get('fallback_mode', False)}")
            print("✅ Prediction successful!")
        else:
            print(f"  Error: {result['error']}")
            print("❌ Prediction failed!")
            
    except Exception as e:
        print(f"❌ Exception during prediction: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_prediction() 