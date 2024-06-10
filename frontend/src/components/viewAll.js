import React from 'react';
import { Container } from 'react-bootstrap';
import '../css/viewAll.css';

function ViewAll() {

  return (
    <Container className="container-view">
        <a href="/category/view-all-products" className="view-all-link">
          <div className="view-all-text">Click Here to View All Types of Toys</div>
        </a>
    </Container>
  );
};

export default ViewAll;
