import uuid
from flask import Blueprint, request, jsonify, make_response, url_for
import globals
from decorators import jwt_required, log_request
from datetime import datetime, timedelta
import bcrypt
from jwt import encode, decode  # Explicitly import from PyJWT
from globals import cursor, conn  # Import SQL connection
from flask import current_app as app  # Import current_app to access app config

auth_bp = Blueprint('auth_bp', __name__)

def generate_token_response(username):
    token = encode({
        'user': username,
        'exp': datetime.utcnow() + timedelta(hours=1)  # Extend token expiration to 1 hour
    }, str(app.config['SECRET_KEY']), algorithm='HS256')  # Ensure SECRET_KEY is a string
    return make_response(jsonify({'token': token}), 200)

@auth_bp.route('/api/v1.0/login', methods=['POST'])
def login():
    auth = request.authorization
    if auth:
        print(f"Attempting to log in user: {auth.username}")  # Debugging: Log username
        cursor.execute("SELECT username, password FROM logins WHERE username = ?", (auth.username,))
        user = cursor.fetchone()
        print(f"Query result: {user}")  # Debugging: Log query result
        if user:
            print(f"User found: {user[0]}")  # Debugging: Log found user
            if bcrypt.checkpw(auth.password.encode('utf-8'), user[1].encode('utf-8')):  # Ensure password comparison is correct
                return generate_token_response(auth.username)  # Use the reusable function
            else:
                return make_response(jsonify({'error': 'Invalid password'}), 401)
        else:
            print("User not found")  # Debugging: Log user not found
            return make_response(jsonify({'error': 'User not found'}), 404)
    return make_response(jsonify({'error': 'Unauthorized access'}), 403)

@auth_bp.route('/api/v1.0/logout', methods=['POST'])
@jwt_required
def logout():
    token = request.headers['x-access-token']
    cursor.execute("INSERT INTO blacklist (token) VALUES (?)", (token,))
    conn.commit()
    return make_response(jsonify({'message': 'Successfully logged out'}), 200)

@auth_bp.route('/api/v1.0/register', methods=['POST'])
@log_request
def register():
    try:
        print("Request Headers:", request.headers)
        print("Request Form Data:", request.form)

        name = request.form.get('name')
        email = request.form.get('email')
        username = request.form.get('username')
        password = request.form.get('password')

        if not name or not email or not username or not password:
            return make_response(jsonify({'error': 'Name, email, username, and password are required'}), 400)

        cursor.execute("SELECT COUNT(*) FROM logins WHERE email = ?", (email,))
        if cursor.fetchone()[0] > 0:
            return make_response(jsonify({'error': 'Email already registered'}), 409)
        
        cursor.execute("SELECT COUNT(*) FROM logins WHERE username = ?", (username,))
        if cursor.fetchone()[0] > 0:
            return make_response(jsonify({'error': 'Username already taken'}), 409)

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')  # Ensure password is hashed

        user_id = str(uuid.uuid4())[:20]  # Truncate UUID to fit the column length

        cursor.execute(
            "INSERT INTO logins (id, name, username, password, email) VALUES (?, ?, ?, ?, ?)",
            (user_id, name, username, hashed_password, email)
        )
        conn.commit()

        return make_response(jsonify({'message': 'User registered successfully'}), 201)

    except Exception as e:
        print(f"Error during registration: {e}")
        return make_response(jsonify({'error': 'Internal server error'}), 500)