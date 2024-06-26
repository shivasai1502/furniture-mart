import React from 'react';
import { Container } from 'react-bootstrap';
import '../css/viewAll.css';

function ViewAll() {

  return (
    <Container className="container-view">
        <a href="/products/view-all-products" className="view-all-link">
          <div className="view-all-text">Click Here to View All Types of furnitures</div>
        </a>
    </Container>
  );
};

export default ViewAll;
