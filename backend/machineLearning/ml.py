import joblib
import pandas as pd
from .preprocess import preprocess_data
from ..globals import cursor

def predict_saving(user_id):
    # Load the model
    model = joblib.load('model.pkl')
    
    # Load the user's data from the database
    query = f"SELECT * FROM financial_data WHERE user_id = {user_id}"
    data = pd.read_sql(query, cursor.connection)
    
    # Preprocess the data
    data = preprocess_data(data)
    
    # Predict
    prediction = model.predict(data)
    
    return prediction
