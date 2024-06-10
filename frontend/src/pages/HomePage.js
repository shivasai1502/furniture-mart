import React from 'react';
import Categories from '../components/Categories';
import Hero from '../components/Hero';
import ViewAll from '../components/viewAll';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const HomePage = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <Categories />
      <ViewAll />
      <Footer />
    </div>
  );
};

export default HomePage;
