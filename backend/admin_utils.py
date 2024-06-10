from functools import wraps
from flask import request, jsonify
import jwt
from database import db

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        admin_token = None
        if 'Authorization' in request.headers:
            admin_token = request.headers['Authorization'].split(' ')[1]
        if not admin_token:
            return jsonify({'error': 'Token is missing'}), 401
        try:
            data = jwt.decode(admin_token, 'secret_key', algorithms=['HS256'])
            current_user = db.admin.find_one({'email': data['email']})
            if not current_user:
                return jsonify({'error': 'Invalid token'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        return f(current_user, *args, **kwargs)
    return decorated