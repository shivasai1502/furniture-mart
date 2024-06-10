import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SignInForm from '../components/SignInForm';


const SignInFormPage = () => {
  return (
    <div>
      <Navbar />
      <SignInForm />
      <Footer />
    </div>
  );
};

export default SignInFormPage;
