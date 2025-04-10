import pyodbc

SERVER = '192.168.1.214'  
DATABASE = 'FinanceDB'    
USERNAME = 'SA'           
PASSWORD = 'MyStrongPassword123'  

conn_str = f'DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={SERVER};DATABASE={DATABASE};UID={USERNAME};PWD={PASSWORD}'

conn = pyodbc.connect(conn_str, autocommit=True)  
cursor = conn.cursor()