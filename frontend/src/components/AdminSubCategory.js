import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CiEdit } from 'react-icons/ci';
import { IoIosAddCircle } from 'react-icons/io';
import { TiTick } from 'react-icons/ti';
import { MdCancel } from 'react-icons/md';
import '../css/AdminSubCategory.css';

const AdminSubcategory = () => {
  const navigate = useNavigate();
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [subcategoryName, setSubcategoryName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subcategoryImage, setSubcategoryImage] = useState(null);
  const [editSubcategoryId, setEditSubcategoryId] = useState(null);
  const [editSubcategoryName, setEditSubcategoryName] = useState('');
  const [editSelectedCategory, setEditSelectedCategory] = useState('');
  const [editSubcategoryImage, setEditSubcategoryImage] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const admin_token = localStorage.getItem('admin_token');
    if (!admin_token) {
      navigate('/admin/login');
    } else {
      fetchSubcategories();
      fetchCategories();
    }
  }, [navigate]);

  const fetchSubcategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/subcategory/all', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      setSubcategories(response.data);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

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

  const handleAddSubcategory = () => {
    setShowAddForm(true);
    setSubcategoryName('');
    setSelectedCategory('');
    setSubcategoryImage(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subcategoryName || !selectedCategory || !subcategoryImage) {
      setError('Subcategory name, category, and image are required');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('SubCategoryName', subcategoryName);
      formData.append('category_id', selectedCategory);
      formData.append('image', subcategoryImage);

      await axios.post('http://localhost:5000/api/admin/subcategory/insert', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      setShowAddForm(false);
      setSubcategoryName('');
      setSelectedCategory('');
      setSubcategoryImage(null);
      setError('');
      fetchSubcategories();
    } catch (error) {
      console.error('Error creating subcategory:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError('An error occurred while creating the subcategory');
      }
    }
  };

  const handleEdit = (subcategory) => {
    setEditSubcategoryId(subcategory._id);
    setEditSubcategoryName(subcategory.SubCategoryName);
    setEditSelectedCategory(subcategory.category_id);
    setEditSubcategoryImage(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('SubCategoryName', editSubcategoryName);
      formData.append('category_id', editSelectedCategory);
      if (editSubcategoryImage) {
        formData.append('image', editSubcategoryImage);
      }

      await axios.put(`http://localhost:5000/api/admin/subcategory/edit/${editSubcategoryId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      setEditSubcategoryId(null);
      setEditSubcategoryName('');
      setEditSelectedCategory('');
      setEditSubcategoryImage(null);
      fetchSubcategories();
    } catch (error) {
      console.error('Error updating subcategory:', error);
    }
  };

  const handleCategoryClick = (categoryId) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
    }
  };

  return (
    <div className="admin-subcategory-container">
      <h2>Manage Subcategories</h2>
      <button className="admin-subcategory-button" onClick={handleAddSubcategory}>
        <IoIosAddCircle /> Add New Subcategory
      </button>
      {showAddForm && (
        <form onSubmit={handleSubmit} className="admin-subcategory-form">
          <div className="admin-subcategory-form-group">
            <label htmlFor="subcategoryName">Subcategory Name:</label>
            <input
              type="text"
              id="subcategoryName"
              value={subcategoryName}
              onChange={(e) => setSubcategoryName(e.target.value)}
            />
          </div>
          <div className="admin-subcategory-form-group">
            <label htmlFor="categorySelect">Category:</label>
            <select
              id="categorySelect"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.CategoryName}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-subcategory-form-group">
            <label htmlFor="subcategoryImage">Subcategory Image:</label>
            <input
              type="file"
              id="subcategoryImage"
              accept=".jpg,.jpeg,.png"
              onChange={(e) => setSubcategoryImage(e.target.files[0])}
            />
          </div>
          {error && <p className="admin-subcategory-error-message">{error}</p>}
          <div className="admin-subcategory-form-actions">
            <button type="submit" className="admin-subcategory-button">
              <TiTick /> Submit
            </button>
            <button type="button" className="admin-subcategory-button" onClick={() => setShowAddForm(false)}>
              <MdCancel /> Cancel
            </button>
          </div>
        </form>
      )}
      <div className="admin-subcategory-category-list">
        {categories.map((category) => (
          <div key={category._id} className="admin-subcategory-category-item">
            <div
              className="admin-subcategory-category-header"
              onClick={() => handleCategoryClick(category._id)}
            >
              <h3>{category.CategoryName}</h3>
              <span>{expandedCategory === category._id ? '-' : '+'}</span>
            </div>
            {expandedCategory === category._id && (
              <div className="admin-subcategory-list">
                {subcategories
                  .filter((subcategory) => subcategory.category_id === category._id)
                  .map((subcategory, index) => (
                    <div key={subcategory._id} className="admin-subcategory-item">
                      <div className="admin-subcategory-details">
                        <span className="admin-subcategory-number">{index + 1}.</span>
                        <span>{subcategory.SubCategoryName}</span>
                        {editSubcategoryId !== subcategory._id && (
                          <div className="admin-subcategory-edit-actions">
                            <button className="admin-subcategory-button" onClick={() => handleEdit(subcategory)}>
                              <CiEdit /> Edit
                            </button>
                          </div>
                        )}
                        {editSubcategoryId === subcategory._id && (
                          <form onSubmit={handleUpdate} className="admin-subcategory-edit-form">
                            <div className="admin-subcategory-form-group">
                              <label htmlFor="editSubcategoryName">Subcategory Name:</label>
                              <input
                                type="text"
                                id="editSubcategoryName"
                                value={editSubcategoryName}
                                onChange={(e) => setEditSubcategoryName(e.target.value)}
                              />
                            </div>
                            <div className="admin-subcategory-form-group">
                              <label htmlFor="editCategorySelect">Category:</label>
                              <select
                                id="editCategorySelect"
                                value={editSelectedCategory}
                                onChange={(e) => setEditSelectedCategory(e.target.value)}
                              >
                                {categories.map((category) => (
                                  <option key={category._id} value={category._id}>
                                    {category.CategoryName}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="admin-subcategory-form-group">
                              <label htmlFor="editSubcategoryImage">Subcategory Image:</label>
                              <input
                                type="file"
                                id="editSubcategoryImage"
                                accept=".jpg,.jpeg,.png"
                                onChange={(e) => setEditSubcategoryImage(e.target.files[0])}
                              />
                            </div>
                            <div className="admin-subcategory-form-actions">
                              <button type="submit" className="admin-subcategory-button">
                                <TiTick /> Save
                              </button>
                              <button
                                type="button"
                                className="admin-subcategory-button"
                                onClick={() => setEditSubcategoryId(null)}
                              >
                                <MdCancel /> Cancel
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSubcategory;