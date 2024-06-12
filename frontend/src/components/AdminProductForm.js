import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TiTick } from 'react-icons/ti';
import { MdCancel } from 'react-icons/md';
import '../css/AdminProductForm.css';

const AdminProductForm = ({ categories, onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState('');
  const [subcategories, setSubcategories] = useState([]);
  const [subcategory, setSubcategory] = useState('');
  const [features, setFeatures] = useState('');
  const [weights, setWeights] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [specification, setSpecification] = useState('');
  const [hasMaintenance, setHasMaintenance] = useState(false);
  const [maintenancePlans, setMaintenancePlans] = useState([]);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [error, setError] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      if (image) {
        formData.append('image', image);
      }
      formData.append('category', category);
      formData.append('subcategory', subcategory);
      formData.append('features', features);
      formData.append('weights', weights);
      formData.append('dimensions', dimensions);
      formData.append('specification', specification);
      formData.append('hasMaintenance', hasMaintenance);
      formData.append('maintenancePlans', JSON.stringify(maintenancePlans));
      formData.append('additionalInfo', additionalInfo);

      await axios.post('http://localhost:5000/api/admin/product/insert', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
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

  const handleAddPlan = () => {
    setMaintenancePlans([...maintenancePlans, { title: '', description: '' }]);
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
        <label htmlFor="image">Upload Image:</label>
        <input
          type="file"
          id="image"
          accept=".jpg,.jpeg,.png"
          onChange={(e) => setImage(e.target.files[0])}
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
        <label htmlFor="weights">Weights:</label>
        <textarea
          id="weights"
          value={weights}
          onChange={(e) => setWeights(e.target.value)}
          className="admin-product-form-textarea"
        ></textarea>
      </div>
      <div className="admin-product-form-group">
        <label htmlFor="dimensions">Dimensions:</label>
        <textarea
          id="dimensions"
          value={dimensions}
          onChange={(e) => setDimensions(e.target.value)}
          className="admin-product-form-textarea"
        ></textarea>
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
      {error && <p className="admin-product-error-message">{error}</p>}
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