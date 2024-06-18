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
            print("Fetching all products")
        else:
            products = list(db.products.find({'subcategory': ObjectId(subcategory_id)}))
            print(f"Fetching products for subcategory: {subcategory_id}")

        if not products:
            print("No products found")
            return jsonify([]), 200

        for product in products:
            product['_id'] = str(product['_id'])
            product['category'] = str(product['category'])
            product['subcategory'] = str(product['subcategory'])
            product['images'] = [{
                'color': image['color'],
                'file': str(image['file'])
            } for image in product['images']]

        print(f"Number of products fetched: {len(products)}")
        return jsonify(products), 200

    except Exception as e:
        print(f"Error fetching products: {str(e)}")
        return jsonify({"error": str(e)}), 500


@products_bp.route('/images/<image_id>', methods=['GET'])
def get_product_image(image_id):
    try:
        print(f"Fetching image with ID: {image_id}")
        image_file = fs.get(ObjectId(image_id))
        print("Image fetched successfully")
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
    print(f"Fetching product with ID: {product_id}")
    product = db.products.find_one({'_id': ObjectId(product_id)})
    if product:
        print("Product found")
        product['_id'] = str(product['_id'])
        product['category'] = str(product['category'])
        product['subcategory'] = str(product['subcategory'])
        product['images'] = [{
            'color': image['color'],
            'file': str(image['file'])
        } for image in product['images']]
        return json.dumps(product, cls=JSONEncoder), 200
    else:
        print("Product not found")
        return jsonify({'error': 'Product not found'}), 404