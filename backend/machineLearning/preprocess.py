import pandas as pd

def preprocess_data(data):
    # Handle missing values
    data = data.fillna(method='ffill')
    
    # Feature engineering
    # ...existing code...
    
    # Convert categorical variables to numerical
    data = pd.get_dummies(data, drop_first=True)
    
    return data
