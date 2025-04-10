import uuid
from flask import Blueprint, request, jsonify, make_response, url_for
import globals
from decorators import jwt_required, log_request
from datetime import datetime, timedelta
import bcrypt
from jwt import encode, decode  
from globals import cursor, conn  
from flask import current_app as app  
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import secrets
from dateutil.parser import parse  

auth_bp = Blueprint('auth_bp', __name__)

def generate_token_response(username):
    token = encode({
        'user': username,
        'exp': datetime.utcnow() + timedelta(hours=100)  
    }, str(app.config['SECRET_KEY']), algorithm='HS256')  
    return make_response(jsonify({'token': token}), 200)

@auth_bp.route('/api/v1.0/login', methods=['POST'])
def login():
    auth = request.authorization
    if auth:
        print(f"Attempting to log in user: {auth.username}")  
        cursor.execute("SELECT username, password FROM logins WHERE username = ?", (auth.username,))
        user = cursor.fetchone()
        print(f"Query result: {user}") 
        if user:
            print(f"User found: {user[0]}")  
            if bcrypt.checkpw(auth.password.encode('utf-8'), user[1].encode('utf-8')):  
                return generate_token_response(auth.username)  
            else:
                return make_response(jsonify({'error': 'Invalid password'}), 401)
        else:
            print("User not found")  
            return make_response(jsonify({'error': 'User not found'}), 404)
    return make_response(jsonify({'error': 'Unauthorized access'}), 403)

@auth_bp.route('/api/v1.0/logout', methods=['POST'])
@jwt_required
def logout(username): 
    token = request.headers['x-access-token']
    cursor.execute("INSERT INTO blacklist (token) VALUES (?)", (token,))
    conn.commit()
    return make_response(jsonify({'message': f'Successfully logged out user {username}'}), 200)

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

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')  

        user_id = str(uuid.uuid4())[:20]  

        cursor.execute(
            "INSERT INTO logins (id, name, username, password, email) VALUES (?, ?, ?, ?, ?)",
            (user_id, name, username, hashed_password, email)
        )
        conn.commit()

        return make_response(jsonify({'message': 'User registered successfully'}), 201)

    except Exception as e:
        print(f"Error during registration: {e}")
        return make_response(jsonify({'error': 'Internal server error'}), 500)

@auth_bp.route('/api/v1.0/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        email = data.get('email')

        if not email:
            return make_response(jsonify({'error': 'Email is required'}), 400)

        cursor.execute("SELECT id FROM logins WHERE email = ?", (email,))
        user = cursor.fetchone()

        if not user:
            return make_response(jsonify({'error': 'Email not found'}), 404)

        token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(hours=1)

        cursor.execute(
            "INSERT INTO password_resets (email, token, expires_at, created_at) VALUES (?, ?, ?, ?)",
            (email, token, expires_at, datetime.utcnow())
        )
        conn.commit()

      
        reset_link = f"exp://192.168.1.214:8081/--/reset-password?token={token}"

        sender_email = "choudhrymuhammad73@gmail.com"
        sender_password = "nzbc coyt kurj cblh"
        subject = "Password Reset Request"

        message = MIMEMultipart()
        message['From'] = sender_email
        message['To'] = email
        message['Subject'] = subject
        body = f"Click the link to reset your password: {reset_link}"
        message.attach(MIMEText(body, 'plain'))

        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, email, message.as_string())

        return make_response(jsonify({
            'message': 'Password reset link sent to your email',
            'token': token  
        }), 200)

    except Exception as e:
        print(f"Error in forgot password: {e}")
        return make_response(jsonify({'error': 'Internal server error'}), 500)

@auth_bp.route('/api/v1.0/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        token = data.get('token')
        new_password = data.get('password')

        if not token or not new_password:
            return make_response(jsonify({'error': 'Token and new password are required'}), 400)

        cursor.execute("SELECT email, expires_at FROM password_resets WHERE token = ?", (token,))
        reset_entry = cursor.fetchone()

        if not reset_entry:
            return make_response(jsonify({'error': 'Invalid or expired token'}), 400)

        email, expires_at = reset_entry

        if isinstance(expires_at, str):  
            expires_at = parse(expires_at)

        if datetime.utcnow() > expires_at:  
            return make_response(jsonify({'error': 'Token has expired'}), 400)

        hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        cursor.execute("UPDATE logins SET password = ? WHERE email = ?", (hashed_password, email))
        conn.commit()

        print(f"Password updated successfully for email: {email}")

        cursor.execute("DELETE FROM password_resets WHERE token = ?", (token,))
        conn.commit()

        return make_response(jsonify({'message': 'Password reset successfully'}), 200)

    except Exception as e:
        print(f"Error in reset password: {e}")
        return make_response(jsonify({'error': 'Internal server error'}), 500)

@auth_bp.route('/api/v1.0/google-login', methods=['POST'])
def google_login():
    try:
        data = request.get_json()
        email = data.get('email')
        name = data.get('name')

        if not email:
            return make_response(jsonify({'error': 'Email required'}), 400)

        cursor.execute("SELECT username FROM logins WHERE email = ?", (email,))
        user = cursor.fetchone()

        if user:
            username = user[0]
        else:
            username = email.split('@')[0]
            user_id = str(uuid.uuid4())[:20]
            cursor.execute(
                "INSERT INTO logins (id, name, username, password, email) VALUES (?, ?, ?, ?, ?)",
                (user_id, name, username, '', email)  
            )
            conn.commit()

        return generate_token_response(username)

    except Exception as e:
        print(f"Google login error: {e}")
        return make_response(jsonify({'error': 'Internal server error'}), 500)
