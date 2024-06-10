import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/Cart.css';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  const fetchCartItems = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await axios.get('http://localhost:5000/api/cart/all', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCartItems(response.data);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  }, [navigate]);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const handleCheckout = () => {
    navigate('/checkout', { state: { selectedItems: cartItems } });
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      await axios.delete('http://localhost:5000/api/cart/delete', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      setCartItems([]);
    } catch (error) {
      console.error('Error deleting items from cart:', error);
    }
  };

  const calculateTotal = () => {
    let total = 0;
    cartItems.forEach((item) => {
      total += item.price * item.quantity;
    });
    return total.toFixed(2);
  };

  return (
    <div className="cart-page">
      <h2>Items in Cart</h2>
      {cartItems.length === 0 ? (
        <p className="empty-cart">Your cart is empty.</p>
      ) : (
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item._id} className="cart-item">
              <div className="cart-item-image">
                <img
                  src={`http://localhost:5000/api/products/images/${item.image_id}`}
                  alt={item.name}
                />
              </div>
              <div className="cart-item-details">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-price">Price: ${item.price}</div>
                <div className="cart-item-quantity">Quantity: {item.quantity}</div>
              </div>
            </div>
          ))}
          <div className="cart-total">
            <div className="total-amount">
              <span>Total Amount: ${calculateTotal()}</span>
            </div>
            <div className="cart-actions">
              <button className="delete-button" onClick={handleDelete}>
                Delete All
              </button>
              <button className="checkout-button" onClick={handleCheckout}>
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;