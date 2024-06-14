import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/SubCategoryProducts.css';

const SubCategoryProducts = () => {
  const { subcategoryId } = useParams();
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/subcategory/${subcategoryId}`);
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, [subcategoryId]);

  const handleProductClick = (product) => {
    navigate(`/view-individual-product/${product._id}`, { state: { product } });
  };

  return (
    <Container>
      <Row className="productview-row">
        {products.map((product) => (
          <Col key={product._id} md={6} lg={4} xl={3}>
            <Card className="productview-card">
              <a href="#" onClick={(e) => { e.preventDefault(); handleProductClick(product); }}>
                <Card.Img
                  variant="top"
                  src={`http://localhost:5000/api/products/images/${product.image_id}`}
                  className="productview-img"
                />
              </a>
              <Card.Body>
                <Card.Title>
                  <a
                    href="#"
                    className="productview-name-link"
                    onClick={(e) => {
                      e.preventDefault();
                      handleProductClick(product);
                    }}
                    >
                    {product.name}
                  </a>
                </Card.Title>
                <Card.Text className="productview-card-price">
                  Price: ${product.price}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default SubCategoryProducts;