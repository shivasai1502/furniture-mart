import json
from flask import Blueprint, request, jsonify, make_response
from database import db
from bson.objectid import ObjectId
from admin_utils import token_required
from gridfs import GridFS

admin_category_bp = Blueprint('category', __name__)

fs = GridFS(db)

@admin_category_bp.route('/all', methods=['GET'])
@token_required
def get_categories(current_user):
    try:
        categories = list(db.categories.find())
        
        # Fetch products for each category
        for category in categories:
            products = list(db.products.find({'category': category['link']}))
            category['products'] = products
        
        return json.dumps(categories, default=str), 200
    except Exception as e:
        print(f"Error fetching categories: {str(e)}")
        return jsonify({'error': 'An error occurred while fetching categories'}), 500

@admin_category_bp.route('/insert', methods=['POST'])
@token_required
def add_category(current_user):
    try:
        data = request.form
        category_name = data.get('CategoryName')
        link = category_name.lower().replace(' ', '-')
        image = request.files.get('image')

        # Check if the category already exists (case-insensitive)
        existing_category = db.categories.find_one({'CategoryName': {'$regex': f'^{category_name}$', '$options': 'i'}})
        if existing_category:
            return jsonify({'error': 'Category already exists'}), 400

        if image:
            # Save the image file and get the image ID
            image_id = save_image(image)
        else:
            image_id = None

        # Capitalize the category name
        category_name = ' '.join(word.capitalize() for word in category_name.split())

        category = {
            'CategoryName': category_name,
            'link': link,
            'image_id': image_id,
            'subcategories': []  # Add an empty subcategories array
        }

        db.categories.insert_one(category)
        return jsonify({'message': 'Category added successfully'}), 201
    except Exception as e:
        print(f"Error adding category: {str(e)}")
        return jsonify({'error': 'An error occurred while adding category'}), 500

@admin_category_bp.route('/edit/<string:category_id>', methods=['PUT'])
@token_required
def update_category(current_user, category_id):
    try:
        data = request.form
        category_name = data.get('CategoryName')
        link = category_name.lower().replace(' ', '-')
        image = request.files.get('image')

        category = db.categories.find_one({'_id': ObjectId(category_id)})

        if category:
            update_data = {
                'CategoryName': category_name,
                'link': link
            }

            if image:
                # Save the new image file and get the image ID
                image_id = save_image(image)
                update_data['image_id'] = image_id

            db.categories.update_one({'_id': ObjectId(category_id)}, {'$set': update_data})
            return jsonify({'message': 'Category updated successfully'}), 200
        else:
            return jsonify({'error': 'Category not found'}), 404
    except Exception as e:
        print(f"Error updating category: {str(e)}")
        return jsonify({'error': 'An error occurred while updating category'}), 500

@admin_category_bp.route('/delete/<string:category_id>', methods=['DELETE'])
@token_required
def delete_category(current_user, category_id):
    try:
        category = db.categories.find_one({'_id': ObjectId(category_id)})

        if category:
            db.categories.delete_one({'_id': ObjectId(category_id)})
            return jsonify({'message': 'Category deleted successfully'}), 200
        else:
            return jsonify({'error': 'Category not found'}), 404
    except Exception as e:
        print(f"Error deleting category: {str(e)}")
        return jsonify({'error': 'An error occurred while deleting category'}), 500

@admin_category_bp.route('/image/<string:image_id>', methods=['GET'])
def get_image(image_id):
    try:
        image = fs.get(ObjectId(image_id))
        response = make_response(image.read())
        response.headers['Content-Type'] = 'image/jpeg'  # Adjust the content type based on the image format
        return response
    except Exception as e:
        print(f"Error retrieving image: {str(e)}")
        return jsonify({'error': 'An error occurred while retrieving the image'}), 500

def save_image(image):
    try:
        # Store the image in GridFS
        image_id = fs.put(image.read(), filename=image.filename)
        return str(image_id)
    except Exception as e:
        print(f"Error saving image: {str(e)}")
        return None