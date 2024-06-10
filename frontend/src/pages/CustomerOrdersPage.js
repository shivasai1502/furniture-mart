import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CustomerOrders from '../components/CustomerOrders';


const CustomerOrdersPage = () => {
  return (
    <div>
      <Navbar />
      <CustomerOrders />
      <Footer />
    </div>
  );
};

export default CustomerOrdersPage;
