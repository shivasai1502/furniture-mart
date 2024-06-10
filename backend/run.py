import json
from bson.objectid import ObjectId
from pymongo import MongoClient
from gridfs import GridFS
from flask import Flask, jsonify, send_file, request, session
from io import BytesIO
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

# Connect to MongoDB
client = MongoClient('localhost', 27017)
db = client['toy_store']
fs = GridFS(db)
product_collection = db['products']
customer_collection = db['customer']



class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)
    
    
@app.route('/api/products', methods=['GET'])
def get_products_by_category():
    category_id = request.args.get('category')
    if not category_id:
        return jsonify({"error": "Category ID is required"}), 400
    
    products = list(product_collection.find({'category': category_id}, {'_id': 1, 'name': 1, 'description': 1, 'price': 1, 'category': 1, 'age_range': 1, 'image_id': 1}))
    for product in products:
        product['_id'] = str(product['_id'])
        product['image'] = get_image_url(product['image_id'])
    return json.dumps(products, cls=JSONEncoder)


@app.route('/products', methods=['GET'])
def get_products():
    products = list(product_collection.find({}, {'_id': 1, 'name': 1, 'description': 1, 'price': 1, 'category': 1, 'age_range': 1, 'image_id': 1}))
    for product in products:
        product['_id'] = str(product['_id'])
        product['image'] = get_image_url(product['image_id'])
    return json.dumps(products, cls=JSONEncoder)

@app.route('/images/<image_id>', methods=['GET'])
def get_image(image_id):
    try:
        image_file = fs.get(ObjectId(image_id))
        print(f"Image file found: {image_file.filename}")
        print(f"Image file length: {image_file.length}")
        return send_file(
            BytesIO(image_file.read()),
            mimetype='image/jpeg',
            as_attachment=False
        )
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

def get_image_url(image_id):
    return f'/images/{image_id}'

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data['email']

    if 'registration' in data:
        # Handle user registration
        customer_data = {
            "first_name": data['first_name'],
            "last_name": data['last_name'],
            "email": data['email'],
            "password": generate_password_hash(data['password'])
        }
        user = customer_collection.find_one({"email": email})
        if user:
            return jsonify({"error": "User with this email already exists"}), 400
        customer_collection.insert_one(customer_data)
        return jsonify({"message": "User registered successfully"}), 201

    elif 'login' in data:
        # Handle user login
        email = data['email']
        password = data['password']
        user = customer_collection.find_one({"email": email})
        if user and check_password_hash(user['password'], password):
            # Successful login
            return jsonify({"message": "Login successful"}), 200
        else:
            # Invalid credentials
            return jsonify({"error": "Invalid email or password"}), 401

    else:
        return jsonify({"error": "Invalid request"}), 400


@app.route('/customers', methods=['GET'])
def get_all_products():
    products = list(customer_collection.find({}, {'password': 0}))
    response = ""
    for product in products:
        response += json.dumps(product, cls=JSONEncoder) + "\n"
    return response

if __name__ == '__main__':
    app.run(debug=True)