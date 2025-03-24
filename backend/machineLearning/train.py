import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
import joblib
from ..globals import cursor

def train_model():
    # Load the data from the database
    query = "SELECT * FROM financial_data"
    data = pd.read_sql(query, cursor.connection)
    
    # Preprocess the data
    # ...existing code...
    
    # Split the data into features and target
    X = data.drop(columns=['is_saving'])
    y = data['is_saving']
    
    # Split the data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train the model
    model = LogisticRegression()
    model.fit(X_train, y_train)
    
    # Save the model
    joblib.dump(model, 'model.pkl')
    
    # Evaluate the model
    accuracy = model.score(X_test, y_test)
    print(f'Model accuracy: {accuracy}')
