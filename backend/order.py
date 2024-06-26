from datetime import datetime
import json
from bson import ObjectId
from flask import Blueprint, request, jsonify
from flask_mail import Message
from database import db
from auth_utils import token_required
from werkzeug.security import generate_password_hash
from jsonencoder import JSONEncoder
from datetime import datetime, timedelta

order_bp = Blueprint('orders', __name__)

@order_bp.route('/payments', methods=['GET'])
@token_required
def get_saved_payment_methods(user):
    email = user['email']
    saved_payments = db.payments.find({'email': email})
    payment_methods = []
    for payment in saved_payments:
        payment_method = {
            '_id': str(payment['_id']),
            'cardholderName': payment.get('cardholderName', ''),
            'cardNumber': payment['cardNumber'],
            'expiryDate': payment['expiryDate'],
            'paymentMethodName': payment.get('paymentMethodName', '')
        }
        payment_methods.append(payment_method)
    return jsonify(payment_methods), 200

@order_bp.route('/place', methods=['POST'])
@token_required
def place_order(user):
    order_data = request.json
    items = order_data.get('items')
    total_cost = order_data.get('cost')
    tax = order_data.get('tax')
    deliveryCharge = order_data.get('deliveryCharge')
    card_details = order_data.get('cardDetails')
    email = user['email']
    phone_number = order_data.get('phoneNumber')
    address = order_data.get('address')
    
    if not items or not total_cost or not email or not address:
        return jsonify({'error': 'Required fields are missing'}), 400

    # Set additional fields for each item
    for item in items:
        product = db.products.find_one({'_id': ObjectId(item['_id'])})
        variant = db.variants.find_one({'_id': ObjectId(item['selectedVariantId'])})
        
        if not variant:
            return jsonify({'error': 'Invalid variant selected'}), 400
        
        item['deliveryStatus'] = 'Pending'
        estimated_delivery_date = datetime.now() + timedelta(days=5)
        item['EstimatedDeliveryDate'] = estimated_delivery_date.strftime('%m-%d-%Y')
        item['RefundMessage'] = None
        item['DeliveryDate'] = None
        item['Cost'] = item['quantity'] * product['price'] + float(item['maintenanceCost'])
        item['maintenancePlan'] = item['maintenancePlan']
        item['maintenanceCost'] = item['maintenanceCost']
        item['selectedColor'] = variant['color']
        item['selectedImage'] = variant['image']
        
        # Update the stock quantity of the variant
        new_stock_quantity = variant['stock'] - item['quantity']
        db.variants.update_one(
            {'_id': ObjectId(item['selectedVariantId'])},
            {'$set': {'stock': new_stock_quantity}}
        )

    payment_id = None
    if card_details:
        # Check if the card number already exists in the payments collection
        cn = card_details.get('cardNumber')
        existing_payment = db.payments.find_one({'cardNumber': cn, 'email': email})
        if existing_payment:
            payment_id = str(existing_payment['_id'])
        else:
            # Save card details in the payments collection
            payment = {
                'cardholderName': card_details.get('cardholderName', ''),
                'cardNumber': card_details.get('cardNumber'),
                'expiryDate': card_details.get('expiryDate'),
                'email': email,
                'paymentMethodName': card_details.get('paymentMethodName', '')
            }
            payment_result = db.payments.insert_one(payment)
            payment_id = str(payment_result.inserted_id)

    # Get the current timestamp
    order_time = datetime.now().strftime('%m-%d-%Y %H:%M:%S')

    # Create the order object
    order = {
        'userId': user['_id'],
        'items': items,
        'Totalcost': total_cost,
        'tax': tax,
        'deliveryCharge': deliveryCharge,
        'paymentId': payment_id,
        'email': email,
        'phoneNumber': phone_number,
        'address': address,
        'orderTime': order_time
    }

    # Save the order in the orders collection
    order_result = db.orders.insert_one(order)
    order_id = str(order_result.inserted_id)

    return jsonify({'orderId': order_id}), 201

@order_bp.route('/customer', methods=['GET'])
@token_required
def get_customer_orders(user):
    user_id = user['_id']
    orders = db.orders.find({'userId': user_id}).sort('orderTime', -1)
    
    customer_orders = []
    for order in orders:
        order_items = []
        for item in order['items']:
            product = db.products.find_one({'_id': ObjectId(item['_id'])})
            if product is None:
                continue  # Skip this item if product is not found

            order_item = {
                'product_id': str(item['_id']),
                'name': product['name'],
                'quantity': item['quantity'],
                'selectedImage': item['selectedImage'],
                'deliveryStatus': item.get('deliveryStatus'),
                'maintenancePlan': item.get('maintenancePlan'),
                'selectedColor': item['selectedColor'],
                'brand': product['brand']
            }
            order_items.append(order_item)
                    
        customer_order = {
            '_id': str(order['_id']),
            'items': order_items,
            'orderTime': order['orderTime'],
        }
        customer_orders.append(customer_order)
    
    return json.dumps(customer_orders, cls=JSONEncoder), 200


@order_bp.route('/<order_id>', methods=['GET'])
@token_required
def get_order(user, order_id):
    user_id = user['_id']
    order = db.orders.find_one({'_id': ObjectId(order_id), 'userId': user_id})
    
    if not order:
        return jsonify({'error': 'Order not found'}), 404

    order_items = []
    for item in order['items']:
        product = db.products.find_one({'_id': ObjectId(item['_id'])})
        order_item = {
            'product_id': str(item['_id']),
            'name': product['name'],
            'selectedImage': item['selectedImage'],
            'quantity': item['quantity'],
            'deliveryStatus': item.get('deliveryStatus'),
            'EstimatedDeliveryDate': item.get('EstimatedDeliveryDate'),
            'RefundMessage': item.get('RefundMessage'),
            'DeliveryDate': item.get('DeliveryDate'),
            'Cost': item['Cost'],
            'maintenancePlan': item.get('maintenancePlan'),
            'selectedColor': item['selectedColor'],
            'brand': product['brand']
        }
        order_items.append(order_item)

    order_details = {
        '_id': str(order['_id']),
        'items': order_items,
        'Totalcost': order['Totalcost'],
        'tax': order.get('tax'),
        'deliveryCharge': order.get('deliveryCharge'),
        'paymentId': order.get('paymentId'),
        'phoneNumber': order.get('phoneNumber'),
        'address': order['address'],
        'orderTime': order['orderTime']
    }

    return json.dumps(order_details, cls=JSONEncoder), 200

@order_bp.route('/<order_id>/<item_id>/<item_color>/<item_maintenancePlan>/cancel', methods=['PUT'])
@token_required
def cancel_item(user, order_id, item_id, item_color, item_maintenancePlan):
    try:
        user_id = user['_id']
        order = db.orders.find_one({'_id': ObjectId(order_id), 'userId': user_id})

        if not order:
            return jsonify({'error': 'Order not found'}), 404

        item_to_cancel = None
        for item in order['items']:
            if str(item['_id']) == item_id and item['selectedColor'] == item_color and item['maintenancePlan'] == item_maintenancePlan:
                item_to_cancel = item
                break

        if not item_to_cancel:
            return jsonify({'error': 'Item not found in the order'}), 404

        if item_to_cancel['deliveryStatus'] == 'Delivered':
            return jsonify({'error': 'Item cannot be cancelled as it is already delivered'}), 400

        item_to_cancel['deliveryStatus'] = 'Cancelled'
        item_to_cancel['EstimatedDeliveryDate'] = None
        item_to_cancel['DeliveryDate'] = None
        item_to_cancel['RefundMessage'] = f"Refund of {item_to_cancel['Cost']} processed for the cancelled item"

        db.orders.update_one(
            {'_id': ObjectId(order_id)},
            {'$set': {'items': order['items']}}
        )

        return jsonify({'message': 'Item cancelled successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500