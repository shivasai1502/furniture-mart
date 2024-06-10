import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CiEdit } from 'react-icons/ci';
import { IoIosAddCircle } from 'react-icons/io';
import { TiTick } from 'react-icons/ti';
import { MdCancel } from 'react-icons/md';
import '../css/AdminCategory.css';

const AdminCategory = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState(null);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryImage, setEditCategoryImage] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const admin_token = localStorage.getItem('admin_token');
    if (!admin_token) {
      navigate('/admin/login');
    } else {
      fetchCategories();
    }
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

  const handleAddCategory = () => {
    setShowAddForm(true);
    setCategoryName('');
    setCategoryImage(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName || !categoryImage) {
      setError('Category name and image are required');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('CategoryName', categoryName);
      formData.append('image', categoryImage);

      await axios.post('http://localhost:5000/api/admin/category/insert', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      setShowAddForm(false);
      setCategoryName('');
      setCategoryImage(null);
      setError('');
      fetchCategories();
    } catch (error) {
      console.error('Error creating category:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError('An error occurred while creating the category');
      }
    }
  };

  const handleEdit = (category) => {
    setEditCategoryId(category._id);
    setEditCategoryName(category.CategoryName);
    setEditCategoryImage(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('CategoryName', editCategoryName);
      if (editCategoryImage) {
        formData.append('image', editCategoryImage);
      }

      await axios.put(`http://localhost:5000/api/admin/category/edit/${editCategoryId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      setEditCategoryId(null);
      setEditCategoryName('');
      setEditCategoryImage(null);
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  return (
    <div className="admin-category-container">
      <h2>Manage Categories</h2>
      <button className="admin-category-button" onClick={handleAddCategory}>
        <IoIosAddCircle /> Add New Category
      </button>
      {showAddForm && (
        <form onSubmit={handleSubmit} className="admin-category-form">
          <div className="admin-category-form-group">
            <label htmlFor="categoryName">Category Name:</label>
            <input
              type="text"
              id="categoryName"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
          </div>
          <div className="admin-category-form-group">
            <label htmlFor="categoryImage">Category Image:</label>
            <input
              type="file"
              id="categoryImage"
              accept=".jpg,.jpeg,.png"
              onChange={(e) => setCategoryImage(e.target.files[0])}
            />
          </div>
          {error && <p className="admin-category-error-message">{error}</p>}
          <div className="admin-category-form-actions">
            <button type="submit" className="admin-category-button">
              <TiTick /> Submit
            </button>
            <button type="button" className="admin-category-button" onClick={() => setShowAddForm(false)}>
              <MdCancel /> Cancel
            </button>
          </div>
        </form>
      )}
      <div className="admin-category-table-container">
        <table className="admin-category-table">
          <thead>
            <tr>
              <th>Category Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category._id}>
                <td>{category.CategoryName}</td>
                <td className="admin-category-actions">
                  {editCategoryId === category._id ? (
                    <form onSubmit={handleUpdate} className="admin-category-edit-form">
                      <input
                        type="text"
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                      />
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => setEditCategoryImage(e.target.files[0])}
                      />
                      <div className="admin-category-form-actions">
                        <button type="submit" className="admin-category-button">
                          <TiTick /> Save
                        </button>
                        <button type="button" className="admin-category-button" onClick={() => setEditCategoryId(null)}>
                          <MdCancel /> Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button className="admin-category-button" onClick={() => handleEdit(category)}>
                      <CiEdit /> Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCategory;