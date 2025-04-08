from flask import Blueprint, jsonify
from globals import cursor, conn
from decorators import jwt_required
import os
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

ml_bp = Blueprint('ml_bp', __name__)

# Path to model
model_path = os.path.join(os.path.dirname(__file__), "next_month_net_predictor.pkl")

# --------------------------
# TRAINING BLOCK
# --------------------------
def fetch_data():
    query_income = """
        SELECT 
            name AS username, 
            CONCAT(YEAR(date), '-', RIGHT('0' + CAST(MONTH(date) AS VARCHAR), 2)) AS month, 
            SUM(amount) AS total_income
        FROM salaries 
        GROUP BY name, YEAR(date), MONTH(date)
    """
    query_expense = """
        SELECT 
            username, 
            CONCAT(YEAR(date), '-', RIGHT('0' + CAST(MONTH(date) AS VARCHAR), 2)) AS month, 
            SUM(amount) AS total_expense
        FROM expenses 
        GROUP BY username, YEAR(date), MONTH(date)
    """
    query_saving = """
        SELECT 
            category AS username, 
            CONCAT(YEAR(date), '-', RIGHT('0' + CAST(MONTH(date) AS VARCHAR), 2)) AS month, 
            SUM(amount) AS total_savings
        FROM saving_goals 
        GROUP BY category, YEAR(date), MONTH(date)
    """

    income_df = pd.read_sql(query_income, conn)
    expense_df = pd.read_sql(query_expense, conn)
    saving_df = pd.read_sql(query_saving, conn)

    df = pd.merge(income_df, expense_df, on=["username", "month"], how="outer")
    df = pd.merge(df, saving_df, on=["username", "month"], how="outer")
    df.fillna(0, inplace=True)
    df["net_earnings"] = df["total_income"] - df["total_expense"]
    df.sort_values(by=["username", "month"], inplace=True)
    df["next_month_net"] = df.groupby("username")["net_earnings"].shift(-1)
    df.dropna(subset=["next_month_net"], inplace=True)

    return df[["total_income", "total_expense", "total_savings", "next_month_net"]]

def train_and_save_model():
    df = fetch_data()
    X = df[["total_income", "total_expense", "total_savings"]]
    y = df["next_month_net"]

    model = RandomForestRegressor()
    model.fit(X, y)

    with open(model_path, "wb") as f:
        pickle.dump(model, f)

    print(f"✅ Model trained and saved at {model_path}")

# Train model if not found
if not os.path.exists(model_path):
    train_and_save_model()

# Load model
with open(model_path, "rb") as f:
    model = pickle.load(f)

# --------------------------
# FORECAST API ENDPOINT
# --------------------------
@ml_bp.route("/api/v1.0/predict-next-month", methods=["GET"])
@jwt_required
def predict_next_month(username):
    try:
        # Income
        cursor.execute("""
            SELECT TOP 1 
                CONCAT(YEAR(date), '-', RIGHT('0' + CAST(MONTH(date) AS VARCHAR), 2)) AS month, 
                SUM(amount)
            FROM salaries 
            WHERE name = ? 
            GROUP BY YEAR(date), MONTH(date) 
            ORDER BY month DESC
        """, (username,))
        income_row = cursor.fetchone()
        total_income = float(income_row[1]) if income_row else 0.0

        # Expense
        cursor.execute("""
            SELECT TOP 1 
                CONCAT(YEAR(date), '-', RIGHT('0' + CAST(MONTH(date) AS VARCHAR), 2)) AS month, 
                SUM(amount)
            FROM expenses 
            WHERE username = ? 
            GROUP BY YEAR(date), MONTH(date) 
            ORDER BY month DESC
        """, (username,))
        expense_row = cursor.fetchone()
        total_expense = float(expense_row[1]) if expense_row else 0.0

        # Savings
        cursor.execute("""
            SELECT TOP 1 
                CONCAT(YEAR(date), '-', RIGHT('0' + CAST(MONTH(date) AS VARCHAR), 2)) AS month, 
                SUM(amount)
            FROM saving_goals 
            WHERE category = ? 
            GROUP BY YEAR(date), MONTH(date) 
            ORDER BY month DESC
        """, (username,))
        savings_row = cursor.fetchone()
        total_savings = float(savings_row[1]) if savings_row else 0.0

        # Predict
        features = np.array([[total_income, total_expense, total_savings]])
        prediction = round(model.predict(features)[0], 2)

        if prediction > 0:
            msg = f"Next month: You will likely gain £{prediction}"
        elif prediction < 0:
            msg = f"Next month: You may lose £{abs(prediction)}"
        else:
            msg = "Next month: Your net earnings will be neutral"

        return jsonify({
            "message": msg,
            "prediction": prediction,
            "details": {
                "income": total_income,
                "expense": total_expense,
                "savings": total_savings
            }
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    