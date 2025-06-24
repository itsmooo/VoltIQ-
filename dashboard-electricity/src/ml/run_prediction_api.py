#!/usr/bin/env python3
"""
Run the prediction API server
This script starts the Flask server for energy consumption predictions
"""

import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import and run the Flask app from predict.py
from predict import app

if __name__ == '__main__':
    print("Starting Energy Prediction API server...")
    print("Server will be available at http://localhost:5001")
    
    # Run the Flask app
    app.run(
        host='0.0.0.0',
        port=5001,
        debug=True,
        threaded=True
    ) 