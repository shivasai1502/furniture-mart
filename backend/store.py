import os
from bson.objectid import ObjectId
from pymongo import MongoClient
from gridfs import GridFS
import pandas as pd

# Connect to MongoDB
client = MongoClient('localhost', 27017)
db = client['toy_store']
fs = GridFS(db)
collection = db['products']

# Read the CSV file
df = pd.read_csv('products.csv')

# Iterate over the rows in the DataFrame and store the products
for _, row in df.iterrows():
    # Open the image file
    image_path = row['image_path']
    try:
        with open(image_path, 'rb') as image_file:
            # Store the image in GridFS
            image_id = fs.put(image_file.read(), filename=row['name'])
    except FileNotFoundError:
        print(f"Error: Could not find image file {image_path}")
        continue

    # Create the product document
    product = {
        'name': row['name'],
        'description': row['description'],
        'price': row['price'],
        'category': row['category'],
        'age_range': row['age_range'],
        'image_id': image_id,
        'stock': row['stock']
    }

    # Store the product in the 'products' collection
    collection.insert_one(product)

print("Products imported successfully!")