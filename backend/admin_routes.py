import json
from flask import Blueprint, request, jsonify
import jwt
import datetime
from database import db
from bson import json_util
from jsonencoder import JSONEncoder
from admin_utils import token_required

admin_routes = Blueprint('admin', __name__)

@admin_routes.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        admin = db.admin.find_one({'email': email})
        if not admin:
            return jsonify({'error': 'Invalid username or password'}), 401
        if admin['password'] != password:
            return jsonify({'error': 'Invalid username or password'}), 401
        current_time = datetime.datetime.now(datetime.timezone.utc)
        expiration_time = current_time + datetime.timedelta(minutes=60)
        admin_token = jwt.encode({
            'email': email,
            'iat': current_time,
            'exp': expiration_time
        }, 'secret_key', algorithm='HS256')
        return jsonify({'admin_token': admin_token}), 200
    except Exception as e:
        print(f"Error during login: {str(e)}")
        return jsonify({'error': 'An error occurred during login'}), 500
