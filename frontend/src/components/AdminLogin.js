import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/admin/login', {
        email,
        password,
      });
      localStorage.setItem('admin_token', response.data.admin_token);
      console.log(response.data.admin_token);
      setMessage({ text: 'Login successful', type: 'success' });
      setTimeout(() => {
        navigate('/admin/home');
      }, 2000);
    } catch (error) {
      setMessage({ text: error.response.data.message, type: 'error' });
    }
  };

  return (
    <div className="admin-password-container-admin">
      <h2 className="admin-password-title-admin">Admin Login</h2>
      <form onSubmit={handleLogin} className="admin-password-form-admin">
        <div className="form-group-admin">
          <label htmlFor="email" className="form-label-admin">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            className="form-input-admin"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group-admin">
          <label htmlFor="password" className="form-label-admin">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            className="form-input-admin"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="form-button-admin">Login</button>
        {message.text && (
          <div className={`message-admin ${message.type}`}>{message.text}</div>
        )}
      </form>
    </div>
  );
};

export default AdminLogin;