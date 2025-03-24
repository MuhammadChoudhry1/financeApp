import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
from ...globals import cursor  # Adjust the import to be relative

def fetch_expenses_data(user_id):
    query = f"SELECT date, amount, category FROM expenses WHERE user_id = {user_id}"
    cursor.execute(query)
    return cursor.fetchall()

def fetch_savings_data(user_id):
    query = f"SELECT date, amount FROM savings WHERE user_id = {user_id}"
    cursor.execute(query)
    return cursor.fetchall()

def plot_spending_over_time(user_id):
    """Create a line plot of spending over time"""
    expenses_data = fetch_expenses_data(user_id)
    df = pd.DataFrame(expenses_data, columns=['date', 'amount', 'category'])
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date')
    
    plt.figure(figsize=(12, 6))
    sns.lineplot(data=df, x='date', y='amount', hue='category')
    plt.title(f'Spending Over Time for User {user_id}')
    plt.ylabel('Amount ($)')
    plt.xticks(rotation=45)
    plt.tight_layout()
    
    filename = f"spending_time_{user_id}.png"
    plt.savefig(filename)
    plt.close()
    return filename

def plot_category_breakdown(user_id):
    """Create a pie chart of spending by category"""
    expenses_data = fetch_expenses_data(user_id)
    df = pd.DataFrame(expenses_data, columns=['date', 'amount', 'category'])
    category_totals = df.groupby('category')['amount'].sum()
    
    plt.figure(figsize=(8, 8))
    plt.pie(category_totals, labels=category_totals.index, autopct='%1.1f%%')
    plt.title(f'Spending by Category for User {user_id}')
    
    filename = f"category_breakdown_{user_id}.png"
    plt.savefig(filename)
    plt.close()
    return filename

def plot_monthly_comparison(user_id):
    """Compare monthly spending"""
    expenses_data = fetch_expenses_data(user_id)
    df = pd.DataFrame(expenses_data, columns=['date', 'amount', 'category'])
    df['date'] = pd.to_datetime(df['date'])
    df['month'] = df['date'].dt.strftime('%Y-%m')
    
    monthly_totals = df.groupby('month')['amount'].sum()
    
    plt.figure(figsize=(12, 6))
    monthly_totals.plot(kind='bar')
    plt.title(f'Monthly Spending Comparison for User {user_id}')
    plt.ylabel('Total Amount ($)')
    plt.xlabel('Month')
    plt.xticks(rotation=45)
    plt.tight_layout()
    
    filename = f"monthly_comparison_{user_id}.png"
    plt.savefig(filename)
    plt.close()
    return filename

def plot_spending_vs_saving(user_id):
    """Compare spending vs saving over time"""
    expenses_data = fetch_expenses_data(user_id)
    savings_data = fetch_savings_data(user_id)
    
    exp_df = pd.DataFrame(expenses_data, columns=['date', 'amount', 'category'])
    sav_df = pd.DataFrame(savings_data, columns=['date', 'amount'])
    
    exp_df['date'] = pd.to_datetime(exp_df['date'])
    sav_df['date'] = pd.to_datetime(sav_df['date'])
    
    monthly_exp = exp_df.groupby(pd.Grouper(key='date', freq='M'))['amount'].sum()
    monthly_sav = sav_df.groupby(pd.Grouper(key='date', freq='M'))['amount'].sum()
    
    plt.figure(figsize=(12, 6))
    plt.plot(monthly_exp.index, monthly_exp.values, label='Spending')
    plt.plot(monthly_sav.index, monthly_sav.values, label='Saving')
    plt.title(f'Spending vs Saving Trends for User {user_id}')
    plt.ylabel('Amount ($)')
    plt.xlabel('Date')
    plt.legend()
    plt.grid(True)
    plt.tight_layout()
    
    filename = f"spend_vs_save_{user_id}.png"
    plt.savefig(filename)
    plt.close()
    return filename

