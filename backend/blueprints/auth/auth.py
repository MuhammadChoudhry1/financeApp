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

