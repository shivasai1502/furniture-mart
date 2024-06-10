from io import BytesIO
import json
from bson import ObjectId
from flask import Blueprint, request, jsonify, send_file
from database import db
from gridfs import GridFS
from jsonencoder import JSONEncoder


products_bp = Blueprint('products', __name__)
fs=GridFS(db)
product_collection = db['products']


@products_bp.route('/category', methods=['GET'])
def get_products_by_category():
    category_id = request.args.get('category')
    if not category_id:
        return jsonify({"error": "Category ID is required"}), 400
    
    if category_id == "view-all-products":
        products = list(product_collection.find({}, {'_id': 1, 'name': 1, 'description': 1, 'price': 1, 'category': 1, 'age_range': 1, 'image_id': 1, 'stock': 1})) 
        for product in products:
            product['_id'] = str(product['_id'])
            product['image'] = get_image_url(product['image_id'])
    else:
        products = list(product_collection.find({'category': category_id}, {'_id': 1, 'name': 1, 'description': 1, 'price': 1, 'category': 1, 'age_range': 1, 'image_id': 1, 'stock': 1}))
        for product in products:
            product['_id'] = str(product['_id'])
            product['image'] = get_image_url(product['image_id'])
    return json.dumps(products, cls=JSONEncoder)

@products_bp.route('/images/<image_id>', methods=['GET'])
def get_image(image_id):
    try:
        image_file = fs.get(ObjectId(image_id))
        #print(f"Image file found: {image_file.filename}")
        #print(f"Image file length: {image_file.length}")
        return send_file(
            BytesIO(image_file.read()),
            mimetype='image/jpeg',
            as_attachment=False
        )
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

def get_image_url(image_id):
    return f'images/{image_id}'