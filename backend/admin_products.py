import json
from flask import Blueprint, request, jsonify, make_response
from database import db
from bson.objectid import ObjectId
from admin_utils import token_required
from gridfs import GridFS

admin_toys_bp = Blueprint('product', __name__)
fs = GridFS(db)

@admin_toys_bp.route('/all', methods=['GET'])
@token_required
def get_all_products(current_user):
    try:
        products = list(db.products.find())
        return json.dumps(products, default=str), 200
    except Exception as e:
        print(f"Error fetching products: {str(e)}")
        return jsonify({'error': 'An error occurred while fetching products'}), 500

@admin_toys_bp.route('/insert', methods=['POST'])
@token_required
def add_product(current_user):
    try:
        data = request.form
        name = data.get('name')
        description = data.get('description')
        price = float(data.get('price'))
        category = data.get('category')
        age_range = data.get('age_range')
        unit= data.get('unit')
        stock = int(data.get('stock'))
        image = request.files.get('image')
        
        if image:
            image_id = fs.put(image.read(), filename=image.filename)
        else:
            image_id = None
        
        product = {
            'name': name,
            'description': description,
            'price': price,
            'category': category,
            'unit': unit,
            'age_range': age_range,
            'image_id': image_id,
            'stock': stock
        }
        
        db.products.insert_one(product)
        
        return jsonify({'message': 'Product added successfully'}), 201
    except Exception as e:
        print(f"Error adding product: {str(e)}")
        return jsonify({'error': 'An error occurred while adding the product'}), 500

@admin_toys_bp.route('/<string:product_id>', methods=['GET'])
@token_required
def get_product(current_user, product_id):
    try:
        product = db.products.find_one({'_id': ObjectId(product_id)})
        if product:
            return json.dumps(product, default=str), 200
        else:
            return jsonify({'error': 'Product not found'}), 404
    except Exception as e:
        print(f"Error fetching product: {str(e)}")
        return jsonify({'error': 'An error occurred while fetching the product'}), 500

@admin_toys_bp.route('/edit/<string:product_id>', methods=['PUT'])
@token_required
def update_product(current_user, product_id):
    try:
        data = request.form
        name = data.get('name')
        description = data.get('description')
        price = float(data.get('price'))
        category = data.get('category')
        age_range = data.get('age_range')
        unit= data.get('unit') if data.get('unit') else None
        stock = int(data.get('stock'))
        image = request.files.get('image')
        
        product = db.products.find_one({'_id': ObjectId(product_id)})
        
        if product:
            update_data = {
                'name': name,
                'description': description,
                'price': price,
                'category': category,
                'unit': unit, # Add this line to update the 'unit' field
                'age_range': age_range,
                'stock': stock
            }
            
            if image:
                image_id = fs.put(image.read(), filename=image.filename)
                update_data['image_id'] = image_id
            
            db.products.update_one({'_id': ObjectId(product_id)}, {'$set': update_data})
            
            return jsonify({'message': 'Product updated successfully'}), 200
        else:
            return jsonify({'error': 'Product not found'}), 404
    except Exception as e:
        print(f"Error updating product: {str(e)}")
        return jsonify({'error': 'An error occurred while updating the product'}), 500

@admin_toys_bp.route('/delete/<string:product_id>', methods=['DELETE'])
@token_required
def delete_product(current_user, product_id):
    try:
        product = db.products.find_one({'_id': ObjectId(product_id)})
        if product:
            db.products.delete_one({'_id': ObjectId(product_id)})
            return jsonify({'message': 'Product deleted successfully'}), 200
        else:
            return jsonify({'error': 'Product not found'}), 404
    except Exception as e:
        print(f"Error deleting product: {str(e)}")
        return jsonify({'error': 'An error occurred while deleting the product'}), 500