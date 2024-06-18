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
        const response = await axios.get(`http://localhost:5000/api/admin/handleorders/${orderId}?deliveryStatus=${activeTab}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
          },
        });
        const order = response.data;
        setSelectedOrder(order);
      } catch (error) {
        console.error('Error fetching order details:', error);
      }
    }
  };

  const handleUpdateOrder = (itemId, field, value) => {
    const updatedOrder = { ...selectedOrder };
    const itemIndex = updatedOrder.items.findIndex((item) => item.product_id === itemId);
    if (itemIndex !== -1) {
      updatedOrder.items[itemIndex][field] = value;
      setSelectedOrder(updatedOrder);
    }
  };

  const saveUpdate = async () => {
    try {
      const updatedItems = selectedOrder.items.filter((item) =>
        item.hasOwnProperty('deliveryStatus') ||
        item.hasOwnProperty('EstimatedDeliveryDate') ||
        item.hasOwnProperty('DeliveryDate')
      );
      await axios.put(
        `http://localhost:5000/api/admin/handleorders/update/${selectedOrder._id}`,
        { items: updatedItems },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
          },
        }
      );
      toast.success('Order updated successfully');
      setSelectedOrder(null);
      fetchOrders();
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
      acc.Pending.push({ ...order, items: pendingItems });
    }
    if (transitItems.length > 0) {
      acc.Transit.push({ ...order, items: transitItems });
    }
    if (cancelledItems.length > 0) {
      acc.Cancelled.push({ ...order, items: cancelledItems });
    }
    if (deliveredItems.length > 0) {
      acc.Delivered.push({ ...order, items: deliveredItems });
    }

    return acc;
  }, { Pending: [], Transit: [], Cancelled: [], Delivered: [] });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedOrder(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
                <th>Total Cost</th>
                <th>Order Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders[activeTab].map((order) => (
                <tr key={`${order._id}-${activeTab}`}>
                  <td>{order._id}</td>
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
          <p><strong>Delivery Charge:</strong> {selectedOrder.deliveryCharge.toFixed(2)}</p>
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
                <th>Product Name</th>
                <th>Product Color</th>
                <th>Quantity</th>
                <th>Maintenance Plan</th>
                <th>Delivery Status</th>
                {activeTab === 'Pending' && <th>Estimated Delivery Date</th>}
                {activeTab === 'Transit' && <th>Delivery Date</th>}
                {activeTab === 'Delivered' && <th>Delivery Date</th>}
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {selectedOrder.items.map((item, index) => (
                <tr key={`${item.product_id}-${index}`}>
                  <td>{index + 1}</td>
                  <td>
                    <span>{item.name}</span>
                  </td>
                  <td>{item.selectedColor}</td>
                  <td>{item.quantity}</td>
                  <td>{item.maintenancePlan ? item.maintenancePlan : 'N/A'}</td>
                  <td>
                    {activeTab === 'Pending' && (
                      <select
                        value={item.deliveryStatus}
                        onChange={(e) => handleUpdateOrder(item.product_id, 'deliveryStatus', e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Transit">Transit</option>
                      </select>
                    )}
                    {activeTab === 'Transit' && (
                      <select
                        value={item.deliveryStatus}
                        onChange={(e) => handleUpdateOrder(item.product_id, 'deliveryStatus', e.target.value)}
                      >
                        <option value="Transit">Transit</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    )}
                    {(activeTab === 'Cancelled' || activeTab === 'Delivered') && <span>{item.deliveryStatus}</span>}
                  </td>
                  {activeTab === 'Pending' && (
                    <td>
                      <input
                        type="date"
                        value={item.EstimatedDeliveryDate ? formatDate(item.EstimatedDeliveryDate) : todayDate()}
                        onChange={(e) => handleUpdateOrder(item.product_id, 'EstimatedDeliveryDate', e.target.value)}
                      />
                    </td>
                  )}
                  {activeTab === 'Transit' && (
                    <td>
                      <input
                        type="date"
                        value={item.DeliveryDate ? formatDate(item.DeliveryDate) : todayDate()}
                        onChange={(e) => handleUpdateOrder(item.product_id, 'DeliveryDate', e.target.value)}
                      />
                    </td>
                  )}
                  {activeTab === 'Delivered' && (
                    <td>{item.DeliveryDate ? formatDate(item.DeliveryDate) : 'N/A'}</td>
                  )}
                  <td>{item.Cost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(activeTab === 'Pending' || activeTab === 'Transit') && (
            <div className="admin-handle-orders-save-button">
              <button className="admin-handle-orders-button" onClick={saveUpdate}>
                Save Changes
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminHandleOrders;
