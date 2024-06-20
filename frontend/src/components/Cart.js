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
    const selectedItemsData = cartItems
      .filter((item, index) => selectedItems.includes(index))
      .map((item) => ({
        ...item,
        selectedColor: item.selectedColor,
        selectedImage: item.selectedVariant.image,
        maintenancePlan: item.maintenancePlan,
        maintenancePlanCost: item.maintenancePlan !== 'None' ? parseFloat(item.product.maintenancePlans.find((plan) => plan.title === item.maintenancePlan).cost) : 0,
      }));
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
    const itemTotal = (item.product.price + maintenancePlanCost) * item.quantity;
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

  const handleQuantityChange = (index, newQuantity) => {
    const updatedCartItems = [...cartItems];
    const item = updatedCartItems[index];
    
    if (newQuantity > item.selectedVariant.stock) {
      alert(`Only ${item.selectedVariant.stock} items available in stock.`);
      return;
    }

    if (newQuantity < 1) {
      newQuantity = 1;
    }

    item.quantity = newQuantity;
    setCartItems(updatedCartItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
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
                  src={`http://localhost:5000/api/products/variant/image/${item.selectedVariant.image}`}
                  alt={item.product.name}
                />
              </div>
              <div className="cart-item-details">
                <div className="cart-item-name">{item.product.name}</div>
                <div className="cart-item-color">Brand: {item.product.brand}, Color: {item.selectedColor}</div>
                <div className="cart-item-price">Price: ${item.product.price}</div>
                <div className="cart-item-maintenance-plan">
                  Maintenance Plan: {item.maintenancePlan}
                  {item.maintenancePlan !== 'None' && (
                    <span className="cart-item-maintenance-cost">
                      (${item.product.maintenancePlans.find((plan) => plan.title === item.maintenancePlan).cost})
                    </span>
                  )}
                </div>
                <div className="cart-item-quantity">
                  Quantity: 
                  <input 
                    type="number" 
                    value={item.quantity} 
                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                    min="1"
                    max={item.selectedVariant.stock}
                  />
                </div>
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
                Delete
              </button>
              <button className="checkout-button" onClick={handleCheckout} disabled={selectedItems.length === 0}>
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