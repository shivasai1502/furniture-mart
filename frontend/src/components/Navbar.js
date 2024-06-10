import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/Navbar.css';
import Logo from '../images/logo.png';

const Navbar = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/categories/all');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/home');
  };

  return (
    <nav className="navbar">
      <Link to="/">
        <img src={Logo} alt="Company Logo" />
      </Link>
      <ul>
        <li className="dropdown">
          <Link>Shop</Link>
          <div className="dropdown-content">
            {categories.map((category) => (
              <a key={category._id} href={`/category/${category.link}`}>
                {category.CategoryName}
              </a>
            ))}
          </div>
        </li>
        <li>
          <Link to="/cart">Cart</Link>
        </li>
        {token ? (
          <li className="dropdown">
            <Link>Account</Link>
            <div className="dropdown-content">
              <Link to="/profile">Profile</Link>
              <Link to="/customer-orders">Orders</Link>
              <a href="/login" onClick={handleLogout}>
                Sign Out
              </a>
            </div>
          </li>
        ) : (
          <>
            <li>
              <Link to="/login">SignIn/SignUp</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;