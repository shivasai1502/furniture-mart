import json
from flask import Blueprint, request, jsonify
from database import db
from bson.objectid import ObjectId
from admin_utils import token_required
from gridfs import GridFS
from jsonencoder import JSONEncoder

admin_furnitures_bp = Blueprint('product', __name__)
fs = GridFS(db)

@admin_furnitures_bp.route('/variant/insert', methods=['POST'])
@token_required
def add_variant(current_user):
    try:
        color = request.form.get('color')
        image = request.files.get('image')
        dimensions = json.loads(request.form.get('dimensions'))
        stock = int(request.form.get('stock'))

        image_id = fs.put(image, filename=image.filename)

        variant = {
            'color': color,
            'image': str(image_id),
            'dimensions': dimensions,
            'stock': stock
        }

        variant_result = db.variants.insert_one(variant)
        variant_id = str(variant_result.inserted_id)

        return jsonify({'message': 'Variant added successfully', 'variantId': variant_id}), 201
    except Exception as e:
        print(f"Error adding variant: {str(e)}")
        return jsonify({'error': 'An error occurred while adding the variant'}), 500


@admin_furnitures_bp.route('/variant/edit/<string:variant_id>', methods=['PUT'])
@token_required
def edit_variant(current_user, variant_id):
    try:
        color = request.form.get('color')
        image = request.files.get('image')
        dimensions = json.loads(request.form.get('dimensions'))
        stock = int(request.form.get('stock'))

        variant = db.variants.find_one({'_id': ObjectId(variant_id)})
        if not variant:
            return jsonify({'error': 'Variant not found'}), 404

        if image:
            image_id = fs.put(image, filename=image.filename)
            variant['image'] = str(image_id)

        variant['color'] = color
        variant['dimensions'] = dimensions
        variant['stock'] = stock

        db.variants.update_one({'_id': ObjectId(variant_id)}, {'$set': variant})

        return jsonify({'message': 'Variant updated successfully'}), 200
    except Exception as e:
        print(f"Error updating variant: {str(e)}")
        return jsonify({'error': 'An error occurred while updating the variant'}), 500


@admin_furnitures_bp.route('/insert', methods=['POST'])
@token_required
def add_product(current_user):
    try:
        data = request.get_json()
        name = data.get('name')
        brand = data.get('brand')
        price = float(data.get('price'))
        description = data.get('description')
        features = data.get('features')
        specifications = data.get('specifications')
        additionalInfo = data.get('additionalInfo')
        maintenancePlans = data.get('maintenancePlans', [])
        variants = data.get('variants', [])
        category = data.get('category')
        subcategory = data.get('subcategory')

        product = {
            'name': name,
            'brand': brand,
            'price': price,
            'description': description,
            'features': features,
            'specifications': specifications,
            'additionalInfo': additionalInfo,
            'maintenancePlans': maintenancePlans,
            'variants': [ObjectId(variant_id) for variant_id in variants],
            'category': ObjectId(category),
            'subcategory': ObjectId(subcategory)
        }

        product_result = db.products.insert_one(product)
        product_id = str(product_result.inserted_id)
        
        db.subcategories.update_one(
            {'_id': ObjectId(subcategory)},
            {'$push': {'products': product_id}}
        )

        return jsonify({'message': 'Product added successfully', 'product_id': product_id}), 201
    except Exception as e:
        print(f"Error adding product: {str(e)}")
        return jsonify({'error': 'An error occurred while adding the product'}), 500


@admin_furnitures_bp.route('/all', methods=['GET'])
@token_required
def get_all_products(current_user):
    try:
        products = list(db.products.find())
        for product in products:
            product['_id'] = str(product['_id'])
            product['category'] = str(product['category'])
            product['subcategory'] = str(product['subcategory'])
            variants = []
            for variant_id in product['variants']:
                variant = db.variants.find_one({'_id': ObjectId(variant_id)})
                if variant:
                    variant['_id'] = str(variant['_id'])
                    variant['image'] = str(variant['image'])
                    variants.append(variant)
            product['variants'] = variants

        return json.dumps(products, cls=JSONEncoder), 200
    except Exception as e:
        print(f"Error fetching products: {str(e)}")
        return jsonify({'error': 'An error occurred while fetching products'}), 500


@admin_furnitures_bp.route('/<string:product_id>', methods=['GET'])
@token_required
def get_product(current_user, product_id):
    try:
        product = db.products.find_one({'_id': ObjectId(product_id)})
        if product:
            product['_id'] = str(product['_id'])
            product['category'] = str(product['category'])
            product['subcategory'] = str(product['subcategory'])
            variants = []
            for variant_id in product['variants']:
                variant = db.variants.find_one({'_id': ObjectId(variant_id)})
                if variant:
                    variant['_id'] = str(variant['_id'])
                    variant['image'] = str(variant['image'])
                    variants.append(variant)
            product['variants'] = variants
            return jsonify(product), 200
        else:
            return jsonify({'error': 'Product not found'}), 404
    except Exception as e:
        print(f"Error fetching product: {str(e)}")
        return jsonify({'error': 'An error occurred while fetching the product'}), 500


@admin_furnitures_bp.route('/edit/<string:product_id>', methods=['PUT'])
@token_required
def edit_product(current_user, product_id):
    try:
        data = request.get_json()
        name = data.get('name')
        brand = data.get('brand')
        price = float(data.get('price'))
        description = data.get('description')
        features = data.get('features')
        specifications = data.get('specifications')
        additionalInfo = data.get('additionalInfo')
        maintenancePlans = data.get('maintenancePlans', [])
        variants = data.get('variants', [])
        category = data.get('category')
        subcategory = data.get('subcategory')

        product = db.products.find_one({'_id': ObjectId(product_id)})
        if not product:
            return jsonify({'error': 'Product not found'}), 404

        product['name'] = name
        product['brand'] = brand
        product['price'] = price
        product['description'] = description
        product['features'] = features
        product['specifications'] = specifications
        product['additionalInfo'] = additionalInfo
        product['maintenancePlans'] = maintenancePlans
        product['variants'] = [ObjectId(variant_id) for variant_id in variants]
        product['category'] = ObjectId(category)
        product['subcategory'] = ObjectId(subcategory)

        db.products.update_one({'_id': ObjectId(product_id)}, {'$set': product})

        return jsonify({'message': 'Product updated successfully'}), 200
    except Exception as e:
        print(f"Error updating product: {str(e)}")
        return jsonify({'error': 'An error occurred while updating the product'}), 500


@admin_furnitures_bp.route('/delete/<string:product_id>', methods=['DELETE'])
@token_required
def delete_product(current_user, product_id):
    try:
        product = db.products.find_one({'_id': ObjectId(product_id)})
        if product:
            db.products.delete_one({'_id': ObjectId(product_id)})

            # Delete associated variants
            for variant_id in product['variants']:
                db.variants.delete_one({'_id': ObjectId(variant_id)})

            return jsonify({'message': 'Product deleted successfully'}), 200
        else:
            return jsonify({'error': 'Product not found'}), 404
    except Exception as e:
        print(f"Error deleting product: {str(e)}")
        return jsonify({'error': 'An error occurred while deleting the product'}), 500