import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CategoryProducts from '../components/SubCategoryProducts';


const SubCategoryProductsPage = () => {
  return (
    <div>
      <Navbar />
      <CategoryProducts />
      <Footer />
    </div>
  );
};

export default SubCategoryProductsPage;
