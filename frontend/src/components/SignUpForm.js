import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/SignUp.css';

const SignUpForm = () => {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegistration = async (e) => {
    e.preventDefault();

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
            <label htmlFor="first_name" className="signup-label">
              First Name:
            </label>
            <input
              type="text"
              id="first_name"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              required
              className="signup-input"
            />
          </div>
          <div className="signup-input-group">
            <label htmlFor="last_name" className="signup-label">
              Last Name:
            </label>
            <input
              type="text"
              id="last_name"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="signup-input"
          />
        </div>
        <div className="signup-input-row">
          <div className="signup-input-group">
            <label htmlFor="date_of_birth" className="signup-label">
              Date of Birth:
            </label>
            <input
              type="date"
              id="date_of_birth"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
              className="signup-input"
            />
          </div>
          <div className="signup-input-group">
            <label htmlFor="phone_number" className="signup-label">
              Phone Number:
            </label>
            <input
              type="tel"
              id="phone_number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="signup-input"
          />
        </div>
        <div className="signup-input-group">
          <label htmlFor="confirm_password" className="signup-label">
            Confirm Password:
          </label>
          <input
            type="password"
            id="confirm_password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="signup-input"
          />
        </div>
        <div className="signup-input-row">
          <div className="signup-input-group">
            <label htmlFor="address_line_1" className="signup-label">
              Address Line 1:
            </label>
            <input
              type="text"
              id="address_line_1"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              required
              className="signup-input"
            />
          </div>
          <div className="signup-input-group">
            <label htmlFor="address_line_2" className="signup-label">
              Address Line 2:
            </label>
            <input
              type="text"
              id="address_line_2"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
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
              value={city}
              onChange={(e) => setCity(e.target.value)}
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
              value={state}
              onChange={(e) => setState(e.target.value)}
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
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value)}
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