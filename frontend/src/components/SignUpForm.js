import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/SignUp.css';

const SignUpForm = () => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipcode: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleRegistration = async (e) => {
    e.preventDefault();

    const {
      firstname,
      lastname,
      email,
      password,
      confirmPassword,
      dateOfBirth,
      phoneNumber,
      addressLine1,
      addressLine2,
      city,
      state,
      zipcode,
    } = formData;

    if (!validateName(firstname) || !validateName(lastname)) {
      setError('Names must contain only alphabets');
      return;
    }

    if (!validateEmail(email)) {
      setError('Invalid email address');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        firstname,
        lastname,
        email,
        password,
        dateOfBirth,
        phoneNumber,
        address: {
          address_line_1: addressLine1,
          address_line_2: addressLine2,
          city,
          state,
          zipcode,
        },
      });
      setError('User Registered Successfully');
      navigate('/login');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError('Registration failed. Please try again.');
      }
    }
  };

  const validateName = (name) => {
    const nameRegex = /^[a-zA-Z]+$/;
    return nameRegex.test(name);
  };

  const validateEmail = (email) => {
    const emailRegex = /^\w+([.-]?\w+)@\w+([.-]?\w+)(.\w{2,3})+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  return (
    <div className="signup-form-container">
      <h1 className="signup-title">Sign Up</h1>
      <form onSubmit={handleRegistration} className="signup-form">
        <div className="signup-input-row">
          <div className="signup-input-group">
            <label htmlFor="firstname" className="signup-label">
              First Name:
            </label>
            <input
              type="text"
              id="firstname"
              value={formData.firstname}
              onChange={handleChange}
              required
              className="signup-input"
            />
          </div>
          <div className="signup-input-group">
            <label htmlFor="lastname" className="signup-label">
              Last Name:
            </label>
            <input
              type="text"
              id="lastname"
              value={formData.lastname}
              onChange={handleChange}
              required
              className="signup-input"
            />
          </div>
        </div>
        <div className="signup-input-group">
          <label htmlFor="email" className="signup-label">
            Email:
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="signup-input"
          />
        </div>
        <div className="signup-input-row">
          <div className="signup-input-group">
            <label htmlFor="dateOfBirth" className="signup-label">
              Date of Birth:
            </label>
            <input
              type="date"
              id="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
              className="signup-input"
            />
          </div>
          <div className="signup-input-group">
            <label htmlFor="phoneNumber" className="signup-label">
              Phone Number:
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              className="signup-input"
            />
          </div>
        </div>
        <div className="signup-input-group">
          <label htmlFor="password" className="signup-label">
            Password:
          </label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="signup-input"
          />
        </div>
        <div className="signup-input-group">
          <label htmlFor="confirmPassword" className="signup-label">
            Confirm Password:
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="signup-input"
          />
        </div>
        <div className="signup-input-row">
          <div className="signup-input-group">
            <label htmlFor="addressLine1" className="signup-label">
              Address Line 1:
            </label>
            <input
              type="text"
              id="addressLine1"
              value={formData.addressLine1}
              onChange={handleChange}
              required
              className="signup-input"
            />
          </div>
          <div className="signup-input-group">
            <label htmlFor="addressLine2" className="signup-label">
              Address Line 2:
            </label>
            <input
              type="text"
              id="addressLine2"
              value={formData.addressLine2}
              onChange={handleChange}
              className="signup-input"
            />
          </div>
        </div>
        <div className="signup-input-row">
          <div className="signup-input-group">
            <label htmlFor="city" className="signup-label">
              City:
            </label>
            <input
              type="text"
              id="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="signup-input"
            />
          </div>
          <div className="signup-input-group">
            <label htmlFor="state" className="signup-label">
              State:
            </label>
            <input
              type="text"
              id="state"
              value={formData.state}
              onChange={handleChange}
              required
              className="signup-input"
            />
          </div>
          <div className="signup-input-group">
            <label htmlFor="zipcode" className="signup-label">
              Zipcode:
            </label>
            <input
              type="text"
              id="zipcode"
              value={formData.zipcode}
              onChange={handleChange}
              required
              className="signup-input"
            />
          </div>
        </div>
        <button type="submit" className="signup-button">
          Create Account
        </button>
        {error && <div className="signup-error-message">{error}</div>}
      </form>
    </div>
  );
};

export default SignUpForm;
