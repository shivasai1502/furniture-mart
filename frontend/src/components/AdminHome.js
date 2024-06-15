import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/AdminHome.css';

const AdminHome = () => {
  const navigate = useNavigate();
  const [categoriesData, setCategoriesData] = useState([]);
  const [subcategoriesData, setSubcategoriesData] = useState([]);
  const [productsData, setProductsData] = useState([]);

  useEffect(() => {
    const admin_token = localStorage.getItem('admin_token');
    if (!admin_token) {
      navigate('/admin/login');
    } else {
      fetchCategoriesData(admin_token);
      fetchSubcategoriesData(admin_token);
      fetchProductsData(admin_token);
    }
  }, [navigate]);

  const fetchCategoriesData = async (admin_token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/category/all', {
        headers: {
          Authorization: `Bearer ${admin_token}`,
        },
      });
      setCategoriesData(response.data);
    } catch (error) {
      console.error('Error fetching categories data:', error);
    }
  };

  const fetchSubcategoriesData = async (admin_token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/subcategory/all-in', {
        headers: {
          Authorization: `Bearer ${admin_token}`,
        },
      });
      setSubcategoriesData(response.data);
    } catch (error) {
      console.error('Error fetching subcategories data:', error);
    }
  };

  const fetchProductsData = async (admin_token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/product/all', {
        headers: {
          Authorization: `Bearer ${admin_token}`,
        },
      });
      setProductsData(response.data);
    } catch (error) {
      console.error('Error fetching products data:', error);
    }
  };

  return (
    <div className="admin-home-container">
      <div className="admin-home-inventory-info">
        <h2>Inventory Overview</h2>
        <div className="admin-home-summary">
          <div className="admin-home-summary-item">
            <h3>Total Products</h3>
            <p>{productsData.length}</p>
          </div>
          <div className="admin-home-summary-item">
            <h3>Total Categories</h3>
            <p>{categoriesData.length}</p>
          </div>
          <div className="admin-home-summary-item">
            <h3>Total Subcategories</h3>
            <p>{subcategoriesData.length}</p>
          </div>
        </div>
        <h3>Categories and Subcategories:</h3>
        <table className="admin-home-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Subcategory</th>
              <th>Products</th>
            </tr>
          </thead>
          <tbody>
            {categoriesData.map((category) => (
              <>
                <tr key={category._id}>
                  <td rowSpan={category.subcategories.length + 1}>{category.CategoryName}</td>
                </tr>
                {subcategoriesData
                  .filter((subcategory) => subcategory.category === category._id)
                  .map((subcategory) => (
                    <tr key={subcategory._id}>
                      <td>{subcategory.SubCategoryName}</td>
                      <td>{subcategory.products.length}</td>
                    </tr>
                  ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminHome;