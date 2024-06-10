import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { TiTick } from 'react-icons/ti';
import { MdCancel } from 'react-icons/md';
import '../css/AdminProductView.css';

const AdminProductView = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('Piece');
  const [category, setCategory] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [image, setImage] = useState(null);
  const [stock, setStock] = useState('');
  const [error, setError] = useState('');

  const fetchProduct = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/product/${productId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      const productData = response.data;
      setProduct(productData);
      setName(productData.name);
      setDescription(productData.description);
      setPrice(productData.price);
      setCategory(productData.category);
      setAgeRange(productData.age_range);
      setStock(productData.stock);
      setUnit('Piece');
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  }, [productId]);

  const fetchCategories = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    const admin_token = localStorage.getItem('admin_token');
    if (!admin_token) {
      navigate('/admin/login');
    } else {
      fetchProduct();
      fetchCategories();
    }
  }, [navigate, productId, fetchProduct, fetchCategories]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('unit', unit);
      formData.append('category', category);
      formData.append('age_range', ageRange);
      if (image) {
        formData.append('image', image);
      }
      formData.append('stock', stock);

      await axios.put(`http://localhost:5000/api/admin/product/edit/${productId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      navigate('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
      setError('An error occurred while updating the product');
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this product?');
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/product/delete/${productId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
          },
        });
        navigate('/admin/products');
      } catch (error) {
        console.error('Error deleting product:', error);
        setError('An error occurred while deleting the product');
      }
    }
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="admin-product-view-container">
      <h2>Product Details</h2>
      {error && <p className="admin-product-view-error-message">{error}</p>}
      <form onSubmit={handleSave} className="admin-product-view-form">
        <div className="admin-product-view-form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="admin-product-view-form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
        <div className="admin-product-view-form-group">
          <label htmlFor="price">Price:</label>
          <input
            type="number"
            id="price"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div className="admin-product-view-form-group">
            <label htmlFor="unit">Unit:</label>
            <select
              id="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              <option value="Piece">Piece</option>
              <option value="Dozen">Dozen</option>
              <option value="Box">Box</option>
            </select>
          </div>
        <div className="admin-product-view-form-group">
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.link}>
                {cat.CategoryName}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-product-view-form-group">
          <label htmlFor="ageRange">Age Range:</label>
          <input
            type="text"
            id="ageRange"
            value={ageRange}
            onChange={(e) => setAgeRange(e.target.value)}
          />
        </div>
        <div className="admin-product-view-form-group">
          <label htmlFor="image">Image:</label>
          <input
            type="file"
            id="image"
            accept=".jpg,.jpeg,.png"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>
        <div className="admin-product-view-form-group">
          <label htmlFor="stock">Stock:</label>
          <input
            type="number"
            id="stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </div>
        <div className="admin-product-view-form-actions">
          <button type="submit">
            <TiTick /> Save
          </button>
          <button type="button" onClick={handleDelete}>
            <MdCancel /> Delete
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductView;