import pyodbc

# Database connection details
SERVER = '192.168.1.214'  # Your Mac's IP address (or 'localhost' if running locally)
DATABASE = 'FinanceDB'     # Replace with your database name
USERNAME = 'SA'            # Default SQL Server system administrator account
PASSWORD = 'MyStrongPassword123'  # Replace with the SA password you set in Docker

# Connection string
conn_str = f'DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={SERVER};DATABASE={DATABASE};UID={USERNAME};PWD={PASSWORD}'

# Establish connection
conn = pyodbc.connect(conn_str, autocommit=True)  # Add autocommit to prevent transaction issues
cursor = conn.cursor()