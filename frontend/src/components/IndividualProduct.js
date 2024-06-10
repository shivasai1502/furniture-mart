import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/IndividualProduct.css';

const IndividualProduct = () => {
  const location = useLocation();
  const { product } = location.state;
  const navigate = useNavigate();
  const [buttonText, setButtonText] = useState('Add to Cart');

  const addToCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      await axios.post(
        'http://localhost:5000/api/cart/insert',
        { product_id: product._id },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setButtonText('Added to Cart');
      setTimeout(() => {
        setButtonText('Add to Cart');
      }, 2000);
      navigate('/cart');
      // Show success message or perform any other action
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <Container className="individual-product">
      <Row>
        <Col md={6} className="product-image-container">
          <img
            src={`http://localhost:5000/api/products/images/${product.image_id}`}
            alt={product.name}
            className="product-image"
          />
        </Col>
        <Col md={6} className="product-details">
          <h2 className="product-name">{product.name}</h2>
          <p className="product-price">Price: {product.price}</p>
          <div className="product-description">
            <p>Description: {product.description}</p>
          </div>
          <div className="product-description">
            <p>Age Range: {product.age_range} Years +</p>
          </div>
          <div className="product-description">
            <p>Stock: {product.stock}</p>
          </div>
          <Button variant="primary" className="add-to-cart-btn" onClick={addToCart}>
            {buttonText}
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default IndividualProduct;