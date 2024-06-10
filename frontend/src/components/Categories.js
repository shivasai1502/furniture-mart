import React, { useState, useEffect } from 'react';
import { Container, Col, Image } from 'react-bootstrap';
import axios from 'axios';
import '../css/Category.css';

const Categories = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/categories/all');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <Container className="container">
      {categories.map((category) => (
        <Col key={category._id} className="category-item">
          <a href={`/subcategories/${category._id}`}>
            <div className="category-image-wrapper">
              <Image
                src={`http://localhost:5000/api/categories/images/${category.image_id}`}
                className="category-image"
              />
              <div className="category-name">{category.CategoryName}</div>
            </div>
          </a>
        </Col>
      ))}
    </Container>
  );
};

export default Categories;