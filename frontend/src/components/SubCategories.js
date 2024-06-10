import React, { useState, useEffect } from 'react';
import { Container, Col, Image } from 'react-bootstrap';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../css/SubCategory.css';

const SubCategories = () => {
  const [subCategories, setSubCategories] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const { categoryId } = useParams();

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/subcategories/${categoryId}`);
        setSubCategories(response.data.subcategories);
        setCategoryName(response.data.categoryName);
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      }
    };
    fetchSubCategories();
  }, [categoryId]);

  return (
    <Container className="container">
      <h2 className="category-title">{categoryName}</h2>
      {subCategories.map((subCategory) => (
        <Col key={subCategory._id} className="subcategory-item">
          <a href={`/products/${subCategory._id}`}>
            <div className="subcategory-image-wrapper">
              <Image
                src={`http://localhost:5000/api/subcategories/images/${subCategory.image_id}`}
                className="subcategory-image"
              />
              <div className="subcategory-name">{subCategory.SubCategoryName}</div>
            </div>
          </a>
        </Col>
      ))}
    </Container>
  );
};

export default SubCategories;