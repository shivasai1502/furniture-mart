// AdminProductView.js
import React, { useState, useEffect, useCallback } from 'react';
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
      setPrice(productData.price);
      setDescription(productData.description);
      setFeatures(productData.features);
      setSpecifications(productData.specifications);
      setAdditionalInfo(productData.additionalInfo);
      setMaintenancePlans(productData.maintenancePlans);
      setVariants(productData.variants);
      setCategory(productData.category);
      setSubcategory(productData.subcategory);
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('An error occurred while fetching the product');
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

  useEffect(() => {
    const admin_token = localStorage.getItem('admin_token');
    if (!admin_token) {
      navigate('/admin/login');
    } else {
      fetchProduct();
      fetchCategories();
    }
  }, [navigate, fetchProduct, fetchCategories]);

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
      // Update variants
      const variantPromises = variants.map(async (variant) => {
        const formData = new FormData();
        formData.append('color', variant.color);
        formData.append('image', variant.image);
        formData.append('dimensions', JSON.stringify(variant.dimensions));
        formData.append('stock', variant.stock);

        if (variant._id) {
          // Update existing variant
          await axios.put(`http://localhost:5000/api/admin/product/variant/edit/${variant._id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
            },
          });
          return variant._id;
        } else {
          // Create new variant
          const response = await axios.post('http://localhost:5000/api/admin/product/variant/insert', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
            },
          });
          return response.data.variantId;
        }
      });

      const variantIds = await Promise.all(variantPromises);

      // Update product
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

      await axios.put(`http://localhost:5000/api/admin/product/edit/${productId}`, productData, {
        headers: {
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

  const handleCancel = () => {
    navigate('/admin/products');
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="admin-product-view-container">
      <h2>Edit Product</h2>
      {error && <p className="admin-product-error-message">{error}</p>}
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
    <TiTick /> Update Product
  </button>
  <button className="admin-product-container-button" type="button" onClick={handleDelete}>
    <MdCancel /> Delete Product
  </button>
  <button className="admin-product-container-button" type="button" onClick={handleCancel}>
    <MdCancel /> Cancel
  </button>
</div>
</form>
</div>
);
};

export default AdminProductView;