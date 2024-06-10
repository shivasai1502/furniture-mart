import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/ForgetPassword.css';

const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  const handleForgetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' });
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/auth/forget-password', {
        email,
        newPassword,
      });
      setMessage({ text: response.data.message, type: 'success' });
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setMessage({ text: error.response.data.message, type: 'error' });
    }
  };

  return (
    <div className="forget-password-container-forget">
      <h2 className="forget-password-title-forget">Forget Password</h2>
      <form onSubmit={handleForgetPassword} className="forget-password-form-forget">
        <div className="form-group-forget">
          <label htmlFor="email" className="form-label-forget">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            className="form-input-forget"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group-forget">
          <label htmlFor="newPassword" className="form-label-forget">New Password:</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            placeholder="Enter new password"
            className="form-input-forget"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group-forget">
          <label htmlFor="confirmPassword" className="form-label-forget">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm new password"
            className="form-input-forget"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="form-button-forget">Reset Password</button>
        {message.text && (
          <div className={`message-forget ${message.type}`}>{message.text}</div>
        )}
      </form>
    </div>
  );
};

export default ForgetPassword;