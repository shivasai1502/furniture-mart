from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo.errors import DuplicateKeyError
import jwt
import datetime
from database import db
from auth_utils import token_required

auth_routes = Blueprint('auth', __name__)

@auth_routes.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    firstname = data.get('firstname')
    lastname = data.get('lastname')
    email = data.get('email')
    password = data.get('password')
    date_of_birth = data.get('dateOfBirth')
    phone_number = data.get('phoneNumber')
    address = data.get('address')

    if not firstname or not lastname or not email or not password:
        return jsonify({'error': 'Please provide all required fields'}), 400

    hashed_password = generate_password_hash(password)
    customer = {
        'firstname': firstname,
        'lastname': lastname,
        'email': email,
        'password': hashed_password,
        'date_of_birth': date_of_birth,
        'phone_number': phone_number,
        'addresses': [address] if address else []
    }

    try:
        db.customer.insert_one(customer)
        return jsonify({'message': 'Customer registered successfully'}), 201
    except DuplicateKeyError:
        return jsonify({'error': 'Email already exists'}), 400


@auth_routes.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'error': 'Please provide all required fields'}), 400

        customer = db.customer.find_one({'email': email})

        if not customer:
            return jsonify({'error': 'Invalid username or password'}), 401

        if not check_password_hash(customer['password'], password):
            return jsonify({'error': 'Invalid username or password'}), 401

        current_time = datetime.datetime.now(datetime.timezone.utc)
        expiration_time = current_time + datetime.timedelta(minutes=60)

        token = jwt.encode({
            'email': email,
            'iat': current_time,
            'exp': expiration_time
        }, 'secret_key', algorithm='HS256')

        return jsonify({'token': token}), 200
    except Exception as e:
        print(f"Error during login: {str(e)}")
        return jsonify({'error': 'An error occurred during login'}), 500

@auth_routes.route('/logout', methods=['POST'])
def logout():
    return jsonify({'message': 'Customer logged out successfully'}), 200


@auth_routes.route('/user', methods=['GET'])
@token_required
def get_user(current_user):
    user_data = {
        'username': current_user['firstname'] + ' ' + current_user['lastname'],
        'email': current_user['email']
    }
    return jsonify(user_data), 200


@auth_routes.route('/forget-password', methods=['POST'])
def forget_password():
    data = request.get_json()
    email = data.get('email')
    new_password = data.get('newPassword')

    customer = db.customer.find_one({'email': email})

    if customer:
        hashed_password = generate_password_hash(new_password)
        db.customer.update_one({'email': email}, {'$set': {'password': hashed_password}})
        return jsonify({'message': 'Password reset successful'}), 200
    else:
        return jsonify({'message': 'Email not found'}), 404