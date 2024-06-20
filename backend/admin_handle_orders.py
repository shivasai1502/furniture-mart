from flask import Blueprint, request, jsonify
from database import db
from bson import ObjectId
from admin_utils import token_required

admin_handle_orders_bp = Blueprint('handleorders', __name__)

@admin_handle_orders_bp.route('/all', methods=['GET'])
@token_required
def get_orders(user):
    try:
        handle_orders = list(db.orders.find())
        orders = []
        for order in handle_orders:
            order_details = {
                '_id': str(order['_id']),
                'Totalcost': order['Totalcost'],
                'orderTime': order['orderTime'],
                'items': order['items']
            }
            orders.append(order_details)
        return jsonify(orders), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_handle_orders_bp.route('/<order_id>', methods=['GET'])
@token_required
def get_order(user, order_id):
    try:
        order = db.orders.find_one({'_id': ObjectId(order_id)})

        if not order:
            return jsonify({'error': 'Order not found'}), 404

        order_items = []
        for item in order['items']:
            product = db.products.find_one({'_id': ObjectId(item['_id'])}, {'name': 1, 'images.color': 1})
            maintenance_plan = item.get('maintenancePlan')
            selected_color = item.get('selectedColor')
            
            order_item = {
                'product_id': str(item['_id']),
                'name': product['name'],
                'selectedColor': selected_color,
                'quantity': item['quantity'],
                'deliveryStatus': item.get('deliveryStatus', 'Pending'),
                'EstimatedDeliveryDate': item.get('EstimatedDeliveryDate', ''),
                'DeliveryDate': item.get('DeliveryDate', ''),
                'Cost': item['Cost'],
                'maintenancePlan': maintenance_plan
            }
            order_items.append(order_item)

        order_details = {
            '_id': str(order['_id']),
            'items': order_items,
            'Totalcost': order['Totalcost'],
            'tax': order.get('tax', 0),
            'deliveryCharge': order.get('deliveryCharge', 0),
            'phoneNumber': order.get('phoneNumber', ''),
            'address': order.get('address', {}),
            'orderTime': order['orderTime']
        }

        # Filter order items based on delivery status
        delivery_status = request.args.get('deliveryStatus')
        if delivery_status:
            order_details['items'] = [item for item in order_details['items'] if item['deliveryStatus'] == delivery_status]

        return jsonify(order_details), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_handle_orders_bp.route('/update/<order_id>', methods=['PUT'])
@token_required
def update_order_details(user, order_id):
    try:
        data = request.get_json()
        updated_items = data.get('items')

        order = db.orders.find_one({'_id': ObjectId(order_id)})
        if not order:
            return jsonify({'error': 'Order not found'}), 404

        updated_item_ids = set()

        for updated_item in updated_items:
            item_id = updated_item['product_id']
            item_color = updated_item['selectedColor']
            item_maintenancePlan = updated_item['maintenancePlan']
            item_key = f"{item_id}-{item_color}"

            if item_key in updated_item_ids:
                continue

            for item in order['items']:
                if str(item['_id']) == item_id and item['selectedColor'] == item_color and item['maintenancePlan'] == item_maintenancePlan:
                    if 'deliveryStatus' in updated_item:
                        item['deliveryStatus'] = updated_item['deliveryStatus']
                    if 'EstimatedDeliveryDate' in updated_item:
                        item['EstimatedDeliveryDate'] = updated_item['EstimatedDeliveryDate']
                    if 'DeliveryDate' in updated_item:
                        item['DeliveryDate'] = updated_item['DeliveryDate']
                    updated_item_ids.add(item_key)
                    break

        db.orders.update_one(
            {'_id': ObjectId(order_id)},
            {'$set': {'items': order['items']}}
        )

        return jsonify({'message': 'Order updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_handle_orders_bp.route('/status/<order_id>', methods=['GET'])
@token_required
def get_order_status(user, order_id):
    try:
        order = db.orders.find_one({'_id': ObjectId(order_id)})

        if not order:
            return jsonify({'error': 'Order not found'}), 404

        pending_items = [item for item in order['items'] if item.get('deliveryStatus') == 'Pending']
        transit_items = [item for item in order['items'] if item.get('deliveryStatus') == 'Transit']
        cancelled_items = [item for item in order['items'] if item.get('deliveryStatus') == 'Cancelled']
        delivered_items = [item for item in order['items'] if item.get('deliveryStatus') == 'Delivered']

        order_status = {
            'pending': len(pending_items),
            'transit': len(transit_items),
            'cancelled': len(cancelled_items),
            'delivered': len(delivered_items)
        }

        return jsonify(order_status), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500