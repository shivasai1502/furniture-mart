from io import BytesIO
import json
from bson import ObjectId
from flask import Blueprint, jsonify, send_file
from database import db
from gridfs import GridFS
from jsonencoder import JSONEncoder

category_bp = Blueprint('categories', __name__)
subcategory_bp = Blueprint('subcategories', __name__)
fs = GridFS(db)

@category_bp.route('/all', methods=['GET'])
def get_categories():
    categories = list(db.categories.find())
    for category in categories:
        category['_id'] = str(category['_id'])
        category['image_id'] = category['image_id']
        category['subcategories'] = [str(subcategory_id) for subcategory_id in category['subcategories']]
    return json.dumps(categories, cls=JSONEncoder), 200

@category_bp.route('/images/<image_id>', methods=['GET'])
def get_category_image(image_id):
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

@subcategory_bp.route('/<category_id>', methods=['GET'])
def get_subcategories(category_id):
    category = db.categories.find_one({'_id': ObjectId(category_id)})
    subcategory_ids = category['subcategories']
    subcategories = list(db.subcategories.find({'_id': {'$in': [ObjectId(subcategory_id) for subcategory_id in subcategory_ids]}}))
    for subcategory in subcategories:
        subcategory['_id'] = str(subcategory['_id'])
        subcategory['image_id'] = subcategory['image_id']
    return json.dumps({'subcategories': subcategories, 'categoryName': category['CategoryName']}, cls=JSONEncoder), 200

@subcategory_bp.route('/images/<image_id>', methods=['GET'])
def get_subcategory_image(image_id):
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