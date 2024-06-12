import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/AdminProductList.css';

const AdminProductList = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedSubcategory, setExpandedSubcategory] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/category/all', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/subcategory/all-in', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      setSubcategories(response.data);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/product/all', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleCategoryClick = (categoryId) => {
    setExpandedCategory(categoryId === expandedCategory ? null : categoryId);
    setExpandedSubcategory(null);
  };

  const handleSubcategoryClick = (subcategoryId) => {
    setExpandedSubcategory(subcategoryId === expandedSubcategory ? null : subcategoryId);
  };

  const handleProductEdit = (productId) => {
    navigate(`/admin/product/edit/${productId}`);
  };

  const getSubcategoriesByCategory = (categoryId) => {
    return subcategories.filter((subcategory) => subcategory.category === categoryId);
  };

  const getProductsBySubcategory = (subcategoryId) => {
    return products.filter((product) => product.subcategory === subcategoryId);
  };

  return (
    <div className="admin-productlist-container">
      {categories.map((category) => (
        <div key={category._id} className="admin-productlist-category-item">
          <div
            className="admin-productlist-category-header"
            onClick={() => handleCategoryClick(category._id)}
          >
            <h3 className="admin-productlist-category-title">{category.CategoryName}</h3>
            <span className="admin-productlist-expand-icon">
              {expandedCategory === category._id ? '-' : '+'}
            </span>
          </div>
          {expandedCategory === category._id && (
            <div className="admin-productlist-subcategory-list">
              {getSubcategoriesByCategory(category._id).map((subcategory) => (
                <div key={subcategory._id} className="admin-productlist-subcategory-item">
                  <div
                    className="admin-productlist-subcategory-header"
                    onClick={() => handleSubcategoryClick(subcategory._id)}
                  >
                    <h4 className="admin-productlist-subcategory-title">{subcategory.SubCategoryName}</h4>
                    <span className="admin-productlist-expand-icon">
                      {expandedSubcategory === subcategory._id ? '-' : '+'}
                    </span>
                  </div>
                  {expandedSubcategory === subcategory._id && (
                    <div className="admin-productlist-product-list">
                      {getProductsBySubcategory(subcategory._id).map((product, index) => (
                        <div key={product._id} className="admin-productlist-product-item">
                          <span className="admin-productlist-product-number">{index + 1}.</span>
                          <span className="admin-productlist-product-name">{product.name}</span>
                          <div className="admin-productlist-product-actions">
                            <button
                              className="admin-productlist-edit-button"
                              onClick={() => handleProductEdit(product._id)}
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdminProductList;