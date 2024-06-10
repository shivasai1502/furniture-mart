import json
from flask import Blueprint, request, jsonify
import jwt
import datetime
from database import db
from bson import ObjectId, json_util
from jsonencoder import JSONEncoder
from admin_utils import token_required

admin_handle_orders_bp = Blueprint('handleorders', __name__)

@admin_handle_orders_bp.route('/all', methods=['GET'])
@token_required
def get_orders(user):
    handle_orders = db.orders.find()
    orders = []
    for order in handle_orders:
        customer_details = db.customer.find_one({'_id': ObjectId(order['userId'])})
        order_details = {
            '_id': str(order['_id']),
            'customerName': customer_details['firstname'] + ' ' + customer_details['lastname'],
            'Totalcost': order['Totalcost'],
            'orderTime': order['orderTime'],
            'items': order['items']
        }
        orders.append(order_details)
    return jsonify(orders), 200

@admin_handle_orders_bp.route('/<order_id>', methods=['GET'])
@token_required
def get_order_details(user, order_id):
    order = db.orders.find_one({'_id': ObjectId(order_id)})
    customer_details = db.customer.find_one({'_id': ObjectId(order['userId'])})
    if not order or not customer_details:
        return jsonify({'error': 'Order not found'}), 404
    order_items = []
    for item in order['items']:
        product = db.products.find_one({'_id': ObjectId(item['_id'])})
        order_item = {
            'product_id': str(item['_id']),
            'name': product['name'],
            'image_id': product['image_id'],
            'quantity': item['quantity'],
            'deliveryStatus': item.get('deliveryStatus'),
            'EstimatedDeliveryDate': item.get('EstimatedDeliveryDate'),
            'DeliveryDate': item.get('DeliveryDate'),
            'Cost': item['Cost']
        }
        order_items.append(order_item)
    order_details = {
        '_id': str(order['_id']),
        'items': order_items,
        'Totalcost': order['Totalcost'],
        'tax': order.get('tax'),
        'discount': order.get('discount'),
        'paymentId': order.get('paymentId'),
        'phoneNumber': order.get('phoneNumber'),
        'address': order['address'],
        'orderTime': order['orderTime']
    }
    return json.dumps(order_details, cls=JSONEncoder), 200

@admin_handle_orders_bp.route('/update/<order_id>', methods=['PUT'])
@token_required
def update_order_details(user, order_id):
    data = request.get_json()
    item_id = data.get('itemId')
    field = data.get('field')
    value = data.get('value')
    order = db.orders.find_one({'_id': ObjectId(order_id)})
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    for item in order['items']:
        if str(item['_id']) == item_id:
            item[field] = value
            break
    db.orders.update_one({'_id': ObjectId(order_id)}, {'$set': {'items': order['items']}})
    return jsonify({'message': 'Order updated successfully'}), 200