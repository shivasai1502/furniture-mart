import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Table } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/IndividualProduct.css';

const IndividualProduct = () => {
  const location = useLocation();
  const { product } = location.state;
  const navigate = useNavigate();
  const [buttonText, setButtonText] = useState('Add to Cart');
  const [selectedPlan, setSelectedPlan] = useState('None');
  const [selectedColor, setSelectedColor] = useState(product.variants[0].color);
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const variant = product.variants.find(
      (variant) => variant.color === selectedColor
    );
    setSelectedVariant(variant);
    setQuantity(1);
    setErrorMessage('');
  }, [selectedColor, product.variants]);

  const addToCart = () => {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const existingItemIndex = cartItems.findIndex(
      (item) =>
        item.product._id === product._id &&
        item.maintenancePlan === selectedPlan &&
        item.selectedColor === selectedColor
    );

    let newQuantity = quantity;
    if (existingItemIndex !== -1) {
      newQuantity += cartItems[existingItemIndex].quantity;
    }

    if (newQuantity > selectedVariant.stock) {
      setErrorMessage(`Cannot add to cart. Total quantity (${newQuantity}) exceeds available stock (${selectedVariant.stock}).`);
      return;
    }

    if (existingItemIndex !== -1) {
      cartItems[existingItemIndex].quantity = newQuantity;
    } else {
      cartItems.push({
        product,
        quantity,
        maintenancePlan: selectedPlan,
        selectedColor,
        selectedVariant,
      });
    }

    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    setButtonText('Added to Cart');
    setTimeout(() => {
      setButtonText('Add to Cart');
    }, 2000);
    navigate('/cart');
  };

  const handleQuantityChange = (e) => {
    const newValue = e.target.value;
    if (newValue === '') {
      setQuantity('');
      setErrorMessage('');
    } else {
      const newQuantity = parseInt(newValue);
      if (isNaN(newQuantity)) {
        setQuantity('');
        setErrorMessage('Please enter a valid number');
      } else if (newQuantity < 0) {
        setQuantity(0);
        setErrorMessage('Quantity cannot be negative');
      } else if (newQuantity > selectedVariant.stock) {
        setQuantity(newQuantity);
        setErrorMessage(`Only ${selectedVariant.stock} items available in stock.`);
      } else {
        setQuantity(newQuantity);
        setErrorMessage('');
      }
    }
  };

  return (
    <Container className="individual-product">
      <Row>
        <Col md={6} className="product-image-container">
          <div className="image-wrapper">
            <img
              src={`http://localhost:5000/api/products/variant/image/${selectedVariant.image}`}
              alt={product.name}
              className="product-image"
            />
          </div>
          <div className="color-options">
            {product.variants.map((variant) => (
              <Form.Check
                key={variant.color}
                type="radio"
                id={`color-${variant.color}`}
                label={variant.color}
                checked={selectedColor === variant.color}
                onChange={() => setSelectedColor(variant.color)}
              />
            ))}
          </div>
        </Col>
        <Col md={6} className="product-details">
          <h2 className="product-name">{product.name}</h2>
          <Table striped bordered>
            <tbody>
              <tr>
                <td>Description</td>
                <td>{product.description.split('\n').map((line, index) => <div key={index}>{line}</div>)}</td>
              </tr>
              <tr>
                <td>Price</td>
                <td>{product.price}</td>
              </tr>
              <tr>
                <td>Features</td>
                <td>{product.features.split('\n').map((line, index) => <div key={index}>{line}</div>)}</td>
              </tr>
              <tr>
                <td>Dimensions</td>
                <td>
                  {selectedVariant.dimensions.map((dimension, index) => (
                    <div key={index}>
                      {dimension.key} - {dimension.value}
                    </div>
                  ))}
                </td>
              </tr>
              <tr>
                <td>Specification</td>
                <td>{product.specifications.split('\n').map((line, index) => <div key={index}>{line}</div>)}</td>
              </tr>
              {product.maintenancePlans.length > 0 && (
                <tr>
                  <td>Maintenance Plans</td>
                  <td>
                    <Table>
                      <tbody>
                        <tr>
                          {product.maintenancePlans.map((plan, index) => (
                            <td key={index}>
                              <Form.Check
                                type="radio"
                                id={`plan-${index}`}
                                label=""
                                value={plan.title}
                                checked={selectedPlan === plan.title}
                                onChange={(e) => setSelectedPlan(e.target.value)}
                              />
                              <div className="plan-name">{plan.title}</div>
                              <div className="plan-cost">{plan.cost}</div>
                              <div className="plan-description">{plan.description}</div>
                            </td>
                          ))}
                          <td>
                            <Form.Check
                              type="radio"
                              id="no-plan"
                              label=""
                              value="None"
                              checked={selectedPlan === 'None'}
                              onChange={(e) => setSelectedPlan(e.target.value)}
                            />
                            <div className="plan-name">None</div>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </td>
                </tr>
              )}
              <tr>
                <td>Additional Information</td>
                <td>{product.additionalInfo.split('\n').map((line, index) => <div key={index}>{line}</div>)}</td>
              </tr>
              <tr>
                <td>Quantity</td>
                <td>
                  <Form.Control
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min="0"
                    max={selectedVariant.stock}
                  />
                  {errorMessage && <div className="text-danger">{errorMessage}</div>}
                  <div>Available: {selectedVariant.stock}</div>
                </td>
              </tr>
            </tbody>
          </Table>
          <Button 
            variant="primary" 
            className="add-to-cart-btn" 
            onClick={addToCart}
            disabled={quantity > selectedVariant.stock || quantity <= 0 || quantity === ''}
          >
            {buttonText}
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default IndividualProduct;