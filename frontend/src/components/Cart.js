import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Cart.css';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const storedCartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    setCartItems(storedCartItems);
  }, [navigate]);

  const handleCheckout = () => {
    const selectedItemsData = cartItems.filter((item, index) => selectedItems.includes(index));
    navigate('/checkout', { state: { selectedItems: selectedItemsData } });
  };

  const handleDelete = () => {
    const updatedCartItems = cartItems.filter((item, index) => !selectedItems.includes(index));
    setCartItems(updatedCartItems);
    setSelectedItems([]);
    localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
  };

  const calculateItemTotal = (item) => {
    const maintenancePlanCost = item.maintenancePlan !== 'None' ? parseFloat(item.product.maintenancePlans.find((plan) => plan.title === item.maintenancePlan).cost) : 0;
    const itemTotal = item.product.price * item.quantity + maintenancePlanCost * item.quantity;
    return itemTotal.toFixed(2);
  };

  const calculateCartTotal = () => {
    let total = 0;
    cartItems.forEach((item) => {
      total += parseFloat(calculateItemTotal(item));
    });
    return total.toFixed(2);
  };

  const handleItemSelect = (index) => {
    const selectedIndex = selectedItems.indexOf(index);
    if (selectedIndex > -1) {
      setSelectedItems(selectedItems.filter((item) => item !== index));
    } else {
      setSelectedItems([...selectedItems, index]);
    }
  };

  return (
    <div className="cart-page">
      <h2>Items in Cart</h2>
      {cartItems.length === 0 ? (
        <p className="empty-cart">Your cart is empty.</p>
      ) : (
        <div className="cart-items">
          {cartItems.map((item, index) => (
            <div key={index} className="cart-item">
              <div className="cart-item-checkbox">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(index)}
                  onChange={() => handleItemSelect(index)}
                />
              </div>
              <div className="cart-item-image">
                <img
                  src={`http://localhost:5000/api/products/images/${item.product.image_id}`}
                  alt={item.product.name}
                />
              </div>
              <div className="cart-item-details">
                <div className="cart-item-name">{item.product.name}</div>
                <div className="cart-item-price">Price: ${item.product.price}</div>
                <div className="cart-item-maintenance-plan">
                  Maintenance Plan: {item.maintenancePlan}
                  {item.maintenancePlan !== 'None' && (
                    <span className="cart-item-maintenance-cost">
                      (${item.product.maintenancePlans.find((plan) => plan.title === item.maintenancePlan).cost})
                    </span>
                  )}
                </div>
                <div className="cart-item-quantity">Quantity: {item.quantity}</div>
                <div className="cart-item-total">Item Total: ${calculateItemTotal(item)}</div>
              </div>
            </div>
          ))}
          <div className="cart-total">
            <div className="total-amount">
              <span>Total Amount: ${calculateCartTotal()}</span>
            </div>
            <div className="cart-actions">
              <button className="delete-button" onClick={handleDelete} disabled={selectedItems.length === 0}>
                Delete Selected
              </button>
              <button className="checkout-button" onClick={handleCheckout} disabled={selectedItems.length === 0}>
                Checkout Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;