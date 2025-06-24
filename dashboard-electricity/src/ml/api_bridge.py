#!/usr/bin/env python3
"""
API Bridge for Energy Prediction
This script is called from Node.js to get predictions from the ML model
"""

import sys
import json
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from predict import predictor

def main():
    try:
        # Get input data from command line arguments
        if len(sys.argv) < 2:
            result = {
                'success': False,
                'error': 'No input data provided'
            }
            print(json.dumps(result))
            return

        # Parse input data
        input_data = json.loads(sys.argv[1])
        
        # Make prediction using the global predictor instance
        result = predictor.predict(input_data)
        
        # Output result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            'success': False,
            'error': f'Prediction failed: {str(e)}'
        }
        print(json.dumps(error_result))

if __name__ == '__main__':
    main() 