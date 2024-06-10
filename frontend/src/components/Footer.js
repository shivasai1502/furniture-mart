import React from 'react';
import '../css/Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-column">
                    <h3>Shop Address</h3>
                    <p>123 Toy Street</p>
                    <p>Cityville, Toyland</p>
                    <p>Country</p>
                </div>
                <div className="footer-column">
                    <h3>Contact Details</h3>
                    <p>Email: info@example.com</p>
                    <p>Phone: +123-456-7890</p>
                </div>
                <div className="footer-column">
                    <h3>Terms and Conditions</h3>
                    <p>Terms of Service</p>
                    <p>Privacy Policy</p>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2024 Toy Land. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
