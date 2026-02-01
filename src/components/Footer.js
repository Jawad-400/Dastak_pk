import React from 'react';
import { FaFacebook, FaWhatsapp, FaPhone, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer>
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>DASTAK</h3>
            <p>Service Marketplace for Pakistan</p>
          </div>
          <div className="footer-section">
            <h3>Services</h3>
            <ul className="footer-links">
              <li><a href="#plumbing">Plumbing</a></li>
              <li><a href="#painting">Painting</a></li>
              <li><a href="#car-service">Car Service</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Contact</h3>
            <ul className="footer-links">
              <li><FaPhone /> 021-XXXXXXX</li>
              <li><FaWhatsapp /> +92 329 5483781</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} DASTAK. All rights reserved.</p>
          <p>Privacy Policy · Terms of Use</p>
        </div>
      </div>
    </footer>
  );
};


export default Footer;