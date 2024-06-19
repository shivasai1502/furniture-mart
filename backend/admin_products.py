import base64
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
        for product in products:
            product['_id'] = str(product['_id'])
            product['category'] = str(product['category'])
            product['subcategory'] = str(product['subcategory'])
            product['images'] = [{
                'color': image['color'],
                'file': str(image['file'])
            } for image in product['images']]
        return json.dumps(products), 200
    except Exception as e:
        print(f"Error fetching products: {str(e)}")
        return jsonify({'error': 'An error occurred while fetching products'}), 500

@admin_toys_bp.route('/insert', methods=['POST'])
@token_required
def add_product(current_user):
    try:
        data = request.form
        name = data.get('name')
        brand = data.get('brand')
        description = data.get('description')
        price = float(data.get('price'))
        category = data.get('category')
        subcategory = data.get('subcategory')
        features = data.get('features')
        dimensions = json.loads(data.get('dimensions'))
        specification = data.get('specification')
        hasMaintenance = data.get('hasMaintenance') == 'true'
        maintenancePlans = json.loads(data.get('maintenancePlans'))
        additionalInfo = data.get('additionalInfo')
        stockQuantity = int(data.get('stockQuantity'))

        colors = request.form.getlist('colors')
        image_files = request.files.getlist('images')

        images = []
        for i in range(len(colors)):
            color = colors[i]
            file = image_files[i]
            image_id = fs.put(file, filename=file.filename)
            images.append({
                'color': color,
                'file': str(image_id)
            })

        product = {
            'name': name,
            'brand': brand,
            'description': description,
            'price': price,
            'category': ObjectId(category),
            'subcategory': ObjectId(subcategory),
            'features': features,
            'dimensions': dimensions,
            'specification': specification,
            'hasMaintenance': hasMaintenance,
            'maintenancePlans': maintenancePlans,
            'additionalInfo': additionalInfo,
            'stockQuantity': stockQuantity,
            'images': images,
        }

        product_result = db.products.insert_one(product)
        product_id = str(product_result.inserted_id)

        # Update the products array in the subcategories collection
        db.subcategories.update_one(
            {'_id': ObjectId(subcategory)},
            {'$push': {'products': product_id}}
        )

        return jsonify({'message': 'Product added successfully'}), 201
    except Exception as e:
        print(f"Error adding product: {str(e)}")
        return jsonify({'error': 'An error occurred while adding the product'}), 500

@admin_toys_bp.route('/edit/<string:product_id>', methods=['PUT'])
@token_required
def update_product(current_user, product_id):
    try:
        data = request.form
        name = data.get('name')
        brand = data.get('brand')
        description = data.get('description')
        price = float(data.get('price'))
        category = data.get('category')
        subcategory = data.get('subcategory')
        features = data.get('features')
        dimensions = json.loads(data.get('dimensions'))
        specification = data.get('specification')
        hasMaintenance = data.get('hasMaintenance') == 'true'
        maintenancePlans = json.loads(data.get('maintenancePlans'))
        additionalInfo = data.get('additionalInfo')
        stockQuantity = int(data.get('stockQuantity'))

        product = db.products.find_one({'_id': ObjectId(product_id)})

        if product:
            update_data = {
                'name': name,
                'brand': brand,
                'description': description,
                'price': price,
                'category': ObjectId(category),
                'subcategory': ObjectId(subcategory),
                'features': features,
                'dimensions': dimensions,
                'specification': specification,
                'hasMaintenance': hasMaintenance,
                'maintenancePlans': maintenancePlans,
                'additionalInfo': additionalInfo,
                'stockQuantity': stockQuantity,
            }

            colors = request.form.getlist('colors')
            image_files = request.files.getlist('images')

            images = product['images']  # Start with the existing images

            for i in range(len(colors)):
                color = colors[i]
                if i < len(image_files):
                    file = image_files[i]
                    if file.filename:  # Check if a file is provided
                        image_id = fs.put(file, filename=file.filename)
                        images.append({
                            'color': color,
                            'file': str(image_id)
                        })
                    else:
                        images.append({
                            'color': color,
                            'file': None
                        })

            update_data['images'] = images

            db.products.update_one({'_id': ObjectId(product_id)}, {'$set': update_data})

            return jsonify({'message': 'Product updated successfully'}), 200
        else:
            return jsonify({'error': 'Product not found'}), 404
    except Exception as e:
        print(f"Error updating product: {str(e)}")
        return jsonify({'error': 'An error occurred while updating the product'}), 500


@admin_toys_bp.route('/<string:product_id>', methods=['GET'])
@token_required
def get_product(current_user, product_id):
    try:
        product = db.products.find_one({'_id': ObjectId(product_id)})
        if product:
            product['_id'] = str(product['_id'])
            product['category'] = str(product['category'])
            product['subcategory'] = str(product['subcategory'])
            product['images'] = [{
                'color': image['color'],
                'file': str(image['file'])
            } for image in product['images']]
            return json.dumps(product), 200
        else:
            return jsonify({'error': 'Product not found'}), 404
    except Exception as e:
        print(f"Error fetching product: {str(e)}")
        return jsonify({'error': 'An error occurred while fetching the product'}), 500


@admin_toys_bp.route('/delete/<string:product_id>', methods=['DELETE'])
@token_required
def delete_product(current_user, product_id):
    try:
        product = db.products.find_one({'_id': ObjectId(product_id)})
        if product:
            subcategory_id = product['subcategory']
            db.products.delete_one({'_id': ObjectId(product_id)})

            # Remove the product ID from the related subcategory's products array
            db.subcategories.update_one(
                {'_id': ObjectId(subcategory_id)},
                {'$pull': {'products': product_id}}
            )

            return jsonify({'message': 'Product deleted successfully'}), 200
        else:
            return jsonify({'error': 'Product not found'}), 404
    except Exception as e:
        print(f"Error deleting product: {str(e)}")
        return jsonify({'error': 'An error occurred while deleting the product'}), 500