from flask import Blueprint, request, jsonify, make_response, url_for
import globals
from decorators import jwt_required
from datetime import datetime, timedelta
from bson import ObjectId
import bcrypt
import jwt

auth_bp = Blueprint('auth_bp', __name__)

users_collection = globals.db.users
blacklist_collection = globals.db.blacklist

@auth_bp.route('/api/v1.0/login', methods=['POST'])  # Change methods to ['POST']
def login():
    auth = request.authorization
    if auth:
        user = users_collection.find_one({'username': auth.username})  # Correct the collection name
        if user is not None:
            if bcrypt.checkpw(bytes(auth.password, 'UTF-8'), user['password']):  # Correct bcrypt usage
                token = jwt.encode({
                    'user': auth.username,
                    'exp': datetime.utcnow() + timedelta(minutes=30)
                }, globals.secret_key, algorithm='HS256')  # Correct the 'algorithm' parameter
                return make_response(jsonify({'token': token}), 200)
            else:
                return make_response(jsonify({'error': 'Invalid password'}), 401)
        else:
            return make_response(jsonify({'error': 'User not found'}), 404)
    return make_response(jsonify({'error': 'Unauthorized access'}), 403)

@auth_bp.route('/api/v1.0/logout', methods=['POST'])
@jwt_required
def logout():
    token = request.headers['x-access-token']
    blacklist_collection.insert_one({'token': token})
    return make_response(jsonify({'message': 'Successfully logged out'}), 200)

@auth_bp.route('/api/v1.0/register', methods=['POST'])
def register():
    try:
        # Log the incoming request headers and data for debugging
        print("Request Headers:", request.headers)
        print("Request Form Data:", request.form)

        # Get data from form-urlencoded request
        name = request.form.get('name')
        email = request.form.get('email')
        username = request.form.get('username')
        password = request.form.get('password')

        # Validate required fields
        if not name or not email or not username or not password:
            return make_response(jsonify({'error': 'Name, email, username, and password are required'}), 400)

        # Check if email or username already exists
        if users_collection.find_one({'email': email}):
            return make_response(jsonify({'error': 'Email already registered'}), 409)
        if users_collection.find_one({'username': username}):
            return make_response(jsonify({'error': 'Username already taken'}), 409)

        # Hash the password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        # Create new user
        new_user = {
            'email': email,
            'username': username,
            'password': hashed_password,
            'name': name,
            'created_at': datetime.utcnow()
        }

        # Insert user into the database
        users_collection.insert_one(new_user)

        return make_response(jsonify({'message': 'User registered successfully'}), 201)

    except Exception as e:
        # Log the error for debugging
        print(f"Error during registration: {e}")
        return make_response(jsonify({'error': 'Internal server error'}), 500)