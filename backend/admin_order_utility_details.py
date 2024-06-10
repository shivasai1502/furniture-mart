from flask import Blueprint, request, jsonify
from database import db

admin_order_utility_details_bp = Blueprint('admin_order_utility_details_bp', __name__)

@admin_order_utility_details_bp.route('/get-order-utility-details', methods=['GET'])
def get_order_utility_details():
    try:
        # Fetch the admin_order_utility_details from the database
        utility_details = db.admin_order_utility_details.find_one()

        if utility_details:
            # Extract the required fields from the utility_details
            tax_rate = utility_details['taxrate']
            delivery_charge = utility_details['deliverycharge']
            coupons = utility_details['coupons']

            # Return the utility details as a JSON response
            return jsonify({
                'taxRate': tax_rate,
                'deliveryCharge': delivery_charge,
                'coupons': coupons
            }), 200
        else:
            return jsonify({'error': 'Order utility details not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_order_utility_details_bp.route('/validate', methods=['POST'])
def validate_coupon():
    try:
        coupon_code = request.json['couponCode']

        # Fetch the admin_order_utility_details from the database
        utility_details = db.admin_order_utility_details.find_one()

        if utility_details:
            coupons = utility_details['coupons']

            # Check if the coupon code exists in the coupons array
            for coupon in coupons:
                if coupon['code'] == coupon_code:
                    discount = coupon['discount']
                    # Extract the discount percentage from the discount string
                    discount_percentage = int(discount[:-1])
                    return jsonify({
                        'isValid': True,
                        'discountPercentage': discount_percentage
                    }), 200

            return jsonify({'isValid': False}), 200
        else:
            return jsonify({'error': 'Order utility details not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500