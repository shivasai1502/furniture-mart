import React from 'react';
import { useParams } from 'react-router-dom';
import SubCategories from '../components/SubCategories';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const SubCategoriesPage = () => {
  const { categoryId } = useParams();

  return (
    <div>
      <Navbar />
      <SubCategories categoryId={categoryId} />
      <Footer />
    </div>
  );
};

export default SubCategoriesPage;