import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/CustomerOrders.css';

const CustomerOrder = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  const fetchOrders = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/orders/customer', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  }, [navigate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOrderClick = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  return (
    <div className="customer-order-container">
      <h2 className="customer-order-page-title">Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="customer-order-items-container">
          {orders.map((order) => (
            <div key={order._id} className="customer-order-item">
              <div className="customer-order-item-details">
                <h3 className="customer-order-name">Order ID: {order._id}</h3>
                <p>Order Date: {new Date(order.orderTime).toLocaleDateString()}</p>
                <ul className="customer-order-items-list">
                  {order.items.map((item) => (
                    <li key={item.product_id} className="customer-order-item-row">
                      <div className="customer-order-image-container">
                        <img
                          src={`http://localhost:5000/api/products/images/${item.image_id}`}
                          alt={item.name}
                          className="customer-order-image"
                        />
                      </div>
                      <div className="customer-order-item-info">
                        <p className="customer-order-item-name">{item.name}</p>
                        <p className="customer-order-item-quantity">Quantity: {item.quantity} ,  Delivery Status: {item.deliveryStatus}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <button className="customer-order-details-button" onClick={() => handleOrderClick(order._id)}>
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerOrder;