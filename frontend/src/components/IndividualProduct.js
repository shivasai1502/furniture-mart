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
  const [selectedColor, setSelectedColor] = useState(product.images[0].color);
  const [selectedImage, setSelectedImage] = useState(product.images[0].file);

  useEffect(() => {
    const selectedColorImage = product.images.find(
      (image) => image.color === selectedColor
    );
    setSelectedImage(selectedColorImage.file);
  }, [selectedColor, product.images]);

  const addToCart = () => {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const existingItemIndex = cartItems.findIndex(
      (item) =>
        item.product._id === product._id &&
        item.maintenancePlan === selectedPlan &&
        item.selectedColor === selectedColor
    );

    if (existingItemIndex !== -1) {
      cartItems[existingItemIndex].quantity += 1;
    } else {
      cartItems.push({
        product,
        quantity: 1,
        maintenancePlan: selectedPlan,
        selectedColor,
        selectedImage,
      });
    }

    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    setButtonText('Added to Cart');
    setTimeout(() => {
      setButtonText('Add to Cart');
    }, 2000);
    navigate('/cart');
  };

  return (
    <Container className="individual-product">
      <Row>
        <Col md={6} className="product-image-container">
          <div className="image-wrapper">
            <img
              src={`http://localhost:5000/api/products/images/${selectedImage}`}
              alt={product.name}
              className="product-image"
            />
          </div>
          <div className="color-options">
            {product.images.map((image) => (
              <Form.Check
                key={image.color}
                type="radio"
                id={`color-${image.color}`}
                label={image.color}
                checked={selectedColor === image.color}
                onChange={() => setSelectedColor(image.color)}
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
              {product.dimensions.map((dimension, index) => (
                <tr key={index}>
                  <td>{dimension.label}</td>
                  <td>{dimension.value}</td>
                </tr>
              ))}
              <tr>
                <td>Specification</td>
                <td>{product.specification.split('\n').map((line, index) => <div key={index}>{line}</div>)}</td>
              </tr>
              {product.hasMaintenance && (
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
            </tbody>
          </Table>
          <Button variant="primary" className="add-to-cart-btn" onClick={addToCart}>
            {buttonText}
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default IndividualProduct;