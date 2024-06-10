import json
from flask import Blueprint, request, jsonify
from database import db
from auth_utils import token_required

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/get', methods=['GET'])
@token_required
def get_profile(current_user):
    customer = db.customer.find_one({'_id': current_user['_id']})
    if customer:
        customer['_id'] = str(customer['_id'])
        return jsonify(customer), 200
    else:
        return jsonify({'error': 'Customer not found'}), 404

@profile_bp.route('/update', methods=['PUT'])
@token_required
def update_profile(current_user):
    data = request.get_json()
    firstname = data.get('firstname')
    lastname = data.get('lastname')
    email = data.get('email')
    phone_number = data.get('phone_number')
    addresses = data.get('addresses')

    update_data = {}
    if firstname:
        update_data['firstname'] = firstname
    if lastname:
        update_data['lastname'] = lastname
    if email:
        update_data['email'] = email
    if phone_number:
        update_data['phone_number'] = phone_number
    if addresses:
        update_data['addresses'] = addresses

    db.customer.update_one({'_id': current_user['_id']}, {'$set': update_data})
    return jsonify({'message': 'Profile updated successfully'}), 200

@profile_bp.route('/delete-address', methods=['DELETE'])
@token_required
def delete_address(current_user):
    data = request.get_json()
    address_index = data.get('address_index')

    if address_index is None:
        return jsonify({'error': 'Address index is required'}), 400

    db.customer.update_one(
        {'_id': current_user['_id']},
        {'$unset': {f'addresses.{address_index}': 1}}
    )
    db.customer.update_one(
        {'_id': current_user['_id']},
        {'$pull': {'addresses': None}}
    )

    return jsonify({'message': 'Address deleted successfully'}), 200