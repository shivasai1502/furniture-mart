import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/Checkout.css';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [useExistingAddress, setUseExistingAddress] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [newAddress, setNewAddress] = useState({
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    zipcode: '',
  });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [useExistingNumber, setUseExistingNumber] = useState(true);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [taxRate] = useState(0.08); // Set default tax rate (e.g., 8%)
  const [deliveryCharge] = useState(5.99); // Set default delivery charge
  const [phoneNumberError, setPhoneNumberError] = useState('');

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const response = await axios.get('http://localhost:5000/api/profile/get', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAddresses(response.data.addresses);
        setPhoneNumber(response.data.phone_number);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, [navigate]);

  const handleAddressChange = (e) => {
    setSelectedAddress(e.target.value);
  };

  const handleNewAddressChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const handleProceedToPayment = async () => {
    if (!useExistingAddress && !newAddress.address_line_1) {
      alert('Please enter a delivery address');
      return;
    }

    if (!useExistingNumber && !newPhoneNumber) {
      setPhoneNumberError('Please enter a phone number');
      return;
    }

    let selectedAddressData;
    if (useExistingAddress) {
      selectedAddressData = addresses[selectedAddress];
    } else {
      selectedAddressData = newAddress;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      let updatedPhoneNumber = phoneNumber;
      if (!useExistingNumber) {
        updatedPhoneNumber = newPhoneNumber;
        await axios.put(
          'http://localhost:5000/api/profile/update',
          { phone_number: updatedPhoneNumber },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      // Calculate subtotal
      const subtotal = selectedItems.reduce((total, item) => {
        const maintenancePlanCost = item.maintenancePlan !== 'None' ? parseFloat(item.product.maintenancePlans.find((plan) => plan.title === item.maintenancePlan).cost) : 0;
        return total + (item.product.price + maintenancePlanCost) * item.quantity;
      }, 0);

      // Calculate tax
      const tax = subtotal * taxRate;

      // Calculate total cost
      const totalCost = subtotal + tax + deliveryCharge;

      // Proceed to payment with selected items, phone number, address, and total cost
      navigate('/payment', {
        state: {
          selectedItems,
          phoneNumber: updatedPhoneNumber,
          address: selectedAddressData,
          subtotal,
          tax,
          deliveryCharge,
          totalCost,
        },
      });
    } catch (error) {
      console.error('Error updating phone number:', error);
    }
  };

  const selectedItems = location.state?.selectedItems || [];

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      <div className="selected-items">
        <h3>Selected Items</h3>
        {selectedItems.map((item, index) => {
          const maintenancePlanCost = item.maintenancePlan !== 'None' ? parseFloat(item.product.maintenancePlans.find((plan) => plan.title === item.maintenancePlan).cost) : 0;
          return (
            <div key={index} className="selected-item">
              <div className="item-name">{item.product.name}</div>
              <div className="item-price">Color: {item.selectedColor}</div>
              <div className="item-price">Price: ${item.product.price}</div>
              <div className="item-maintenance-plan">
                Maintenance Plan: {item.maintenancePlan} (${maintenancePlanCost})
              </div>
              <div className="item-quantity">Quantity: {item.quantity}</div>
            </div>
          );
        })}
      </div>
      <div className="delivery-address">
        <h3>Delivery Address</h3>
        <div className="address-options">
          <label className="address-option">
            <input
              type="radio"
              value="existing"
              checked={useExistingAddress}
              onChange={() => setUseExistingAddress(true)}
            />
            <span className="checkmark"></span>
            <span className="label-text">Use existing address</span>
          </label>
          {addresses.length === 0 ? (
            <div className="no-address">
              <p>No address found. Please add an address in your profile.</p>
              <button onClick={() => navigate('/profile')}>Go to Profile</button>
            </div>
          ) : (
            <select value={selectedAddress} onChange={handleAddressChange}>
              <option value="">Select an address</option>
              {addresses.map((address, index) => (
                <option key={index} value={index}>
                  {`${address.address_line_1}, ${address.address_line_2}, ${address.city}, ${address.state}, ${address.zipcode}`}
                </option>
              ))}
            </select>
          )}
          <label className="address-option">
            <input
              type="radio"
              value="new"
              checked={!useExistingAddress}
              onChange={() => setUseExistingAddress(false)}
            />
            <span className="checkmark"></span>
            <span className="label-text">Use new address</span>
          </label>
          {!useExistingAddress && (
            <div className="new-address-inputs">
              <input
                type="text"
                name="address_line_1"
                placeholder="Address Line 1"
                value={newAddress.address_line_1}
                onChange={handleNewAddressChange}
                required
              />
              <input
                type="text"
                name="address_line_2"
                placeholder="Address Line 2"
                value={newAddress.address_line_2}
                onChange={handleNewAddressChange}
              />
              <input
                type="text"
                name="city"
                placeholder="City"
                value={newAddress.city}
                onChange={handleNewAddressChange}
                required
              />
              <input
                type="text"
                name="state"
                placeholder="State"
                value={newAddress.state}
                onChange={handleNewAddressChange}
                required
              />
              <input
                type="text"
                name="zipcode"
                placeholder="Zipcode"
                value={newAddress.zipcode}
                onChange={handleNewAddressChange}
                required
              />
            </div>
          )}
        </div>
      </div>
      <div className="phone-number">
        <h3>Phone Number</h3>
        <div className="phone-number-options">
          <label className="phone-number-option">
            <input
              type="radio"
              value="existing"
              checked={useExistingNumber}
              onChange={() => setUseExistingNumber(true)}
            />
            <span className="checkmark"></span>
            <span className="label-text">Use existing number</span>
          </label>
          {phoneNumber ? (
            <p className="existing-number">{phoneNumber}</p>
          ) : (
            <p className="no-number">
              No phone number found. Please add a phone number in your profile.
            </p>
          )}
          <label className="phone-number-option">
            <input
              type="radio"
              value="new"
              checked={!useExistingNumber}
              onChange={() => setUseExistingNumber(false)}
            />
            <span className="checkmark"></span>
            <span className="label-text">Use new number</span>
          </label>
          {!useExistingNumber && (
            <input
              type="text"
              className="new-number-input"
              placeholder="Enter new phone number"
              value={newPhoneNumber}
              onChange={(e) => {
                setNewPhoneNumber(e.target.value);
                setPhoneNumberError('');
              }}
              required
            />
          )}
          {phoneNumberError && <p className="phone-number-error">{phoneNumberError}</p>}
        </div>
      </div>
      <div className="order-summary">
        <h3>Order Summary</h3>
        <div className="summary-item">
          <span>Subtotal:</span>
          <span>
            ${selectedItems.reduce((total, item) => {
              const maintenancePlanCost = item.maintenancePlan !== 'None' ? parseFloat(item.product.maintenancePlans.find((plan) => plan.title === item.maintenancePlan).cost) : 0;
              return total + (item.product.price + maintenancePlanCost) * item.quantity;
            }, 0).toFixed(2)}
          </span>
        </div>
        <div className="summary-item">
          <span>Tax ({taxRate * 100}%):</span>
          <span>
            ${(selectedItems.reduce((total, item) => {
              const maintenancePlanCost = item.maintenancePlan !== 'None' ? parseFloat(item.product.maintenancePlans.find((plan) => plan.title === item.maintenancePlan).cost) : 0;
              return total + (item.product.price + maintenancePlanCost) * item.quantity;
            }, 0) * taxRate).toFixed(2)}
          </span>
        </div>
        <div className="summary-item">
          <span>Delivery Charge:</span>
          <span>${deliveryCharge.toFixed(2)}</span>
        </div>
        <div className="summary-item total">
          <span>Total Cost:</span>
          <span>
            ${(selectedItems.reduce((total, item) => {
              const maintenancePlanCost = item.maintenancePlan !== 'None' ? parseFloat(item.product.maintenancePlans.find((plan) => plan.title === item.maintenancePlan).cost) : 0;
              return total + (item.product.price + maintenancePlanCost) * item.quantity;
            }, 0) + selectedItems.reduce((total, item) => {
              const maintenancePlanCost = item.maintenancePlan !== 'None' ? parseFloat(item.product.maintenancePlans.find((plan) => plan.title === item.maintenancePlan).cost) : 0;
              return total + (item.product.price + maintenancePlanCost) * item.quantity;
            }, 0) * taxRate + deliveryCharge).toFixed(2)}
          </span>
        </div>
      </div>
      <button onClick={handleProceedToPayment}>Proceed to Payment</button>
    </div>
  );
};

export default Checkout;