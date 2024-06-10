import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../css/ViewOrder.css';

const ViewOrder = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // Redirect to login page if token is not available
          window.location.href = '/login';
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrder(response.data);
      } catch (error) {
        console.error('Error fetching order:', error);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleCancellation = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Redirect to login page if token is not available
        window.location.href = '/login';
        return;
      }

      await axios.put(`http://localhost:5000/api/orders/${orderId}/${itemId}/cancel`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh the order data after cancellation
      const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrder(response.data);
    } catch (error) {
      console.error('Error cancelling item:', error);
    }
  };

  if (!order) {
    return <div>Loading...</div>;
  }

  return (
    <div className="view-order-container">
      <h2 className="view-order-page-title">Order Details</h2>
      <div className="view-order-info">
        <p><strong>Order Id:</strong> {order._id}</p>
        <p><strong>Order date:</strong> {order.orderTime}</p>
        <p><strong>Delivery Address:</strong> {order.address.address_line_1}, {order.address.address_line_2}, {order.address.city}, {order.address.state}, {order.address.zipcode}</p>
        <p><strong>Phone Number:</strong> {order.phoneNumber}</p>
      </div>
      <div className="view-order-items-container">
        {order.items.map((item) => (
          <div className="view-order-item" key={item.product_id}>
            <img
              src={`http://localhost:5000/api/products/images/${item.image_id}`}
              alt={item.name}
              className="view-order-toy-image"
            />
            <div className="view-order-item-details">
              <p className="view-order-toy-name">{item.name}</p>
              <p><strong>Quantity:</strong> {item.quantity}</p>
              {item.deliveryStatus === 'Pending' && (
                <>
                  <p><strong>Estimated Date of Delivery:</strong> {item.EstimatedDeliveryDate}</p>
                  <p className="view-order-delivery-status pending"><strong>Delivery Status:</strong> {item.deliveryStatus}</p>
                </>
              )}
              {item.deliveryStatus === 'Delivered' && (
                <>
                  <p><strong>Delivery Date:</strong> {item.DeliveryDate}</p>
                  <p className="view-order-delivery-status delivered"><strong>Delivery Status:</strong> {item.deliveryStatus}</p>
                </>
              )}
              {item.deliveryStatus === 'Cancelled' && (
                <>
                  <p className="view-order-delivery-status cancelled"><strong>Delivery Status:</strong> {item.deliveryStatus}</p>
                  <p className="view-order-refund-message"><strong>Refund Message:</strong> {item.RefundMessage}</p>
                </>
              )}
              {item.deliveryStatus === 'Transit' && (
                <p className="view-order-delivery-status transit"><strong>Delivery Status:</strong> {item.deliveryStatus}</p>
              )}
              <p><strong>Cost:</strong> ${item.Cost}</p>
              {item.deliveryStatus === 'Pending' ? (
                <button className="view-order-cancel-button" onClick={() => handleCancellation(item.product_id)}>
                  Cancel
                </button>
              ) : (
                item.deliveryStatus === 'Cancelled' ? (
                  <p>Check your Payment Account for refund.</p>
                ) : (
                  <p>Cancellation not possible</p>
                )
              )}
            </div>
          </div>
        ))}
      </div>
      <p><strong>Total Order Amount:</strong> ${order.Totalcost.toFixed(2)}</p>
    </div>
  );
};

export default ViewOrder;