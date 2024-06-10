import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/Profile.css';
import { FaEdit } from 'react-icons/fa';

const Profile = () => {
  const [profile, setProfile] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone_number: '',
    addresses: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({ ...profile });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Redirect to login page if token is not available
        return;
      }
      const response = await axios.get('http://localhost:5000/api/profile/get', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleEdit = () => {
    setEditedProfile({ ...profile });
    setIsEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAddressChange = (index, field, value) => {
    const updatedAddresses = [...editedProfile.addresses];
    updatedAddresses[index] = { ...updatedAddresses[index], [field]: value };
    setEditedProfile((prevState) => ({
      ...prevState,
      addresses: updatedAddresses,
    }));
  };

  const handleDeleteAddress = (index) => {
    const updatedAddresses = [...editedProfile.addresses];
    updatedAddresses.splice(index, 1);
    setEditedProfile((prevState) => ({
      ...prevState,
      addresses: updatedAddresses,
    }));
  };

  const handleAddAddress = () => {
    setEditedProfile((prevState) => ({
      ...prevState,
      addresses: [
        ...prevState.addresses,
        {
          address_line_1: '',
          address_line_2: '',
          city: '',
          state: '',
          zipcode: '',
        },
      ],
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Redirect to login page if token is not available
        return;
      }

      // Validate address fields
      const isAddressValid = editedProfile.addresses.every((address) => {
        return (
          (address.address_line_1.trim() !== '' || address.address_line_2.trim() !== '') &&
          address.city.trim() !== '' &&
          address.state.trim() !== '' &&
          address.zipcode.trim() !== ''
        );
      });

      if (!isAddressValid) {
        alert('Please fill in either address line 1 or address line 2, and all other required address fields.');
        return;
      }

      await axios.put('http://localhost:5000/api/profile/update', editedProfile, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert('Profile updated successfully');
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="profile-container">
      <h2 className="profile-title">
        Profile
        {!isEditing && (
          <FaEdit className="edit-icon" onClick={handleEdit} />
        )}
      </h2>
      <div className="profile-card">
        <div className="profile-field">
          <label className="profile-label">First Name:</label>
          {isEditing ? (
            <input
              type="text"
              name="firstname"
              value={editedProfile.firstname}
              onChange={handleChange}
              className="profile-input"
            />
          ) : (
            <span className="profile-value">{profile.firstname}</span>
          )}
        </div>
        <div className="profile-field">
          <label className="profile-label">Last Name:</label>
          {isEditing ? (
            <input
              type="text"
              name="lastname"
              value={editedProfile.lastname}
              onChange={handleChange}
              className="profile-input"
            />
          ) : (
            <span className="profile-value">{profile.lastname}</span>
          )}
        </div>
        <div className="profile-field">
          <label className="profile-label">Email:</label>
          {isEditing ? (
            <input
              type="email"
              name="email"
              value={editedProfile.email}
              onChange={handleChange}
              className="profile-input"
            />
          ) : (
            <span className="profile-value">{profile.email}</span>
          )}
        </div>
        <div className="profile-field">
          <label className="profile-label">Phone Number:</label>
          {isEditing ? (
            <input
              type="text"
              name="phone_number"
              value={editedProfile.phone_number}
              onChange={handleChange}
              className="profile-input"
            />
          ) : (
            <span className="profile-value">{profile.phone_number}</span>
          )}
        </div>
        <div className="profile-field">
          <label className="profile-label">Addresses:</label>
          {!isEditing ? (
            <ul className="address-list">
              {profile.addresses.map((address, index) => (
                <li key={index} className="address-item">
                  <span className="address-number">{index + 1}.</span>
                  <span>{address.address_line_1}, {address.address_line_2}, {address.city}, {address.state}, {address.zipcode}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div>
              {editedProfile.addresses.map((address, index) => (
                <div key={index} className="address-item">
                  <div className="address-row">
                    <input
                      type="text"
                      value={address.address_line_1}
                      onChange={(e) =>
                        handleAddressChange(index, 'address_line_1', e.target.value)
                      }
                      className="address-input"
                      placeholder="Address Line 1"
                    />
                    <input
                      type="text"
                      value={address.address_line_2}
                      onChange={(e) =>
                        handleAddressChange(index, 'address_line_2', e.target.value)
                      }
                      className="address-input"
                      placeholder="Address Line 2"
                    />
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) =>
                        handleAddressChange(index, 'city', e.target.value)
                      }
                      className="address-input"
                      placeholder="City"
                    />
                    <input
                      type="text"
                      value={address.state}
                      onChange={(e) =>
                        handleAddressChange(index, 'state', e.target.value)
                      }
                      className="address-input"
                      placeholder="State"
                    />
                    <input
                      type="text"
                      value={address.zipcode}
                      onChange={(e) =>
                        handleAddressChange(index, 'zipcode', e.target.value)
                      }
                      className="address-input"
                      placeholder="Zipcode"
                    />
                  </div>
                  {editedProfile.addresses.length > 1 && (
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteAddress(index)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
              <button className="add-btn" onClick={handleAddAddress}>
                Add Address
              </button>
            </div>
          )}
        </div>
        {isEditing && (
          <div className="profile-actions">
            <button className="save-btn" onClick={handleSave}>
              Save
            </button>
            <button className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;