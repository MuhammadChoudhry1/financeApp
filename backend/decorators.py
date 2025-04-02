from flask import request, jsonify, make_response, current_app as app
from functools import wraps
import jwt
from globals import cursor

def jwt_required(f):
    @wraps(f)
    def jwt_required_wrapper(*args, **kwargs):
        token = request.headers.get('x-access-token')
        if not token:
            return make_response(jsonify({'error': 'Token is missing'}), 403)

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return make_response(jsonify({'error': 'Token has expired'}), 403)
        except jwt.InvalidTokenError:
            return make_response(jsonify({'error': 'Token is invalid'}), 403)

        cursor.execute("SELECT COUNT(*) FROM blacklist WHERE token = ?", (token,))
        if cursor.fetchone()[0] > 0:
            return make_response(jsonify({'error': 'Token is blacklisted'}), 403)

        return f(*args, **kwargs, username=data['user'])
    
    return jwt_required_wrapper

def login_required(f):
    @wraps(f)
    def login_required_wrapper(*args, **kwargs):
        token = request.headers.get('x-access-token')

        if not token:
            return make_response(jsonify({'error': 'Login required'}), 401)

        try:
            data = jwt.decode(token, str(app.config['SECRET_KEY']), algorithms=["HS256"])
            print("Decoded token:", data)  # For debugging
        except Exception as e:
            print("JWT Decode Error:", str(e))
            return make_response(jsonify({'error': 'Invalid or expired token'}), 401)

        cursor.execute("SELECT COUNT(*) FROM blacklist WHERE token = ?", (token,))
        if cursor.fetchone()[0] > 0:
            return make_response(jsonify({'error': 'Token is blacklisted'}), 401)

        return f(*args, **kwargs)
    
    return login_required_wrapper

def log_request(f):
    @wraps(f)
    def log_request_wrapper(*args, **kwargs):
        print("Request Headers:", request.headers)
        print("Request Form Data:", request.form)
        return f(*args, **kwargs)
    
    return log_request_wrapper

if __name__ == "__main__":
    app.run(debug=True)
