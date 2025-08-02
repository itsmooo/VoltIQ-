import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import pickle
import os
from sklearn.preprocessing import StandardScaler, RobustScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, ExtraTreesRegressor
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.svm import SVR
from sklearn.neural_network import MLPRegressor
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, LSTM, Dropout, BatchNormalization
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
    project_root = os.path.dirname(script_dir)
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
    """Create enhanced features for the model"""
    df = df.copy()
    
    # Time-based features
    df['Timestamp'] = pd.to_datetime(df['Timestamp'])
    df['Hour'] = df['Timestamp'].dt.hour
    df['Month'] = df['Timestamp'].dt.month
    df['Quarter'] = df['Timestamp'].dt.quarter
    df['DayOfYear'] = df['Timestamp'].dt.dayofyear
    df['WeekOfYear'] = df['Timestamp'].dt.isocalendar().week
    df['DayOfMonth'] = df['Timestamp'].dt.day
    
    # DayOfWeek is already in the dataset as a string, convert it to numeric
    day_mapping = {'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4, 'Saturday': 5, 'Sunday': 6}
    df['DayOfWeek'] = df['DayOfWeek'].map(day_mapping)
    
    # Convert boolean columns
    df['Holiday'] = df['Holiday'].map({'No': 0, 'Yes': 1})
    df['HVACUsage'] = df['HVACUsage'].map({'Off': 0, 'On': 1})
    df['LightingUsage'] = df['LightingUsage'].map({'Off': 0, 'On': 1})
    
    # Enhanced cyclical encoding
    df['Hour_sin'] = np.sin(2 * np.pi * df['Hour'] / 24)
    df['Hour_cos'] = np.cos(2 * np.pi * df['Hour'] / 24)
    df['DayOfWeek_sin'] = np.sin(2 * np.pi * df['DayOfWeek'] / 7)
    df['DayOfWeek_cos'] = np.cos(2 * np.pi * df['DayOfWeek'] / 7)
    df['Month_sin'] = np.sin(2 * np.pi * df['Month'] / 12)
    df['Month_cos'] = np.cos(2 * np.pi * df['Month'] / 12)
    df['DayOfYear_sin'] = np.sin(2 * np.pi * df['DayOfYear'] / 365)
    df['DayOfYear_cos'] = np.cos(2 * np.pi * df['DayOfYear'] / 365)
    
    # Enhanced boolean features
    df['IsWeekend'] = (df['DayOfWeek'] >= 5).astype(int)
    df['IsPeakHour'] = ((df['Hour'] >= 7) & (df['Hour'] <= 9) | 
                        (df['Hour'] >= 17) & (df['Hour'] <= 19)).astype(int)
    df['IsBusinessHour'] = ((df['Hour'] >= 8) & (df['Hour'] <= 18)).astype(int)
    df['IsNight'] = ((df['Hour'] >= 22) | (df['Hour'] <= 6)).astype(int)
    df['IsMorning'] = ((df['Hour'] >= 6) & (df['Hour'] <= 12)).astype(int)
    df['IsAfternoon'] = ((df['Hour'] >= 12) & (df['Hour'] <= 18)).astype(int)
    df['IsEvening'] = ((df['Hour'] >= 18) & (df['Hour'] <= 22)).astype(int)
    
    # Enhanced interaction features
    df['TempHumidity'] = df['Temperature'] * df['Humidity']
    df['TempSquared'] = df['Temperature'] ** 2
    df['HumiditySquared'] = df['Humidity'] ** 2
    df['TempCubed'] = df['Temperature'] ** 3
    df['HumidityCubed'] = df['Humidity'] ** 3
    df['HVAC_Temp'] = df['HVACUsage'] * df['Temperature']
    df['Lighting_Hour'] = df['LightingUsage'] * df['Hour']
    df['Occupancy_SqFt'] = df['Occupancy'] / (df['SquareFootage'] + 1e-8)
    df['EnergyEfficiency'] = df['RenewableEnergy'] / (df['EnergyConsumption'] + 1e-8)
    df['OccupancyDensity'] = df['Occupancy'] / (df['SquareFootage'] + 1e-8)
    df['TempHumidityRatio'] = df['Temperature'] / (df['Humidity'] + 1e-8)
    
    # Advanced features
    df['TotalUsage'] = df['HVACUsage'] + df['LightingUsage']
    df['UsageIntensity'] = df['TotalUsage'] * df['Occupancy']
    df['EnvironmentalStress'] = df['Temperature'] * df['Humidity'] * df['Occupancy']
    df['BuildingEfficiency'] = df['SquareFootage'] / (df['EnergyConsumption'] + 1e-8)
    
    # Lag features (only for LSTM)
    for lag in [1, 2, 3, 6, 12, 24]:
        df[f'Energy_Lag_{lag}'] = df['EnergyConsumption'].shift(lag)
        df[f'Temp_Lag_{lag}'] = df['Temperature'].shift(lag)
        df[f'Humidity_Lag_{lag}'] = df['Humidity'].shift(lag)
    
    # Rolling statistics (only for LSTM)
    for window in [3, 6, 12, 24]:
        df[f'Energy_Rolling_Mean_{window}'] = df['EnergyConsumption'].rolling(window, min_periods=1).mean()
        df[f'Energy_Rolling_Std_{window}'] = df['EnergyConsumption'].rolling(window, min_periods=1).std()
        df[f'Temp_Rolling_Mean_{window}'] = df['Temperature'].rolling(window, min_periods=1).mean()
        df[f'Humidity_Rolling_Mean_{window}'] = df['Humidity'].rolling(window, min_periods=1).mean()
    
    # Fill NaN values with forward fill and then backward fill
    df = df.fillna(method='ffill').fillna(method='bfill')
    
    return df

def prepare_data(df):
    """Prepare features and target for traditional ML models"""
    # Remove lag and rolling features for traditional ML
    feature_cols = [col for col in df.columns if col not in ['Timestamp', 'EnergyConsumption'] 
                   and not col.startswith('Energy_Lag_') and not col.startswith('Temp_Lag_') 
                   and not col.startswith('Humidity_Lag_') and not col.startswith('Energy_Rolling_') 
                   and not col.startswith('Temp_Rolling_') and not col.startswith('Humidity_Rolling_')]
    
    X = df[feature_cols].values
    y = df['EnergyConsumption'].values
    
    # Use RobustScaler for better handling of outliers
    scaler_X = RobustScaler()
    scaler_y = RobustScaler()
    
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
    # Fill NaN values
    df_clean = df.fillna(method='ffill').fillna(method='bfill')
    
    # Prepare features and target
    feature_cols = [col for col in df_clean.columns if col not in ['Timestamp', 'EnergyConsumption']]
    X = df_clean[feature_cols].values
    y = df_clean['EnergyConsumption'].values
    
    # Scale the data
    scaler_X = RobustScaler()
    scaler_y = RobustScaler()
    
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

def calculate_improved_accuracy(y_true, y_pred):
    """Calculate improved accuracy metrics"""
    # Calculate percentage error
    percentage_errors = np.abs((y_true - y_pred) / y_true) * 100
    
    # Calculate accuracy based on percentage error
    # 90% accuracy means predictions are within 10% of actual values
    within_10_percent = np.mean(percentage_errors <= 10)
    within_5_percent = np.mean(percentage_errors <= 5)
    within_1_percent = np.mean(percentage_errors <= 1)
    
    # Calculate overall accuracy (inverse of mean percentage error)
    mean_percentage_error = np.mean(percentage_errors)
    accuracy = max(0, 100 - mean_percentage_error)
    
    return {
        'accuracy': accuracy,
        'within_1_percent': within_1_percent * 100,
        'within_5_percent': within_5_percent * 100,
        'within_10_percent': within_10_percent * 100,
        'mean_percentage_error': mean_percentage_error
    }

def evaluate_model(model, X_test, y_test, scaler_y, model_name):
    """Evaluate model performance with improved accuracy calculation"""
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
    
    # Calculate improved accuracy metrics
    accuracy_metrics = calculate_improved_accuracy(y_true, y_pred)
    
    print(f"\n{model_name} Performance:")
    print(f"RMSE: {rmse:.2f}")
    print(f"MAE: {mae:.2f}")
    print(f"R² Score: {r2:.3f}")
    print(f"Overall Accuracy: {accuracy_metrics['accuracy']:.1f}%")
    print(f"Predictions within 1%: {accuracy_metrics['within_1_percent']:.1f}%")
    print(f"Predictions within 5%: {accuracy_metrics['within_5_percent']:.1f}%")
    print(f"Predictions within 10%: {accuracy_metrics['within_10_percent']:.1f}%")
    print(f"Mean Percentage Error: {accuracy_metrics['mean_percentage_error']:.2f}%")
    
    return {
        'model_name': model_name,
        'rmse': rmse,
        'mae': mae,
        'r2': r2,
        'accuracy': accuracy_metrics['accuracy'],
        'within_1_percent': accuracy_metrics['within_1_percent'],
        'within_5_percent': accuracy_metrics['within_5_percent'],
        'within_10_percent': accuracy_metrics['within_10_percent'],
        'mean_percentage_error': accuracy_metrics['mean_percentage_error'],
        'model': model
    }

def train_enhanced_models(X_train, X_test, y_train, y_test, scaler_y):
    """Train enhanced ML models with hyperparameter tuning"""
    models = {
        'Random Forest': RandomForestRegressor(
            n_estimators=200, 
            max_depth=15, 
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42
        ),
        'Gradient Boosting': GradientBoostingRegressor(
            n_estimators=200,
            learning_rate=0.1,
            max_depth=8,
            min_samples_split=5,
            random_state=42
        ),
        'Extra Trees': ExtraTreesRegressor(
            n_estimators=200,
            max_depth=15,
            min_samples_split=5,
            random_state=42
        ),
        'Ridge Regression': Ridge(alpha=1.0),
        'Lasso Regression': Lasso(alpha=0.01),
        'SVR': SVR(kernel='rbf', C=10.0, gamma='scale'),
        'Neural Network': MLPRegressor(
            hidden_layer_sizes=(100, 50, 25),
            activation='relu',
            solver='adam',
            alpha=0.001,
            max_iter=500,
            random_state=42
        )
    }
    
    results = {}
    
    for name, model in models.items():
        print(f"\nTraining {name}...")
        model.fit(X_train, y_train)
        results[name] = evaluate_model(model, X_test, y_test, scaler_y, name)
    
    return results

def create_enhanced_lstm_model(input_shape):
    """Create enhanced LSTM model for energy consumption prediction"""
    model = Sequential([
        LSTM(128, return_sequences=True, input_shape=input_shape),
        BatchNormalization(),
        Dropout(0.3),
        LSTM(64, return_sequences=True),
        BatchNormalization(),
        Dropout(0.3),
        LSTM(32),
        BatchNormalization(),
        Dropout(0.3),
        Dense(64, activation='relu'),
        BatchNormalization(),
        Dropout(0.2),
        Dense(32, activation='relu'),
        Dense(16, activation='relu'),
        Dense(1)
    ])
    
    model.compile(optimizer=Adam(learning_rate=0.001), loss='mse', metrics=['mae'])
    return model

def train_enhanced_lstm_model(X_train, X_test, y_train, y_test, scaler_y):
    """Train enhanced LSTM model"""
    sequence_length = 24  # Increased for better performance
    
    # Create sequences for LSTM
    X_train_seq = np.array([X_train[i:i+sequence_length] 
                           for i in range(len(X_train)-sequence_length)])
    y_train_seq = y_train[sequence_length:]
    
    X_test_seq = np.array([X_test[i:i+sequence_length] 
                          for i in range(len(X_test)-sequence_length)])
    y_test_seq = y_test[sequence_length:]
    
    # Create and train model
    model = create_enhanced_lstm_model((sequence_length, X_train.shape[1]))
    
    callbacks = [
        EarlyStopping(monitor='val_loss', patience=15, restore_best_weights=True),
        ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=8, min_lr=1e-7)
    ]
    
    print("\nTraining Enhanced LSTM model...")
    history = model.fit(
        X_train_seq, y_train_seq,
        validation_data=(X_test_seq, y_test_seq),
        epochs=100,
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
    
    # Calculate improved accuracy metrics
    accuracy_metrics = calculate_improved_accuracy(y_true, y_pred)
    
    print(f"\nEnhanced LSTM Performance:")
    print(f"RMSE: {rmse:.2f}")
    print(f"MAE: {mae:.2f}")
    print(f"R² Score: {r2:.3f}")
    print(f"Overall Accuracy: {accuracy_metrics['accuracy']:.1f}%")
    print(f"Predictions within 1%: {accuracy_metrics['within_1_percent']:.1f}%")
    print(f"Predictions within 5%: {accuracy_metrics['within_5_percent']:.1f}%")
    print(f"Predictions within 10%: {accuracy_metrics['within_10_percent']:.1f}%")
    print(f"Mean Percentage Error: {accuracy_metrics['mean_percentage_error']:.2f}%")
    
    return {
        'model_name': 'Enhanced LSTM',
        'rmse': rmse,
        'mae': mae,
        'r2': r2,
        'accuracy': accuracy_metrics['accuracy'],
        'within_1_percent': accuracy_metrics['within_1_percent'],
        'within_5_percent': accuracy_metrics['within_5_percent'],
        'within_10_percent': accuracy_metrics['within_10_percent'],
        'mean_percentage_error': accuracy_metrics['mean_percentage_error'],
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
        
        traditional_results = train_enhanced_models(X_train, X_test, y_train, y_test, scaler_y)
        
        # Train LSTM model
        X_train_lstm, X_test_lstm, y_train_lstm, y_test_lstm, scaler_X_lstm, scaler_y_lstm, feature_cols_lstm = prepare_data_for_lstm(df)
        print("Data prepared for LSTM")
        
        lstm_result = train_enhanced_lstm_model(X_train_lstm, X_test_lstm, y_train_lstm, y_test_lstm, scaler_y_lstm)
        
        # Combine all results
        all_results = {**traditional_results, 'Enhanced LSTM': lstm_result}
        
        # Find the best model
        best_model_name = max(all_results.keys(), key=lambda x: all_results[x]['accuracy'])
        best_model = all_results[best_model_name]['model']
        best_scaler_X = scaler_X if best_model_name != 'Enhanced LSTM' else scaler_X_lstm
        best_scaler_y = scaler_y if best_model_name != 'Enhanced LSTM' else scaler_y_lstm
        best_feature_cols = feature_cols if best_model_name != 'Enhanced LSTM' else feature_cols_lstm
        
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
        
        # Create enhanced comparison plots
        model_names = list(all_results.keys())
        accuracies = [all_results[name]['accuracy'] for name in model_names]
        within_10_percent = [all_results[name]['within_10_percent'] for name in model_names]
        
        plt.figure(figsize=(15, 10))
        
        # Overall Accuracy comparison
        plt.subplot(2, 3, 1)
        bars = plt.bar(model_names, accuracies, color=['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2'])
        plt.title('Model Overall Accuracy Comparison')
        plt.ylabel('Accuracy (%)')
        plt.xticks(rotation=45)
        
        # Add value labels on bars
        for bar, acc in zip(bars, accuracies):
            plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.5, 
                    f'{acc:.1f}%', ha='center', va='bottom')
        
        # Predictions within 10% comparison
        plt.subplot(2, 3, 2)
        bars = plt.bar(model_names, within_10_percent, color=['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2'])
        plt.title('Predictions within 10% of Actual')
        plt.ylabel('Percentage (%)')
        plt.xticks(rotation=45)
        
        for bar, acc in zip(bars, within_10_percent):
            plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.5, 
                    f'{acc:.1f}%', ha='center', va='bottom')
        
        # R² Score comparison
        plt.subplot(2, 3, 3)
        r2_scores = [all_results[name]['r2'] for name in model_names]
        bars = plt.bar(model_names, r2_scores, color=['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2'])
        plt.title('Model R² Score Comparison')
        plt.ylabel('R² Score')
        plt.xticks(rotation=45)
        
        for bar, r2 in zip(bars, r2_scores):
            plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01, 
                    f'{r2:.3f}', ha='center', va='bottom')
        
        # RMSE comparison
        plt.subplot(2, 3, 4)
        rmse_scores = [all_results[name]['rmse'] for name in model_names]
        bars = plt.bar(model_names, rmse_scores, color=['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2'])
        plt.title('Model RMSE Comparison')
        plt.ylabel('RMSE')
        plt.xticks(rotation=45)
        
        for bar, rmse in zip(bars, rmse_scores):
            plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.1, 
                    f'{rmse:.2f}', ha='center', va='bottom')
        
        # MAE comparison
        plt.subplot(2, 3, 5)
        mae_scores = [all_results[name]['mae'] for name in model_names]
        bars = plt.bar(model_names, mae_scores, color=['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2'])
        plt.title('Model MAE Comparison')
        plt.ylabel('MAE')
        plt.xticks(rotation=45)
        
        for bar, mae in zip(bars, mae_scores):
            plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.1, 
                    f'{mae:.2f}', ha='center', va='bottom')
        
        # Mean Percentage Error comparison
        plt.subplot(2, 3, 6)
        mpe_scores = [all_results[name]['mean_percentage_error'] for name in model_names]
        bars = plt.bar(model_names, mpe_scores, color=['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2'])
        plt.title('Mean Percentage Error')
        plt.ylabel('Error (%)')
        plt.xticks(rotation=45)
        
        for bar, mpe in zip(bars, mpe_scores):
            plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.1, 
                    f'{mpe:.2f}%', ha='center', va='bottom')
        
        plt.tight_layout()
        plt.savefig(os.path.join(models_dir, 'enhanced_model_analysis.png'), dpi=300, bbox_inches='tight')
        plt.close()
        
        # Plot training history for LSTM if available
        if 'history' in lstm_result:
            plt.figure(figsize=(12, 8))
            
            plt.subplot(2, 2, 1)
            plt.plot(lstm_result['history'].history['loss'], label='Training Loss')
            plt.plot(lstm_result['history'].history['val_loss'], label='Validation Loss')
            plt.title('Enhanced LSTM Training History - Loss')
            plt.xlabel('Epoch')
            plt.ylabel('Loss')
            plt.legend()
            
            plt.subplot(2, 2, 2)
            plt.plot(lstm_result['history'].history['mae'], label='Training MAE')
            plt.plot(lstm_result['history'].history['val_mae'], label='Validation MAE')
            plt.title('Enhanced LSTM Training History - MAE')
            plt.xlabel('Epoch')
            plt.ylabel('MAE')
            plt.legend()
            
            plt.tight_layout()
            plt.savefig(os.path.join(models_dir, 'enhanced_training_history.png'))
            plt.close()
        
        print("Enhanced model comparison plots saved successfully!")
        print(f"\nBest model ({best_model_name}) saved with accuracy: {all_results[best_model_name]['accuracy']:.1f}%")
        print(f"Predictions within 10%: {all_results[best_model_name]['within_10_percent']:.1f}%")
        print(f"Mean Percentage Error: {all_results[best_model_name]['mean_percentage_error']:.2f}%")
                
    except Exception as e:
        print(f"Error during training: {str(e)}")
        import traceback
        print(traceback.format_exc())
