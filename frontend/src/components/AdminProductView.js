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
  const [subcategories, setSubcategories] = useState([]);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [features, setFeatures] = useState('');
  const [dimensions, setDimensions] = useState([]);
  const [specification, setSpecification] = useState('');
  const [hasMaintenance, setHasMaintenance] = useState(false);
  const [maintenancePlans, setMaintenancePlans] = useState([]);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
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
      setBrand(productData.brand);
      setDescription(productData.description);
      setPrice(productData.price);
      setImages(productData.images);
      setCategory(productData.category);
      setSubcategory(productData.subcategory);
      setFeatures(productData.features);
      setDimensions(productData.dimensions);
      setSpecification(productData.specification);
      setHasMaintenance(productData.hasMaintenance);
      setMaintenancePlans(productData.maintenancePlans);
      setAdditionalInfo(productData.additionalInfo);
      setStockQuantity(productData.stockQuantity);
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

  const fetchSubcategories = useCallback(async () => {
    if (category) {
      try {
        const response = await axios.get(`http://localhost:5000/api/admin/subcategory/all?category=${category}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
          },
        });
        setSubcategories(response.data);
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      }
    } else {
      setSubcategories([]);
      setSubcategory('');
    }
  }, [category]);

  useEffect(() => {
    const admin_token = localStorage.getItem('admin_token');
    if (!admin_token) {
      navigate('/admin/login');
    } else {
      fetchProduct();
      fetchCategories();
    }
  }, [navigate, productId, fetchProduct, fetchCategories]);

  useEffect(() => {
    fetchSubcategories();
  }, [category, fetchSubcategories]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('brand', brand);
      formData.append('description', description);
      formData.append('price', price);
      images.forEach((image) => {
        formData.append('colors', image.color);
        formData.append('images', image.file);
      });
      formData.append('category', category);
      formData.append('subcategory', subcategory);
      formData.append('features', features);
      formData.append('dimensions', JSON.stringify(dimensions));
      formData.append('specification', specification);
      formData.append('hasMaintenance', hasMaintenance);
      formData.append('maintenancePlans', JSON.stringify(maintenancePlans));
      formData.append('additionalInfo', additionalInfo);
      formData.append('stockQuantity', stockQuantity);

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
      const doubleConfirm = window.confirm('Please confirm again. Do you really want to delete this product?');
      if (doubleConfirm) {
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
    }
  };

  const handleCancel = () => {
    navigate('/admin/products');
  };

  const handleAddImage = () => {
    setImages([...images, { color: '', file: null }]);
  };

  const handleRemoveImage = (index) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
  };

  const handleImageChange = (index, field, value) => {
    const updatedImages = [...images];
    updatedImages[index][field] = value;
    setImages(updatedImages);
  };

  const handleAddDimension = () => {
    setDimensions([...dimensions, { label: '', value: '' }]);
  };

  const handleRemoveDimension = (index) => {
    const updatedDimensions = [...dimensions];
    updatedDimensions.splice(index, 1);
    setDimensions(updatedDimensions);
  };

  const handleDimensionChange = (index, field, value) => {
    const updatedDimensions = [...dimensions];
    updatedDimensions[index][field] = value;
    setDimensions(updatedDimensions);
  };

  const handleAddPlan = () => {
    setMaintenancePlans([...maintenancePlans, { title: '', description: '', cost: '' }]);
  };

  const handleRemovePlan = (index) => {
    const updatedPlans = [...maintenancePlans];
    updatedPlans.splice(index, 1);
    setMaintenancePlans(updatedPlans);
  };

  const handlePlanChange = (index, field, value) => {
    const updatedPlans = [...maintenancePlans];
    updatedPlans[index][field] = value;
    setMaintenancePlans(updatedPlans);
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="admin-product-view-container">
      <h2>Edit Product</h2>
      {error && <p className="admin-product-view-error-message">{error}</p>}
      <form onSubmit={handleSave} className="admin-product-view-form">
        <div className="admin-product-form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter product name"
            required
          />
        </div>
        <div className="admin-product-form-group">
          <label htmlFor="brand">Brand:</label>
          <input
            type="text"
            id="brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Enter brand name"
            required
          />
        </div>
        <div className="admin-product-form-group">
          <label htmlFor="price">Price:</label>
          <input
            type="number"
            id="price"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price"
            required
          />
        </div>
        <div className="admin-product-form-group">
          <label>Add Color & Image:</label>
          <button type="button" onClick={handleAddImage}>
            Add Image
          </button>
          {images.map((image, index) => (
            <div key={index}>
              <div className="admin-product-form-group">
                <label>Color:</label>
                <input
                  type="text"
                  value={image.color}
                  onChange={(e) => handleImageChange(index, 'color', e.target.value)}
                  placeholder="Enter color"
                />
              </div>
              <div className="admin-product-form-group">
                <label>Image:</label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => handleImageChange(index, 'file', e.target.files[0])}
                />
              </div>
              <button type="button" onClick={() => handleRemoveImage(index)}>
                Remove Image
              </button>
            </div>
          ))}
        </div>
        <div className="admin-product-form-group">
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.CategoryName}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-product-form-group">
          <label htmlFor="subcategory">Sub Category:</label>
          <select
            id="subcategory"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            disabled={!category}
            required
          >
            <option value="">Select a subcategory</option>
            {subcategories.map((subcat) => (
              <option key={subcat._id} value={subcat._id}>
                {subcat.SubCategoryName}
              </option>
            ))}
          </select>
          {!category && <p className="admin-product-form-message">Please select a category to display subcategories.</p>}
        </div>
        <div className="admin-product-form-group">
          <label htmlFor="description">Product Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="admin-product-form-textarea"
            required
          ></textarea>
        </div>
        <div className="admin-product-form-group">
          <label htmlFor="features">Features:</label>
          <textarea
            id="features"
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
            className="admin-product-form-textarea"
          ></textarea>
        </div>
        <div className="admin-product-form-group">
          <label>Weights & Dimensions:</label>
          <button type="button" onClick={handleAddDimension}>
            Add Label
          </button>
          {dimensions.map((dimension, index) => (
            <div key={index}>
              <div className="admin-product-form-group">
                <label>Label:</label>
                <input
                  type="text"
                  value={dimension.label}
                  onChange={(e) => handleDimensionChange(index, 'label', e.target.value)}
                />
              </div>
              <div className="admin-product-form-group">
                <label>Value:</label>
                <input
                  type="text"
                  value={dimension.value}
                  onChange={(e) => handleDimensionChange(index, 'value', e.target.value)}
                />
              </div>
              <button type="button" onClick={() => handleRemoveDimension(index)}>
                Remove Dimension
              </button>
            </div>
          ))}
        </div>
        <div className="admin-product-form-group">
          <label htmlFor="specification">Specification:</label>
          <textarea
            id="specification"
            value={specification}
            onChange={(e) => setSpecification(e.target.value)}
            className="admin-product-form-textarea"
          ></textarea>
        </div>
        <div className="admin-product-form-group">
          <label>Maintenance Plan:</label>
          <div className="admin-product-form-radio-group">
            <label>
              <input
                type="radio"
                value="yes"
                checked={hasMaintenance}
                onChange={() => setHasMaintenance(true)}
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                value="no"
                checked={!hasMaintenance}
                onChange={() => setHasMaintenance(false)}
              />
              No
            </label>
          </div>
          {hasMaintenance && (
            <div>
              <button type="button" onClick={handleAddPlan}>
                Add Plan
              </button>
              {maintenancePlans.map((plan, index) => (
                <div key={index}>
                  <div className="admin-product-form-group">
                    <label>Plan Title:</label>
                    <input
                      type="text"
                      value={plan.title}
                      onChange={(e) => handlePlanChange(index, 'title', e.target.value)}
                    />
                  </div>
                  <div className="admin-product-form-group">
                    <label>Description:</label>
                    <textarea
                      value={plan.description}
                      onChange={(e) => handlePlanChange(index, 'description', e.target.value)}
                      className="admin-product-form-textarea"
                    ></textarea>
                  </div>
                  <div className="admin-product-form-group">
                    <label>Cost:</label>
                    <input
                      type="number"
                      step="0.01"
                      value={plan.cost}
                      onChange={(e) => handlePlanChange(index, 'cost', e.target.value)}
                    />
                  </div>
                  <button type="button" onClick={() => handleRemovePlan(index)}>
                    Remove Plan
                    </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="admin-product-form-group">
          <label htmlFor="additionalInfo">Additional Information:</label>
          <textarea
            id="additionalInfo"
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            className="admin-product-form-textarea"
          ></textarea>
        </div>
        <div className="admin-product-form-group">
          <label htmlFor="stockQuantity">Stock Quantity:</label>
          <input
            type="number"
            id="stockQuantity"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(e.target.value)}
            placeholder="Enter stock quantity"
            required
          />
        </div>
        <div className="admin-product-view-form-actions">
          <button type="submit">
            <TiTick /> Save
          </button>
          <button type="button" onClick={handleDelete}>
            <MdCancel /> Delete
          </button>
          <button type="button" onClick={handleCancel}>
            <MdCancel /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductView;