import pyodbc

# Database connection details
SERVER = 'localhost'  # Change if using a remote server
DATABASE = 'FinanceDB'
USERNAME = 'SA'  # Ensure this user has access
PASSWORD = 'YourStrongPassword!'  # Make sure the password is correct

# Connection string
conn_str = f'DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={SERVER};DATABASE={DATABASE};UID={USERNAME};PWD={PASSWORD}'

# Establish connection
conn = pyodbc.connect(conn_str, autocommit=True)  # Add autocommit to prevent transaction issues
cursor = conn.cursor()
