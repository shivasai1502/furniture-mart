// AdminProductForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TiTick } from 'react-icons/ti';
import { MdCancel } from 'react-icons/md';
import '../css/AdminProductForm.css';

const AdminProductForm = ({ categories, onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [maintenancePlans, setMaintenancePlans] = useState([]);
  const [variants, setVariants] = useState([]);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('');
  const [subcategories, setSubcategories] = useState([]);
  const [subcategory, setSubcategory] = useState('');

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/admin/subcategory/all?category=${category}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
          },
        });
        setSubcategories(response.data);
      } catch (error) {
        console.error('Error fetching subcategories:', error);
        setError('An error occurred while fetching subcategories');
      }
    };

    if (category) {
      fetchSubcategories();
    } else {
      setSubcategories([]);
      setSubcategory('');
    }
  }, [category]);

  const handleAddVariant = () => {
    setVariants([...variants, { color: '', image: null, dimensions: [{ key: '', value: '' }], stock: '' }]);
  };

  const handleRemoveVariant = (index) => {
    const updatedVariants = [...variants];
    updatedVariants.splice(index, 1);
    setVariants(updatedVariants);
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...variants];
    updatedVariants[index][field] = value;
    setVariants(updatedVariants);
  };

  const handleDimensionChange = (variantIndex, dimensionIndex, field, value) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].dimensions[dimensionIndex][field] = value;
    setVariants(updatedVariants);
  };

  const handleAddDimension = (variantIndex) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].dimensions.push({ key: '', value: '' });
    setVariants(updatedVariants);
  };

  const handleRemoveDimension = (variantIndex, dimensionIndex) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].dimensions.splice(dimensionIndex, 1);
    setVariants(updatedVariants);
  };

  const handleAddMaintenancePlan = () => {
    setMaintenancePlans([...maintenancePlans, { title: '', description: '', cost: '' }]);
  };

  const handleRemoveMaintenancePlan = (index) => {
    const updatedMaintenancePlans = [...maintenancePlans];
    updatedMaintenancePlans.splice(index, 1);
    setMaintenancePlans(updatedMaintenancePlans);
  };

  const handleMaintenancePlanChange = (index, field, value) => {
    const updatedMaintenancePlans = [...maintenancePlans];
    updatedMaintenancePlans[index][field] = value;
    setMaintenancePlans(updatedMaintenancePlans);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create variants
      const variantPromises = variants.map(async (variant) => {
        const formData = new FormData();
        formData.append('color', variant.color);
        formData.append('image', variant.image);
        formData.append('dimensions', JSON.stringify(variant.dimensions));
        formData.append('stock', variant.stock);

        const response = await axios.post('http://localhost:5000/api/admin/product/variant/insert', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
          },
        });

        return response.data.variantId;
      });

      const variantIds = await Promise.all(variantPromises);

      // Create product
      const productData = {
        name,
        brand,
        price,
        description,
        features,
        specifications,
        additionalInfo,
        maintenancePlans,
        variants: variantIds,
        category,
        subcategory,
      };

      await axios.post('http://localhost:5000/api/admin/product/insert', productData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });

      onSubmit();
      window.location.reload();
    } catch (error) {
      console.error('Error adding product:', error);
      setError('An error occurred while adding the product');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-product-view-form">
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
      {error && <p className="admin-product-error-message">{error}</p>}
      <div className="admin-product-form-group">
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter product description"
          required
        ></textarea>
      </div>
      <div className="admin-product-form-group">
        <label htmlFor="features">Features:</label>
        <textarea
          id="features"
          value={features}
          onChange={(e) => setFeatures(e.target.value)}
          placeholder="Enter product features"
        ></textarea>
      </div>
      <div className="admin-product-form-group">
        <label htmlFor="specifications">Specifications:</label>
        <textarea
          id="specifications"
          value={specifications}
          onChange={(e) => setSpecifications(e.target.value)}
          placeholder="Enter product specifications"
        ></textarea>
      </div>
      <div className="admin-product-form-group">
        <label htmlFor="additionalInfo">Additional Info:</label>
        <textarea
          id="additionalInfo"
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          placeholder="Enter additional info"
        ></textarea>
      </div>
      <div className="admin-product-form-group">
        <label>Maintenance Plans:</label>
        <div className="admin-product-form-actions">
          <button type="button" onClick={handleAddMaintenancePlan}>
            Add Maintenance Plan
          </button>
        </div>
        {maintenancePlans.map((maintenancePlan, index) => (
          <div key={index} className="admin-product-maintenance-plan-block">
            <div className="admin-product-form-group">
              <label htmlFor={`maintenanceTitle${index}`}>Title:</label>
              <input
                type="text"
                id={`maintenanceTitle${index}`}
                value={maintenancePlan.title}
                onChange={(e) => handleMaintenancePlanChange(index, 'title', e.target.value)}
                placeholder="Enter maintenance plan title"
              />
            </div>
            <div className="admin-product-form-group">
              <label htmlFor={`maintenanceDescription${index}`}>Description:</label>
              <textarea
                id={`maintenanceDescription${index}`}
                value={maintenancePlan.description}
                onChange={(e) => handleMaintenancePlanChange(index, 'description', e.target.value)}
                placeholder="Enter maintenance plan description"
              ></textarea>
            </div>
            <div className="admin-product-form-group">
              <label htmlFor={`maintenanceCost${index}`}>Cost:</label>
              <input
                type="number"
                id={`maintenanceCost${index}`}
                step="0.01"
                value={maintenancePlan.cost}
                onChange={(e) => handleMaintenancePlanChange(index, 'cost', e.target.value)}
                placeholder="Enter maintenance plan cost"
              />
            </div>
            <div className="admin-product-form-actions">
              <button type="button" onClick={() => handleRemoveMaintenancePlan(index)}>
                Remove Maintenance Plan
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="admin-product-form-group">
        <label>Variants:</label>
        <div className="admin-product-form-actions">
          <button type="button" onClick={handleAddVariant}>
            Add Variant
          </button>
        </div>
        {variants.map((variant, index) => (
          <div key={index} className="admin-product-variant-block">
            <div className="admin-product-form-group">
              <label htmlFor={`variantColor${index}`}>Color:</label>
              <input
                type="text"
                id={`variantColor${index}`}
                value={variant.color}
                onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                placeholder="Enter variant color"
              />
            </div>
            <div className="admin-product-form-group">
              <label htmlFor={`variantImage${index}`}>Image:</label>
              <input
                type="file"
                id={`variantImage${index}`}
                onChange={(e) => handleVariantChange(index, 'image', e.target.files[0])}
                accept="image/*"
              />
            </div>
            <div className="admin-product-form-group">
              <label>Dimensions:</label>
              <div className="admin-product-form-actions">
                <button type="button" onClick={() => handleAddDimension(index)}>
                  Add Dimension
                </button>
              </div>
              {variant.dimensions.map((dimension, dimIndex) => (
                <div key={dimIndex} className="admin-product-dimension-block">
                  <div className="admin-product-form-group">
                    <label htmlFor={`dimensionKey${index}${dimIndex}`}>Key:</label>
                    <input
                      type="text"
                      id={`dimensionKey${index}${dimIndex}`}
                      value={dimension.key}
                      onChange={(e) => handleDimensionChange(index, dimIndex, 'key', e.target.value)}
                      placeholder="Enter dimension key"
                    />
                  </div>
                  <div className="admin-product-form-group">
                    <label htmlFor={`dimensionValue${index}${dimIndex}`}>Value:</label>
                    <input
                      type="text"
                      id={`dimensionValue${index}${dimIndex}`}
                      value={dimension.value}
                      onChange={(e) => handleDimensionChange(index, dimIndex, 'value', e.target.value)}
                      placeholder="Enter dimension value"
                    />
                  </div>
                  <div className="admin-product-form-actions">
                    <button type="button" onClick={() => handleRemoveDimension(index, dimIndex)}>
                      Remove Dimension
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="admin-product-form-group">
              <label htmlFor={`variantStock${index}`}>Stock:</label>
              <input
                type="number"
                id={`variantStock${index}`}
                value={variant.stock}
                onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                placeholder="Enter stock quantity"
              />
            </div>
            <div className="admin-product-form-actions">
              <button type="button" onClick={() => handleRemoveVariant(index)}>
                Remove Variant
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="admin-product-form-actions">
        <button className="admin-product-container-button" type="submit">
          <TiTick /> Add Product
        </button>
        <button className="admin-product-container-button" type="button" onClick={onCancel}>
          <MdCancel /> Cancel
        </button>
      </div>
    </form>
  );
};

export default AdminProductForm;
