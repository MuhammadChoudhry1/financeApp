from flask import Flask, render_template, request, redirect, url_for, jsonify, make_response
import json
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timedelta  # Add timedelta import
import jwt
from functools import wraps
import bcrypt  # Ensure bcrypt is imported
import globals

app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecret'

blacklist_collection = globals.db.blacklist

def jwt_required(f):
    @wraps(f)
    def jwt_required_wrapper(*args, **kwargs):
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        if not token:
            return make_response(jsonify({'error': 'Token is missing'}), 403)
        try:
            data = jwt.decode(token, globals.secret_key, algorithms=["HS256"])
        except:
            return make_response(jsonify({'error': 'Token is invalid'}), 403)
        bl_token = blacklist_collection.find_one({'token': token})
        if bl_token is not None:
            return make_response(jsonify({'error': 'Token is blacklisted'}), 403)
        return f(*args, **kwargs)
    return jwt_required_wrapper

if __name__ == "__main__":
    app.run(debug=True)