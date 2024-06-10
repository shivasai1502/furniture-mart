import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/Payment.css';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCardDetails, setSaveCardDetails] = useState(false);
  const [paymentMethodName, setPaymentMethodName] = useState('');
  const [savedPaymentMethods, setSavedPaymentMethods] = useState([]);
  const [useExistingPayment, setUseExistingPayment] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const {
    selectedItems,
    phoneNumber,
    address,
    totalCost,
  } = location.state;

  const fetchSavedPaymentMethods = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/orders/payments', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSavedPaymentMethods(response.data);
    } catch (error) {
      console.error('Error fetching saved payment methods:', error);
    }
  }, [navigate]);

  useEffect(() => {
    fetchSavedPaymentMethods();
  }, [fetchSavedPaymentMethods]);

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleCardholderNameChange = (e) => {
    setCardholderName(e.target.value);
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setCardNumber(value);
  };

  const handleExpiryDateChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    const formattedValue = value.replace(/(\d{2})(\d{0,2})/, '$1/$2');
    setExpiryDate(formattedValue);
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setCvv(value.slice(0, 3));
  };

  const isCardDetailsValid = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    const [expiryMonth, expiryYear] = expiryDate.split('/');

    if (
      !cardholderName ||
      cardNumber.length !== 16 ||
      cvv.length !== 3 ||
      !expiryMonth ||
      !expiryYear ||
      expiryYear < currentYear ||
      (expiryYear === currentYear && expiryMonth < currentMonth)
    ) {
      return false;
    }

    return true;
  };

  const placeOrder = async () => {
    if (useExistingPayment) {
      if (!paymentMethod) {
        alert('Please select a payment method.');
        return;
      }
    } else {
      if (!isCardDetailsValid()) {
        alert('Please enter valid card details.');
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      let cardDetails = null;
      if (useExistingPayment) {
        const selectedPaymentMethod = savedPaymentMethods.find(
          (method) => method._id === paymentMethod
        );
        if (selectedPaymentMethod) {
          cardDetails = {
            cardholderName: selectedPaymentMethod.cardholderName,
            cardNumber: selectedPaymentMethod.cardNumber,
            expiryDate: selectedPaymentMethod.expiryDate,
            cvv: selectedPaymentMethod.cvv,
            paymentMethodName: selectedPaymentMethod.paymentMethodName,
          };
        }
      } else if (saveCardDetails) {
        cardDetails = {
          cardholderName,
          cardNumber,
          expiryDate,
          cvv,
          paymentMethodName,
        };
      }

      const orderData = {
        items: selectedItems.map((item) => ({
          _id: item._id,
          quantity: item.quantity,
        })),
        cost: totalCost,
        tax: location.state.tax,
        discount: location.state.discount,
        cardDetails,
        phoneNumber,
        address,
        deliveryStatus: 'Pending',
      };

      await axios.post('http://localhost:5000/api/orders/place', orderData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      // Delete selected items from the cart
      const selectedProductIds = selectedItems.map((item) => item._id);
      await axios.delete('http://localhost:5000/api/cart/delete', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        data: {
          product_ids: selectedProductIds,
        },
      });

      // Display success message
      setSuccessMessage('Payment successful!');

      // Navigate to /home after a short delay
      setTimeout(() => {
        navigate('/home');
      }, 2000);
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  return (
    <div className="payment-container">
      <h2 className="payment-title">Payment</h2>
      <div className="payment-order-summary">
        <h3 className="payment-order-summary-title">Order Summary</h3>
        <p className="payment-order-summary-text">Total Cost: ${totalCost.toFixed(2)}</p>
        <p className="payment-order-summary-text">Number of Items: {selectedItems.length}</p>
      </div>
      <div className="payment-method">
        <h3 className="payment-method-title">Payment Method</h3>
        {savedPaymentMethods.length > 0 && (
          <div className="payment-saved-methods">
            <label className="payment-saved-label">
              <input
                type="checkbox"
                checked={useExistingPayment}
                onChange={(e) => setUseExistingPayment(e.target.checked)}
              />
              <span className="payment-saved-text">Use existing payment method</span>
            </label>
            {useExistingPayment && (
              <select
                className="payment-saved-select"
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
              >
                <option value="">Select a payment method</option>
                {savedPaymentMethods.map((method) => (
                  <option key={method._id} value={method._id}>
                    {method.paymentMethodName}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
        {!useExistingPayment && (
          <>
            <div className="payment-options">
              <label className="payment-option-label">
                <input
                  type="radio"
                  value="credit"
                  checked={paymentMethod === 'credit'}
                  onChange={handlePaymentMethodChange}
                />
                <span className="payment-option-text">Credit Card</span>
              </label>
              {paymentMethod === 'credit' && (
                <div className="payment-card-details">
                  <input
                    type="text"
                    placeholder="Cardholder Name"
                    value={cardholderName}
                    onChange={handleCardholderNameChange}
                  />
                  <input
                    type="text"
                    placeholder="Card Number"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    maxLength={16}
                  />
                  <input
                    type="text"
                    placeholder="Expiry Date (MM/YY)"
                    value={expiryDate}
                    onChange={handleExpiryDateChange}
                    maxLength={5}
                  />
                  <input
                    type="password"
                    placeholder="CVV"
                    value={cvv}
                    onChange={handleCvvChange}
                    maxLength={3}
                  />
                  <label className="payment-save-card-label">
                    <input
                      type="checkbox"
                      checked={saveCardDetails}
                      onChange={(e) => setSaveCardDetails(e.target.checked)}
                    />
                    <span className="payment-save-card-text">Save Card Details</span>
                  </label>
                  {saveCardDetails && (
                    <input
                      type="text"
                      placeholder="Payment Method Name"
                      value={paymentMethodName}
                      onChange={(e) => setPaymentMethodName(e.target.value)}
                    />
                  )}
                </div>
              )}
              <label className="payment-option-label">
                <input
                  type="radio"
                  value="debit"
                  checked={paymentMethod === 'debit'}
                  onChange={handlePaymentMethodChange}
                />
                <span className="payment-option-text">Debit Card</span>
              </label>
              {paymentMethod === 'debit' && (
                <div className="payment-card-details">
                  <input
                    type="text"
                    placeholder="Cardholder Name"
                    value={cardholderName}
                    onChange={handleCardholderNameChange}
                  />
                  <input
                    type="text"
                    placeholder="Card Number"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    maxLength={16}
                  />
                  <input
                    type="text"
                    placeholder="Expiry Date (MM/YY)"
                    value={expiryDate}
                    onChange={handleExpiryDateChange}
                    maxLength={5}
                  />
                  <input
                    type="password"
                    placeholder="CVV"
                    value={cvv}
                    onChange={handleCvvChange}
                    maxLength={3}
                  />
                  <label className="payment-save-card-label">
                    <input
                      type="checkbox"
                      checked={saveCardDetails}
                      onChange={(e) => setSaveCardDetails(e.target.checked)}
                    />
                    <span className="payment-save-card-text">Save Card Details</span>
                  </label>
                  {saveCardDetails && (
                    <input
                      type="text"
                      placeholder="Payment Method Name"
                      value={paymentMethodName}
                      onChange={(e) => setPaymentMethodName(e.target.value)}
                    />
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      {successMessage && <p className="payment-success-message">{successMessage}</p>}
      <button className="payment-button" onClick={placeOrder}>
        Pay
      </button>
    </div>
  );
};

export default Payment;