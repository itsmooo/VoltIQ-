import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import pickle
import os
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
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
    
    # Lag features
    for lag in [1, 2, 3, 6, 12, 24]:
        df[f'Energy_Lag_{lag}'] = df['EnergyConsumption'].shift(lag)
        df[f'Temp_Lag_{lag}'] = df['Temperature'].shift(lag)
    
    # Rolling statistics
    for window in [3, 6, 12, 24]:
        df[f'Energy_Rolling_Mean_{window}'] = df['EnergyConsumption'].rolling(window).mean()
        df[f'Energy_Rolling_Std_{window}'] = df['EnergyConsumption'].rolling(window).std()
        df[f'Temp_Rolling_Mean_{window}'] = df['Temperature'].rolling(window).mean()
    
    # Drop rows with NaN values
    df = df.dropna().reset_index(drop=True)
    
    return df

def prepare_data(df):
    """Prepare features and target for modeling"""
    # Prepare features and target
    feature_cols = [col for col in df.columns if col not in ['Timestamp', 'EnergyConsumption']]
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

def create_lstm_model(input_shape):
    """Create LSTM model for energy consumption prediction"""
    model = Sequential([
        LSTM(128, return_sequences=True, input_shape=input_shape),
        Dropout(0.3),
        LSTM(64),
        Dropout(0.3),
        Dense(32, activation='relu'),
        Dense(1)
    ])
    
    model.compile(optimizer=Adam(learning_rate=0.001), loss='mse', metrics=['mae'])
    return model

def train_model(X_train, X_test, y_train, y_test):
    """Train the energy consumption prediction model"""
    sequence_length = 24
    
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
        epochs=100,
        batch_size=32,
        callbacks=callbacks,
        verbose=1
    )
    
    return model, history

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
        
        # Prepare data for LSTM
        X_train, X_test, y_train, y_test, scaler_X, scaler_y, feature_cols = prepare_data_for_lstm(df)
        print("Data prepared for LSTM")
        
        # Create and train model
        model, history = train_model(X_train, X_test, y_train, y_test)
        print("Model training completed")
        
        # Save model and scalers
        model_path = os.path.join(models_dir, 'lstm_model.h5')
        model.save(model_path)
        print(f"Model saved to: {model_path}")
        
        with open(os.path.join(models_dir, 'scaler_X.pkl'), 'wb') as f:
            pickle.dump(scaler_X, f)
        with open(os.path.join(models_dir, 'scaler_y.pkl'), 'wb') as f:
            pickle.dump(scaler_y, f)
        with open(os.path.join(models_dir, 'feature_cols.pkl'), 'wb') as f:
            pickle.dump(feature_cols, f)
        
        print("Model and scalers saved successfully!")
        
        # Verify files exist
        for file_name in ['lstm_model.h5', 'scaler_X.pkl', 'scaler_y.pkl', 'feature_cols.pkl']:
            file_path = os.path.join(models_dir, file_name)
            if os.path.exists(file_path):
                print(f"Verified {file_name} exists")
            else:
                print(f"WARNING: {file_name} not found!")
        
        # Plot training history
        plt.figure(figsize=(10, 6))
        plt.plot(history.history['loss'], label='Training Loss')
        plt.plot(history.history['val_loss'], label='Validation Loss')
        plt.title('Model Training History')
        plt.xlabel('Epoch')
        plt.ylabel('Loss')
        plt.legend()
        plt.savefig(os.path.join(models_dir, 'training_history.png'))
        plt.close()
        print("Training history plot saved")
                
    except Exception as e:
        print(f"Error during training: {str(e)}")
        import traceback
        print(traceback.format_exc())
