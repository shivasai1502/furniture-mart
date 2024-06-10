import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../css/SignIn.css';

const SignInForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });
      localStorage.setItem('token', response.data.token);
      console.log(response.data.token);
      navigate('/home');
    } catch (error) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="signin-form-container">
      <form onSubmit={handleLogin} className="signin-form">
        <h1 className="signin-title">Sign In</h1>
        <div className="signin-input-container">
          <label htmlFor="email" className="signin-email-label">
            Email:
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="signin-email-input"
          />
        </div>
        <div className="signin-input-container">
          <label htmlFor="password" className="signin-password-label">
            Password:
          </label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="signin-password-input"
          />
        </div>
        <div className="signin-links-container">
          <a href="/forget-password" className="signin-forgot-password-link">
            Forget Password
          </a>
          <Link to="/signup" className="signin-register-link">
            Register
          </Link>
        </div>
        <button type="submit" className="signin-submit-button">
          Sign IN
        </button>
        {error && <div className="signin-error-message">{error}</div>}
      </form>
    </div>
  );
};

export default SignInForm;