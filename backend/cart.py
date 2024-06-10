import json
from flask import Blueprint, request, jsonify
from database import db
from auth_utils import token_required
from bson import ObjectId
from jsonencoder import JSONEncoder

cart_bp = Blueprint('cart', __name__)

@cart_bp.route('/insert', methods=['POST'])
@token_required
def add_to_cart(current_user):
    data = request.json
    product_id = data['product_id']
    cart = db.cart.find_one({'user_id': current_user['_id']})
    if cart:
        # If cart exists, check if the product is already in the cart
        product_in_cart = next((p for p in cart['products'] if p['product_id'] == ObjectId(product_id)), None)
        if product_in_cart:
            # If the product is already in the cart, increment the quantity
            db.cart.update_one(
                {'_id': cart['_id'], 'products.product_id': ObjectId(product_id)},
                {'$inc': {'products.$.quantity': 1}}
            )
        else:
            # If the product is not in the cart, add it with quantity 1
            db.cart.update_one(
                {'_id': cart['_id']},
                {'$push': {'products': {'product_id': ObjectId(product_id), 'quantity': 1}}}
            )
    else:
        # If cart doesn't exist, create a new cart with the product and quantity 1
        new_cart = {
            'user_id': current_user['_id'],
            'products': [{'product_id': ObjectId(product_id), 'quantity': 1}]
        }
        db.cart.insert_one(new_cart)
    return jsonify({'message': 'Product added to cart successfully'})

@cart_bp.route('/delete', methods=['DELETE'])
@token_required
def remove_from_cart(current_user):
    cart = db.cart.find_one({'user_id': current_user['_id']})
    if cart:
        # Remove all products from the cart
        db.cart.update_one(
            {'_id': cart['_id']},
            {'$set': {'products': []}}
        )
        return jsonify({'message': 'All products removed from cart successfully'})
    else:
        return jsonify({'error': 'Cart not found'}), 404

@cart_bp.route('/all', methods=['GET'])
@token_required
def get_cart_products(current_user):
    cart = db.cart.find_one({'user_id': current_user['_id']})
    if cart:
        product_ids = [product['product_id'] for product in cart['products']]
        products = list(db.products.find({'_id': {'$in': product_ids}}))
        cart_products = []
        for product in products:
            quantity = next(p['quantity'] for p in cart['products'] if p['product_id'] == product['_id'])
            cart_products.append({**product, 'quantity': quantity})
        return json.dumps(cart_products, cls=JSONEncoder)
    else:
        return jsonify({'error': 'Cart not found'}), 404

@cart_bp.route('/update', methods=['PUT'])
@token_required
def update_quantity(current_user):
    data = request.json
    product_id = data['product_id']
    quantity = data['quantity']
    cart = db.cart.find_one({'user_id': current_user['_id']})
    if cart:
        db.cart.update_one(
            {'_id': cart['_id'], 'products.product_id': ObjectId(product_id)},
            {'$set': {'products.$.quantity': quantity}}
        )
        return jsonify({'message': 'Quantity updated successfully'})
    else:
        return jsonify({'error': 'Cart not found'}), 404