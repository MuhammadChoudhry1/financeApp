import uuid
import bcrypt
import base64
import pandas as pd
from bson import ObjectId

def hash_password(password):
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return base64.b64encode(hashed).decode('utf-8')

def generate_logins(num_records=3):
    names = ['John Doe', 'Jane Smith', 'Alice Johnson']
    usernames = ['johndoe', 'janesmith', 'alicej']
    emails = ['john@example.com', 'jane@example.com', 'alice@example.com']
    passwords = ['password123', 'securepass456', 'mypassword789']  # Example passwords

    data = []
    for i in range(num_records):
        data.append({
            "id": ObjectId(),
            "name": names[i],
            "username": usernames[i],
            "password": hash_password(passwords[i]),
            "email": emails[i]
        })
    
    return pd.DataFrame(data)

df_logins = generate_logins()

df_logins.to_csv("logins.csv", index=False)

print("Login details generated and saved as CSV!")