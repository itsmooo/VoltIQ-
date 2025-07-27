import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import pickle
import os
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.svm import SVR
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, LSTM, Dropout
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
from tensorflow.keras.optimizers import Adam
import warnings
warnings.filterwarnings('ignore')

# Set TensorFlow logging level
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# Set random seeds for reproducibility
np.random.seed(42)
tf.random.set_seed(42)

def load_and_preprocess_data():
    """Load and preprocess the energy consumption dataset"""
    print("Loading and preprocessing electricity consumption dataset...")
    
    # Load the dataset from the correct path
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(script_dir))
    data_path = os.path.join(project_root, 'data', 'Energy_consumption.csv')
    print(f"Loading data from: {data_path}")
    
    df = pd.read_csv(data_path)
    
    print(f"Dataset shape: {df.shape}")
    print(f"Columns: {df.columns.tolist()}")
    
    # Convert timestamp and sort data
    df['Timestamp'] = pd.to_datetime(df['Timestamp'])
    df = df.sort_values('Timestamp').reset_index(drop=True)
    
    return df

def create_features(df):
    """Create features for the model"""
    df = df.copy()
    
    # Time-based features
    df['Timestamp'] = pd.to_datetime(df['Timestamp'])
    df['Hour'] = df['Timestamp'].dt.hour
    df['Month'] = df['Timestamp'].dt.month
    df['Quarter'] = df['Timestamp'].dt.quarter
    df['DayOfYear'] = df['Timestamp'].dt.dayofyear
    df['WeekOfYear'] = df['Timestamp'].dt.isocalendar().week
    
    # DayOfWeek is already in the dataset as a string, convert it to numeric
    day_mapping = {'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4, 'Saturday': 5, 'Sunday': 6}
    df['DayOfWeek'] = df['DayOfWeek'].map(day_mapping)
    
    # Convert boolean columns
    df['Holiday'] = df['Holiday'].map({'No': 0, 'Yes': 1})
    
    # Cyclical encoding
    df['Hour_sin'] = np.sin(2 * np.pi * df['Hour'] / 24)
    df['Hour_cos'] = np.cos(2 * np.pi * df['Hour'] / 24)
    df['DayOfWeek_sin'] = np.sin(2 * np.pi * df['DayOfWeek'] / 7)
    df['DayOfWeek_cos'] = np.cos(2 * np.pi * df['DayOfWeek'] / 7)
    df['Month_sin'] = np.sin(2 * np.pi * df['Month'] / 12)
    df['Month_cos'] = np.cos(2 * np.pi * df['Month'] / 12)
    
    # Boolean features
    df['IsWeekend'] = (df['DayOfWeek'] >= 5).astype(int)
    df['IsPeakHour'] = ((df['Hour'] >= 7) & (df['Hour'] <= 9) | 
                        (df['Hour'] >= 17) & (df['Hour'] <= 19)).astype(int)
    df['IsBusinessHour'] = ((df['Hour'] >= 8) & (df['Hour'] <= 18)).astype(int)
    
    # Convert categorical variables
    df['HVACUsage'] = df['HVACUsage'].map({'Off': 0, 'On': 1})
    df['LightingUsage'] = df['LightingUsage'].map({'Off': 0, 'On': 1})
    df['Holiday'] = df['Holiday'].map({'No': 0, 'Yes': 1})
    
    # Interaction features
    df['TempHumidity'] = df['Temperature'] * df['Humidity']
    df['TempSquared'] = df['Temperature'] ** 2
    df['HumiditySquared'] = df['Humidity'] ** 2
    df['HVAC_Temp'] = df['HVACUsage'] * df['Temperature']
    df['Lighting_Hour'] = df['LightingUsage'] * df['Hour']
    df['Occupancy_SqFt'] = df['Occupancy'] / df['SquareFootage']
    
    # Lag features (only for LSTM)
    for lag in [1, 2, 3, 6, 12, 24]:
        df[f'Energy_Lag_{lag}'] = df['EnergyConsumption'].shift(lag)
        df[f'Temp_Lag_{lag}'] = df['Temperature'].shift(lag)
    
    # Rolling statistics (only for LSTM)
    for window in [3, 6, 12, 24]:
        df[f'Energy_Rolling_Mean_{window}'] = df['EnergyConsumption'].rolling(window).mean()
        df[f'Energy_Rolling_Std_{window}'] = df['EnergyConsumption'].rolling(window).std()
        df[f'Temp_Rolling_Mean_{window}'] = df['Temperature'].rolling(window).mean()
    
    # Drop rows with NaN values
    df = df.dropna().reset_index(drop=True)
    
    return df

def prepare_data(df):
    """Prepare features and target for traditional ML models"""
    # Remove lag and rolling features for traditional ML
    feature_cols = [col for col in df.columns if col not in ['Timestamp', 'EnergyConsumption'] 
                   and not col.startswith('Energy_Lag_') and not col.startswith('Temp_Lag_') 
                   and not col.startswith('Energy_Rolling_') and not col.startswith('Temp_Rolling_')]
    
    X = df[feature_cols].values
    y = df['EnergyConsumption'].values
    
    # Scale the data
    scaler_X = StandardScaler()
    scaler_y = StandardScaler()
    
    X_scaled = scaler_X.fit_transform(X)
    y_scaled = scaler_y.fit_transform(y.reshape(-1, 1)).flatten()
    
    # Split the data
    train_size = int(0.7 * len(X_scaled))
    val_size = int(0.15 * len(X_scaled))
    
    X_train = X_scaled[:train_size]
    X_val = X_scaled[train_size:train_size + val_size]
    X_test = X_scaled[train_size + val_size:]
    
    y_train = y_scaled[:train_size]
    y_val = y_scaled[train_size:train_size + val_size]
    y_test = y_scaled[train_size + val_size:]
    
    return (X_train, X_val, X_test, y_train, y_val, y_test, 
            scaler_X, scaler_y, feature_cols)

def prepare_data_for_lstm(df):
    """Prepare features and target for LSTM modeling"""
    # Remove rows with NaN values (from lag and rolling features)
    df_clean = df.dropna().reset_index(drop=True)
    
    # Prepare features and target
    feature_cols = [col for col in df_clean.columns if col not in ['Timestamp', 'EnergyConsumption']]
    X = df_clean[feature_cols].values
    y = df_clean['EnergyConsumption'].values
    
    # Scale the data
    scaler_X = StandardScaler()
    scaler_y = StandardScaler()
    
    X_scaled = scaler_X.fit_transform(X)
    y_scaled = scaler_y.fit_transform(y.reshape(-1, 1)).flatten()
    
    # Split the data
    train_size = int(0.7 * len(X_scaled))
    test_size = int(0.3 * len(X_scaled))
    
    X_train = X_scaled[:train_size]
    X_test = X_scaled[train_size:train_size + test_size]
    
    y_train = y_scaled[:train_size]
    y_test = y_scaled[train_size:train_size + test_size]
    
    return (X_train, X_test, y_train, y_test, scaler_X, scaler_y, feature_cols)

def evaluate_model(model, X_test, y_test, scaler_y, model_name):
    """Evaluate model performance"""
    # Make predictions
    y_pred_scaled = model.predict(X_test)
    
    # Inverse transform predictions
    if hasattr(model, 'predict_proba'):
        y_pred = scaler_y.inverse_transform(y_pred_scaled.reshape(-1, 1)).flatten()
    else:
        y_pred = scaler_y.inverse_transform(y_pred_scaled.reshape(-1, 1)).flatten()
    
    y_true = scaler_y.inverse_transform(y_test.reshape(-1, 1)).flatten()
    
    # Calculate metrics
    mse = mean_squared_error(y_true, y_pred)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y_true, y_pred)
    r2 = r2_score(y_true, y_pred)
    
    # Calculate accuracy percentage (how close predictions are to actual values)
    accuracy = max(0, 100 - (mae / np.mean(y_true)) * 100)
    
    print(f"\n{model_name} Performance:")
    print(f"RMSE: {rmse:.2f}")
    print(f"MAE: {mae:.2f}")
    print(f"R² Score: {r2:.3f}")
    print(f"Accuracy: {accuracy:.1f}%")
    
    return {
        'model_name': model_name,
        'rmse': rmse,
        'mae': mae,
        'r2': r2,
        'accuracy': accuracy,
        'model': model
    }

def train_traditional_models(X_train, X_test, y_train, y_test, scaler_y):
    """Train traditional ML models"""
    models = {
        'Random Forest': RandomForestRegressor(n_estimators=100, random_state=42),
        'Gradient Boosting': GradientBoostingRegressor(n_estimators=100, random_state=42),
        'Linear Regression': LinearRegression(),
        'SVR': SVR(kernel='rbf', C=1.0, gamma='scale')
    }
    
    results = {}
    
    for name, model in models.items():
        print(f"\nTraining {name}...")
        model.fit(X_train, y_train)
        results[name] = evaluate_model(model, X_test, y_test, scaler_y, name)
    
    return results

def create_lstm_model(input_shape):
    """Create LSTM model for energy consumption prediction"""
    model = Sequential([
        LSTM(64, return_sequences=True, input_shape=input_shape),
        Dropout(0.2),
        LSTM(32),
        Dropout(0.2),
        Dense(16, activation='relu'),
        Dense(1)
    ])
    
    model.compile(optimizer=Adam(learning_rate=0.001), loss='mse', metrics=['mae'])
    return model

def train_lstm_model(X_train, X_test, y_train, y_test, scaler_y):
    """Train LSTM model"""
    sequence_length = 12  # Reduced from 24 for better performance
    
    # Create sequences for LSTM
    X_train_seq = np.array([X_train[i:i+sequence_length] 
                           for i in range(len(X_train)-sequence_length)])
    y_train_seq = y_train[sequence_length:]
    
    X_test_seq = np.array([X_test[i:i+sequence_length] 
                          for i in range(len(X_test)-sequence_length)])
    y_test_seq = y_test[sequence_length:]
    
    # Create and train model
    model = create_lstm_model((sequence_length, X_train.shape[1]))
    
    callbacks = [
        EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True),
        ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=5, min_lr=1e-6)
    ]
    
    print("\nTraining LSTM model...")
    history = model.fit(
        X_train_seq, y_train_seq,
        validation_data=(X_test_seq, y_test_seq),
        epochs=50,  # Reduced from 100
        batch_size=32,
        callbacks=callbacks,
        verbose=1
    )
    
    # Evaluate LSTM
    y_pred_scaled = model.predict(X_test_seq)
    y_pred = scaler_y.inverse_transform(y_pred_scaled).flatten()
    y_true = scaler_y.inverse_transform(y_test_seq.reshape(-1, 1)).flatten()
    
    mse = mean_squared_error(y_true, y_pred)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y_true, y_pred)
    r2 = r2_score(y_true, y_pred)
    accuracy = max(0, 100 - (mae / np.mean(y_true)) * 100)
    
    print(f"\nLSTM Performance:")
    print(f"RMSE: {rmse:.2f}")
    print(f"MAE: {mae:.2f}")
    print(f"R² Score: {r2:.3f}")
    print(f"Accuracy: {accuracy:.1f}%")
    
    return {
        'model_name': 'LSTM',
        'rmse': rmse,
        'mae': mae,
        'r2': r2,
        'accuracy': accuracy,
        'model': model,
        'history': history
    }

if __name__ == "__main__":
    try:
        # Create models directory if it doesn't exist
        script_dir = os.path.dirname(os.path.abspath(__file__))
        models_dir = os.path.join(script_dir, 'models')
        os.makedirs(models_dir, exist_ok=True)
        print(f"Models directory: {models_dir}")
        
        # Load and preprocess data
        df = load_and_preprocess_data()
        
        # Create features
        df = create_features(df)
        print("Features created successfully")
        
        # Train traditional ML models
        X_train, X_val, X_test, y_train, y_val, y_test, scaler_X, scaler_y, feature_cols = prepare_data(df)
        print("Data prepared for traditional ML models")
        
        traditional_results = train_traditional_models(X_train, X_test, y_train, y_test, scaler_y)
        
        # Train LSTM model
        X_train_lstm, X_test_lstm, y_train_lstm, y_test_lstm, scaler_X_lstm, scaler_y_lstm, feature_cols_lstm = prepare_data_for_lstm(df)
        print("Data prepared for LSTM")
        
        lstm_result = train_lstm_model(X_train_lstm, X_test_lstm, y_train_lstm, y_test_lstm, scaler_y_lstm)
        
        # Combine all results
        all_results = {**traditional_results, 'LSTM': lstm_result}
        
        # Find the best model
        best_model_name = max(all_results.keys(), key=lambda x: all_results[x]['accuracy'])
        best_model = all_results[best_model_name]['model']
        best_scaler_X = scaler_X if best_model_name != 'LSTM' else scaler_X_lstm
        best_scaler_y = scaler_y if best_model_name != 'LSTM' else scaler_y_lstm
        best_feature_cols = feature_cols if best_model_name != 'LSTM' else feature_cols_lstm
        
        print(f"\n{'='*50}")
        print(f"BEST MODEL: {best_model_name}")
        print(f"Accuracy: {all_results[best_model_name]['accuracy']:.1f}%")
        print(f"R² Score: {all_results[best_model_name]['r2']:.3f}")
        print(f"{'='*50}")
        
        # Save the best model and scalers
        model_path = os.path.join(models_dir, 'electricity_consumption_models.pkl')
        with open(model_path, 'wb') as f:
            pickle.dump(best_model, f)
        
        with open(os.path.join(models_dir, 'scaler_X.pkl'), 'wb') as f:
            pickle.dump(best_scaler_X, f)
        with open(os.path.join(models_dir, 'scaler_y.pkl'), 'wb') as f:
            pickle.dump(best_scaler_y, f)
        with open(os.path.join(models_dir, 'feature_cols.pkl'), 'wb') as f:
            pickle.dump(best_feature_cols, f)
        
        # Save model comparison results
        comparison_data = {
            'best_model': best_model_name,
            'all_results': {name: {k: v for k, v in result.items() if k != 'model'} 
                           for name, result in all_results.items()}
        }
        
        with open(os.path.join(models_dir, 'model_results.pkl'), 'wb') as f:
            pickle.dump(comparison_data, f)
        
        print("Model and scalers saved successfully!")
        
        # Create comparison plot
        model_names = list(all_results.keys())
        accuracies = [all_results[name]['accuracy'] for name in model_names]
        
        plt.figure(figsize=(12, 8))
        
        # Accuracy comparison
        plt.subplot(2, 2, 1)
        bars = plt.bar(model_names, accuracies, color=['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'])
        plt.title('Model Accuracy Comparison')
        plt.ylabel('Accuracy (%)')
        plt.xticks(rotation=45)
        
        # Add value labels on bars
        for bar, acc in zip(bars, accuracies):
            plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.5, 
                    f'{acc:.1f}%', ha='center', va='bottom')
        
        # R² Score comparison
        plt.subplot(2, 2, 2)
        r2_scores = [all_results[name]['r2'] for name in model_names]
        bars = plt.bar(model_names, r2_scores, color=['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'])
        plt.title('Model R² Score Comparison')
        plt.ylabel('R² Score')
        plt.xticks(rotation=45)
        
        for bar, r2 in zip(bars, r2_scores):
            plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01, 
                    f'{r2:.3f}', ha='center', va='bottom')
        
        # RMSE comparison
        plt.subplot(2, 2, 3)
        rmse_scores = [all_results[name]['rmse'] for name in model_names]
        bars = plt.bar(model_names, rmse_scores, color=['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'])
        plt.title('Model RMSE Comparison')
        plt.ylabel('RMSE')
        plt.xticks(rotation=45)
        
        for bar, rmse in zip(bars, rmse_scores):
            plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.1, 
                    f'{rmse:.2f}', ha='center', va='bottom')
        
        # MAE comparison
        plt.subplot(2, 2, 4)
        mae_scores = [all_results[name]['mae'] for name in model_names]
        bars = plt.bar(model_names, mae_scores, color=['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'])
        plt.title('Model MAE Comparison')
        plt.ylabel('MAE')
        plt.xticks(rotation=45)
        
        for bar, mae in zip(bars, mae_scores):
            plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.1, 
                    f'{mae:.2f}', ha='center', va='bottom')
        
        plt.tight_layout()
        plt.savefig(os.path.join(models_dir, 'comprehensive_model_analysis.png'), dpi=300, bbox_inches='tight')
        plt.close()
        
        # Plot training history for LSTM if available
        if 'history' in lstm_result:
            plt.figure(figsize=(10, 6))
            plt.plot(lstm_result['history'].history['loss'], label='Training Loss')
            plt.plot(lstm_result['history'].history['val_loss'], label='Validation Loss')
            plt.title('LSTM Model Training History')
            plt.xlabel('Epoch')
            plt.ylabel('Loss')
            plt.legend()
            plt.savefig(os.path.join(models_dir, 'training_history.png'))
            plt.close()
        
        print("Model comparison plots saved successfully!")
        print(f"\nBest model ({best_model_name}) saved with accuracy: {all_results[best_model_name]['accuracy']:.1f}%")
                
    except Exception as e:
        print(f"Error during training: {str(e)}")
        import traceback
        print(traceback.format_exc())
