import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoIosAddCircle } from 'react-icons/io';
import AdminProductForm from './AdminProductForm';
import AdminProductList from './AdminProductList';
import '../css/AdminProduct.css';

const AdminProduct = () => {
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const admin_token = localStorage.getItem('admin_token');
    if (!admin_token) {
      navigate('/admin/login');
    }
    fetchCategories();
  }, [navigate]);

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

  const handleAddProduct = () => {
    setShowAddForm(true);
  };

  const handleSubmitProduct = () => {
    setShowAddForm(false);
  };

  return (
    <div className="admin-product-container">
      <h2>Manage Products</h2>
      <button className="admin-product-container-button" onClick={handleAddProduct}>
        <IoIosAddCircle /> Add New Product
      </button>
      {showAddForm && (
        <AdminProductForm
          categories={categories}
          onSubmit={handleSubmitProduct}
          onCancel={() => setShowAddForm(false)}
        />
      )}
      <AdminProductList />
    </div>
  );
};

export default AdminProduct;