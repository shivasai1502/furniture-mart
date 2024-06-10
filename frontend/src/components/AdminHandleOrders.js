import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/AdminHandleOrders.css';
import { MdClose } from 'react-icons/md';

const AdminHandleOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('Pending');
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    const admin_token = localStorage.getItem('admin_token');
    if (!admin_token) {
      navigate('/admin/login');
    } else {
      fetchOrders();
    }
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/handleorders/all', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleOrderClick = async (orderId) => {
    if (selectedOrder && selectedOrder._id === orderId) {
      setSelectedOrder(null);
    } else {
      try {
        const response = await axios.get(`http://localhost:5000/api/admin/handleorders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
          },
        });
        setSelectedOrder(response.data);
      } catch (error) {
        console.error('Error fetching order details:', error);
      }
    }
  };

  const handleUpdateOrder = async (itemId, field, value) => {
    const updatedOrder = { ...selectedOrder };
    const itemIndex = updatedOrder.items.findIndex((item) => item.product_id === itemId);
    if (itemIndex !== -1) {
      updatedOrder.items[itemIndex][field] = value;
      setSelectedOrder(updatedOrder);
    }
    setEditItem({ itemId, field, value });
  };

  const saveUpdate = async (itemId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/handleorders/update/${selectedOrder._id}`,
        { itemId, field: editItem.field, value: editItem.value },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
          },
        }
      );
      setEditItem(null);
      toast.success('Order updated successfully');
      fetchOrders();
      window.location.reload(); // Refresh the page
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    }
  };

  const filteredOrders = orders.reduce((acc, order) => {
    if (!order.items) {
      return acc;
    }

    const pendingItems = order.items.filter((item) => item.deliveryStatus === 'Pending');
    const transitItems = order.items.filter((item) => item.deliveryStatus === 'Transit');
    const cancelledItems = order.items.filter((item) => item.deliveryStatus === 'Cancelled');
    const deliveredItems = order.items.filter((item) => item.deliveryStatus === 'Delivered');

    if (pendingItems.length > 0) {
      acc.Pending.push(order);
    }
    if (transitItems.length > 0) {
      acc.Transit.push(order);
    }
    if (cancelledItems.length > 0) {
      acc.Cancelled.push(order);
    }
    if (deliveredItems.length === order.items.length) {
      acc.Delivered.push(order);
    }

    return acc;
  }, { Pending: [], Transit: [], Cancelled: [], Delivered: [] });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedOrder(null); // Close the displayed order details when changing tabs
  };

  return (
    <div className="admin-handle-orders-container">
      <h2>Manage Orders</h2>
      <div className="admin-handle-orders-tabs">
        <button
          className={`admin-handle-orders-tab ${activeTab === 'Pending' ? 'active' : ''}`}
          onClick={() => handleTabChange('Pending')}
        >
          Pending Orders ({filteredOrders.Pending.length})
        </button>
        <button
          className={`admin-handle-orders-tab ${activeTab === 'Transit' ? 'active' : ''}`}
          onClick={() => handleTabChange('Transit')}
        >
          Transit Orders ({filteredOrders.Transit.length})
        </button>
        <button
          className={`admin-handle-orders-tab ${activeTab === 'Cancelled' ? 'active' : ''}`}
          onClick={() => handleTabChange('Cancelled')}
        >
          Cancelled Orders ({filteredOrders.Cancelled.length})
        </button>
        <button
          className={`admin-handle-orders-tab ${activeTab === 'Delivered' ? 'active' : ''}`}
          onClick={() => handleTabChange('Delivered')}
        >
          Delivered Orders ({filteredOrders.Delivered.length})
        </button>
      </div>
      <div className="admin-handle-orders-table-container">
        {filteredOrders[activeTab].length === 0 ? (
          <p>No orders found for the selected tab.</p>
        ) : (
          <table className="admin-handle-orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Name</th>
                <th>Total Cost</th>
                <th>Order Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders[activeTab].map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.customerName}</td>
                  <td>{order.Totalcost.toFixed(2)}</td>
                  <td>{new Date(order.orderTime).toLocaleString()}</td>
                  <td>
                    <button
                      className="admin-handle-orders-button"
                      onClick={() => handleOrderClick(order._id)}
                    >
                      {selectedOrder && selectedOrder._id === order._id ? 'Hide Details' : 'View Details'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {selectedOrder && (
        <div className="admin-handle-orders-details">
          <div className="admin-handle-orders-details-header">
            <h3>Order Details</h3>
            <MdClose
              className="admin-handle-orders-close-icon"
              onClick={() => setSelectedOrder(null)}
            />
          </div>
          <p><strong>Order ID:</strong> {selectedOrder._id}</p>
          <p><strong>Total Cost:</strong> {selectedOrder.Totalcost.toFixed(2)}</p>
          <p><strong>Tax:</strong> {selectedOrder.tax.toFixed(2)}</p>
          <p><strong>Discount:</strong> {selectedOrder.discount.toFixed(2)}</p>
          <p><strong>Payment ID:</strong> {selectedOrder.paymentId}</p>
          <p><strong>Phone Number:</strong> {selectedOrder.phoneNumber}</p>
          <p>
            <strong>Address:</strong> {selectedOrder.address.address_line_1}, {selectedOrder.address.address_line_2},{' '}
            {selectedOrder.address.city}, {selectedOrder.address.state}, {selectedOrder.address.zipcode}
          </p>
          <p><strong>Order Time:</strong> {new Date(selectedOrder.orderTime).toLocaleString()}</p>
          <h4>Order Items</h4>
          <table className="admin-handle-orders-items-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Delivery Status</th>
                <th>Estimated Delivery Date</th>
                <th>Delivery Date</th>
                <th>Cost</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {selectedOrder.items
                .filter((item) => item.deliveryStatus === activeTab)
                .map((item, index) => (
                  <tr key={item.product_id}>
                    <td>{index + 1}</td>
                    <td>
                      <span>{item.name}</span>
                    </td>
                    <td>{item.quantity}</td>
                    <td>
                      <select
                        value={item.deliveryStatus}
                        onChange={(e) => handleUpdateOrder(item.product_id, 'deliveryStatus', e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Transit">Transit</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="date"
                        value={item.EstimatedDeliveryDate}
                        onChange={(e) => handleUpdateOrder(item.product_id, 'EstimatedDeliveryDate', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        value={item.DeliveryDate}
                        onChange={(e) => handleUpdateOrder(item.product_id, 'DeliveryDate', e.target.value)}
                      />
                    </td>
                    <td>{item.Cost.toFixed(2)}</td>
                    <td>
                      {editItem && editItem.itemId === item.product_id ? (
                        <button className="admin-handle-orders-button" onClick={() => saveUpdate(item.product_id)}>
                          Save
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminHandleOrders;