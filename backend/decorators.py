from flask import Flask, request, jsonify, make_response
import json
from datetime import datetime, timedelta
import jwt
from functools import wraps
import bcrypt
from globals import cursor, conn  # Use SQL connection

app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecret'

def jwt_required(f):
    @wraps(f)
    def jwt_required_wrapper(*args, **kwargs):
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        
        if not token:
            return make_response(jsonify({'error': 'Token is missing'}), 403)

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        except:
            return make_response(jsonify({'error': 'Token is invalid'}), 403)

        # Check if token is blacklisted in SQL Server
        cursor.execute("SELECT COUNT(*) FROM blacklist WHERE token = ?", (token,))
        bl_token = cursor.fetchone()[0]

        if bl_token > 0:
            return make_response(jsonify({'error': 'Token is blacklisted'}), 403)

        return f(*args, **kwargs)
    
    return jwt_required_wrapper

if __name__ == "__main__":
    app.run(debug=True)
