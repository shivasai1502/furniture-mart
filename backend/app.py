from flask import Flask
from flask_cors import CORS
from routes import auth_routes
from products import products_bp
from profile import profile_bp
from order import order_bp
from categories import category_bp, subcategory_bp
from admin_routes import admin_routes
from admin_category import admin_category_bp
from admin_products import admin_furnitures_bp
from admin_handle_orders import admin_handle_orders_bp
from admin_sub_category import admin_subcategory_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_routes, url_prefix='/api/auth')
app.register_blueprint(products_bp, url_prefix='/api/products')
app.register_blueprint(profile_bp, url_prefix='/api/profile')
app.register_blueprint(order_bp, url_prefix='/api/orders' )
app.register_blueprint(category_bp, url_prefix='/api/categories')
app.register_blueprint(subcategory_bp, url_prefix='/api/subcategories')
app.register_blueprint(admin_routes, url_prefix='/api/admin')
app.register_blueprint(admin_category_bp, url_prefix='/api/admin/category')
app.register_blueprint(admin_furnitures_bp, url_prefix='/api/admin/product')
app.register_blueprint(admin_handle_orders_bp, url_prefix='/api/admin/handleorders')
app.register_blueprint(admin_subcategory_bp, url_prefix='/api/admin/subcategory')

if __name__ == '__main__': 
    app.run(debug=True)