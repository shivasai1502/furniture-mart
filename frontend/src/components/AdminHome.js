import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import { IoIosAddCircle } from "react-icons/io";
import { TiTick } from "react-icons/ti";
import { MdCancel } from "react-icons/md";
import '../css/AdminHome.css';

const AdminHome = () => {
  const navigate = useNavigate();
  const [utilityData, setUtilityData] = useState(null);
  const [toyData, setToyData] = useState(null);
  const [taxRate, setTaxRate] = useState('');
  const [deliveryCharge, setDeliveryCharge] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const admin_token = localStorage.getItem('admin_token');
    if (!admin_token) {
      navigate('/admin/login');
    } else {
      fetchUtilityData(admin_token);
      fetchToyData(admin_token);
    }
  }, [navigate]);

  const fetchUtilityData = async (admin_token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/utility', {
        headers: {
          Authorization: `Bearer ${admin_token}`,
        },
      });
      setUtilityData(response.data);
      setTaxRate(response.data.taxrate);
      setDeliveryCharge(response.data.deliverycharge);
    } catch (error) {
      console.error('Error fetching utility data:', error);
    }
  };

  const fetchToyData = async (admin_token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/toys', {
        headers: {
          Authorization: `Bearer ${admin_token}`,
        },
      });
      setToyData(response.data);
    } catch (error) {
      console.error('Error fetching toy data:', error);
    }
  };


  const handleSaveUtility = async () => {
    const admin_token = localStorage.getItem('admin_token');
    try {
      await axios.put('http://localhost:5000/api/admin/utility', {
        taxrate: taxRate,
        deliverycharge: deliveryCharge,
      }, {
        headers: {
          Authorization: `Bearer ${admin_token}`,
        },
      });
      setIsEditing(false);
      alert('Utility data updated successfully');
    } catch (error) {
      console.error('Error updating utility data:', error);
    }
  };

  const handleAddCoupon = async () => {
    const admin_token = localStorage.getItem('admin_token');
    try {
      await axios.post('http://localhost:5000/api/admin/coupons', {
        code: couponCode,
        discount: couponDiscount,
      }, {
        headers: {
          Authorization: `Bearer ${admin_token}`,
        },
      });
      alert('Coupon added successfully');
      setCouponCode('');
      setCouponDiscount('');
      fetchUtilityData(admin_token);
    } catch (error) {
      console.error('Error adding coupon:', error);
    }
  };

  const handleDeleteCoupon = async (code) => {
    const admin_token = localStorage.getItem('admin_token');
    try {
      await axios.delete(`http://localhost:5000/api/admin/coupons/${code}`, {
        headers: {
          Authorization: `Bearer ${admin_token}`,
        },
      });
      alert('Coupon deleted successfully');
      fetchUtilityData(admin_token);
    } catch (error) {
      console.error('Error deleting coupon:', error);
    }
  };

  return (
    <div className="admin-home-container">
      <div className="admin-home-left-section">
        <div className="admin-home-utility-charges">
          <h2>Charges / Coupons</h2>
          {utilityData ? (
            <div>
              <div className="admin-home-utility-item">
                <span>Tax Rate: {taxRate}</span>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                  />
                ) : (
                  <CiEdit onClick={() => setIsEditing(true)} />
                )}
              </div>
              <div className="admin-home-utility-item">
                <span>Delivery Charge: {deliveryCharge}</span>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={deliveryCharge}
                    onChange={(e) => setDeliveryCharge(e.target.value)}
                  />
                ) : (
                  <CiEdit onClick={() => setIsEditing(true)} />
                )}
              </div>
              {isEditing && (
                <div className="admin-home-utility-actions">
                  <TiTick onClick={handleSaveUtility} />
                  <MdCancel onClick={() => setIsEditing(false)} />
                </div>
              )}
              <h3>Coupons:</h3>
              <div className="admin-home-coupon-form">
                <input
                  type="text"
                  placeholder="Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Coupon Discount"
                  value={couponDiscount}
                  onChange={(e) => setCouponDiscount(e.target.value)}
                />
                <IoIosAddCircle onClick={handleAddCoupon} />
              </div>
              <ul className="admin-home-coupon-list">
                {utilityData.coupons.map((coupon, index) => (
                  <li key={index}>
                    <span>Code: {coupon.code}, Discount: {coupon.discount}</span>
                    <MdDelete onClick={() => handleDeleteCoupon(coupon.code)} />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>Loading utility data...</p>
          )}
        </div>
      </div>
      <div className="admin-home-right-section">
        <div className="admin-home-toy-info">
          <h2>Toys Information</h2>
          {toyData ? (
            <div>
              <p>Total Stock of Toys: {toyData.totalToys}</p>
              <p>Out of Stock Toys: {toyData.outOfStockToys}</p>
              <h3>Categories:</h3>
              <table className="admin-home-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Total Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {toyData.categories.map((category, index) => (
                    <tr key={index}>
                      <td>{category.CategoryName}</td>
                      <td>{category.totalToys}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Loading toy data...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHome;