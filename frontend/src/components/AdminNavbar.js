import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/Navbar.css';
import Logo from '../images/logo.png';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const admin_token = localStorage.getItem('admin_token');

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/home');
  };

  return (
    <nav className="navbar">
      <Link to="/admin/home">
        <img src={Logo} alt="Company Logo" />
      </Link>
      <ul>
        {admin_token ? (
          <>
            <li>
              <Link to="/admin/categories">Categories</Link>
            </li>
            <li>
              <Link to="/admin/sub-categories">Sub-Categories</Link>
            </li>
            <li>
              <Link to="/admin/products">Products</Link>
            </li>
            <li>
              <Link to="/admin/orders">Orders</Link>
            </li>
            <li>
              <a href="/admin/login" onClick={handleLogout}>
                SignOut
              </a> 
            </li>
          </>
        ) : (
          <li>
            <Link to="/admin/login">SignIn</Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default AdminNavbar;