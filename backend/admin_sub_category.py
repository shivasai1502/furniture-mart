import json
from flask import Blueprint, request, jsonify, make_response
from database import db
from bson.objectid import ObjectId
from admin_utils import token_required
from gridfs import GridFS

admin_subcategory_bp = Blueprint('subcategory', __name__)

fs = GridFS(db)

subcategory_schema = {
    '_id': ObjectId,
    'SubCategoryName': str,
    'category': ObjectId,  # Reference to the category document
    'image_id': str,
    'products': []  # Array to store references to related products
}

@admin_subcategory_bp.route('/all', methods=['GET'])
@token_required
def get_subcategories(current_user):
    try:
        subcategories = list(db.subcategories.aggregate([
            {
                '$lookup': {
                    'from': 'categories',
                    'localField': 'category',
                    'foreignField': '_id',
                    'as': 'category'
                }
            },
            {
                '$unwind': '$category'
            },
            {
                '$project': {
                    '_id': 1,
                    'SubCategoryName': 1,
                    'category': '$category.CategoryName',
                    'category_id': '$category._id',
                    'image_id': 1
                }
            }
        ]))
        return json.dumps(subcategories, default=str), 200
    except Exception as e:
        print(f"Error fetching subcategories: {str(e)}")
        return jsonify({'error': 'An error occurred while fetching subcategories'}), 500

@admin_subcategory_bp.route('/insert', methods=['POST'])
@token_required
def add_subcategory(current_user):
    try:
        data = request.form
        subcategory_name = data.get('SubCategoryName')
        category_id = data.get('category_id')
        image = request.files.get('image')

        if image:
            # Save the image file and get the image ID
            image_id = save_image(image)
        else:
            image_id = None

        subcategory = {
            'SubCategoryName': subcategory_name,
            'category': ObjectId(category_id),
            'image_id': image_id,
            'products': []
        }

        # Insert the subcategory into the subcategories collection
        subcategory_result = db.subcategories.insert_one(subcategory)
        subcategory_id = str(subcategory_result.inserted_id)

        # Update the subcategories array in the categories collection
        db.categories.update_one(
            {'_id': ObjectId(category_id)},
            {'$push': {'subcategories': subcategory_id}}
        )

        return jsonify({'message': 'Subcategory added successfully'}), 201
    except Exception as e:
        print(f"Error adding subcategory: {str(e)}")
        return jsonify({'error': 'An error occurred while adding subcategory'}), 500

@admin_subcategory_bp.route('/edit/<string:subcategory_id>', methods=['PUT'])
@token_required
def update_subcategory(current_user, subcategory_id):
    try:
        data = request.form
        subcategory_name = data.get('SubCategoryName')
        category_id = data.get('category_id')
        image = request.files.get('image')

        subcategory = db.subcategories.find_one({'_id': ObjectId(subcategory_id)})

        if subcategory:
            update_data = {
                'SubCategoryName': subcategory_name,
                'category': ObjectId(category_id)
            }

            if image:
                # Save the new image file and get the image ID
                image_id = save_image(image)
                update_data['image_id'] = image_id

            db.subcategories.update_one({'_id': ObjectId(subcategory_id)}, {'$set': update_data})
            return jsonify({'message': 'Subcategory updated successfully'}), 200
        else:
            return jsonify({'error': 'Subcategory not found'}), 404
    except Exception as e:
        print(f"Error updating subcategory: {str(e)}")
        return jsonify({'error': 'An error occurred while updating subcategory'}), 500

@admin_subcategory_bp.route('/delete/<string:subcategory_id>', methods=['DELETE'])
@token_required
def delete_subcategory(current_user, subcategory_id):
    try:
        subcategory = db.subcategories.find_one({'_id': ObjectId(subcategory_id)})

        if subcategory:
            db.subcategories.delete_one({'_id': ObjectId(subcategory_id)})
            return jsonify({'message': 'Subcategory deleted successfully'}), 200
        else:
            return jsonify({'error': 'Subcategory not found'}), 404
    except Exception as e:
        print(f"Error deleting subcategory: {str(e)}")
        return jsonify({'error': 'An error occurred while deleting subcategory'}), 500

@admin_subcategory_bp.route('/image/<string:image_id>', methods=['GET'])
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