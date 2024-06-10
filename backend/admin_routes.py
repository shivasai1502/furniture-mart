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

@admin_routes.route('/utility', methods=['GET'])
@token_required
def get_utility_data(current_user):
    try:
        utility_data = db.admin_order_utility_details.find_one()
        return json_util.dumps(utility_data), 200
    except Exception as e:
        print(f"Error fetching utility data: {str(e)}")
        return jsonify({'error': 'An error occurred while fetching utility data'}), 500

@admin_routes.route('/utility', methods=['PUT'])
@token_required
def update_utility_data(current_user):
    try:
        data = request.get_json()
        taxrate = data.get('taxrate')
        deliverycharge = data.get('deliverycharge')
        db.admin_order_utility_details.update_one(
            {},
            {'$set': {'taxrate': taxrate, 'deliverycharge': deliverycharge}}
        )
        return jsonify({'message': 'Utility data updated successfully'}), 200
    except Exception as e:
        print(f"Error updating utility data: {str(e)}")
        return jsonify({'error': 'An error occurred while updating utility data'}), 500

@admin_routes.route('/coupons', methods=['POST'])
@token_required
def add_coupon(current_user):
    try:
        data = request.get_json()
        code = data.get('code')
        discount = data.get('discount')
        db.admin_order_utility_details.update_one(
            {},
            {'$push': {'coupons': {'code': code, 'discount': discount}}}
        )
        return jsonify({'message': 'Coupon added successfully'}), 201
    except Exception as e:
        print(f"Error adding coupon: {str(e)}")
        return jsonify({'error': 'An error occurred while adding coupon'}), 500

@admin_routes.route('/coupons/<code>', methods=['DELETE'])
@token_required
def delete_coupon(current_user, code):
    try:
        db.admin_order_utility_details.update_one(
            {},
            {'$pull': {'coupons': {'code': code}}}
        )
        return jsonify({'message': 'Coupon deleted successfully'}), 200
    except Exception as e:
        print(f"Error deleting coupon: {str(e)}")
        return jsonify({'error': 'An error occurred while deleting coupon'}), 500

@admin_routes.route('/toys', methods=['GET'])
@token_required
def get_toy_data(current_user):
    try:
        total_toys = db.products.aggregate([
            {
                '$group': {
                    '_id': None,
                    'total': {'$sum': '$stock'}
                }
            }
        ]).next()['total']
        
        out_of_stock_toys = db.products.count_documents({'stock': 0})
        
        categories = list(db.categories.aggregate([
            {
                '$lookup': {
                    'from': 'products',
                    'localField': 'link',
                    'foreignField': 'category',
                    'as': 'products'
                }
            },
            {
                '$project': {
                    'CategoryName': 1,
                    'totalToys': {'$sum': '$products.stock'}
                }
            }
        ]))
        
        return json.dumps({
            'totalToys': total_toys,
            'outOfStockToys': out_of_stock_toys,
            'categories': categories
        }, cls=JSONEncoder), 200
    except Exception as e:
        print(f"Error fetching toy data: {str(e)}")
        return jsonify({'error': 'An error occurred while fetching toy data'}), 500
