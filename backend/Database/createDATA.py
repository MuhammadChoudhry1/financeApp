import pandas as pd
import uuid
from datetime import datetime, timedelta

# Function to generate structured expenses data
def generate_expenses(num_records=500):
    categories = ['Entertainment', 'Groceries', 'Transport', 'Dining']
    descriptions = ['Movie', 'Shopping', 'Bus Fare', 'Dinner']

    data = []
    base_date = datetime(2025, 2, 1, 16, 37, 46)
    
    for i in range(num_records):
        data.append({
            "id": str(uuid.uuid4()),  # Full UUID (36 characters)
            "description": descriptions[i % len(descriptions)],
            "amount": round(20 + (i % 10) * 5.5, 2),  # Structured amount pattern
            "category": categories[i % len(categories)],
            "date": (base_date + timedelta(days=i)).strftime('%Y-%m-%d %H:%M:%S')  # Correct date format
        })
    
    return pd.DataFrame(data)

# Function to generate structured salaries data
def generate_salaries(num_records=500):
    base_date = datetime(2025, 2, 10, 0, 43, 8)

    data = []
    for i in range(num_records):
        salary = 2000 + (i % 5) * 250  # Structured salary increments
        data.append({
            "id": str(uuid.uuid4()),  # Full UUID (36 characters)
            "name": f"Employee_{i+1}",
            "amount": salary,
            "date": (base_date + timedelta(days=i)).strftime('%Y-%m-%d %H:%M:%S')  # Correct date format
        })
    
    return pd.DataFrame(data)

# Function to generate structured saving goals data
def generate_saving_goals(num_records=500):
    categories = ['Electronics', 'Vacation', 'Education', 'Emergency Fund']
    statuses = ['save', 'ongoing', 'completed']

    data = []
    base_date = datetime(2025, 2, 1, 16, 37, 46)

    for i in range(num_records):
        data.append({
            "id": str(uuid.uuid4()),  # Full UUID (36 characters)
            "description": f"Goal {i+1}",
            "amount": round(500 + (i % 7) * 150.75, 2),
            "category": categories[i % len(categories)],
            "status": statuses[i % len(statuses)],
            "date": (base_date + timedelta(days=i)).strftime('%Y-%m-%d %H:%M:%S')  # Correct date format
        })
    
    return pd.DataFrame(data)

# Generate DataFrames
expenses_df = generate_expenses()
salaries_df = generate_salaries()
saving_goals_df = generate_saving_goals()

# Save to CSV files
expenses_df.to_csv("expenses.csv", index=False)
salaries_df.to_csv("salaries.csv", index=False)
saving_goals_df.to_csv("saving_goals.csv", index=False)

print("Fake data generated and saved as CSV files!")