import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CategoryProducts from '../components/CategoryProducts';


const CategoryProductsPage = () => {
  return (
    <div>
      <Navbar />
      <CategoryProducts />
      <Footer />
    </div>
  );
};

export default CategoryProductsPage;
