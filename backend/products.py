from io import BytesIO
import json
from bson import ObjectId
from flask import Blueprint, jsonify, send_file, request
from database import db
from gridfs import GridFS
from jsonencoder import JSONEncoder

products_bp = Blueprint('products', __name__)
fs = GridFS(db)

@products_bp.route('/subcategory/<subcategory_id>', methods=['GET'])
def get_products_by_subcategory(subcategory_id):
    try:
        if subcategory_id == 'view-all-products':
            products = list(db.products.find({}))
        else:
            products = list(db.products.find({'subcategory': ObjectId(subcategory_id)}))

        for product in products:
            product['_id'] = str(product['_id'])
            product['category'] = str(product['category'])
            product['subcategory'] = str(product['subcategory'])
            product['image_id'] = str(product['image_id'])

        return jsonify(products), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@products_bp.route('/images/<image_id>', methods=['GET'])
def get_product_image(image_id):
    try:
        image_file = fs.get(ObjectId(image_id))
        return send_file(
            BytesIO(image_file.read()),
            mimetype='image/png',
            as_attachment=False
        )
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

@products_bp.route('/<product_id>', methods=['GET'])
def get_individual_product(product_id):
    product = db.products.find_one({'_id': ObjectId(product_id)})
    if product:
        product['_id'] = str(product['_id'])
        product['category'] = str(product['category'])
        product['subcategory'] = str(product['subcategory'])
        product['image_id'] = str(product['image_id'])
        return json.dumps(product, cls=JSONEncoder), 200
    else:
        return jsonify({'error': 'Product not found'}), 404