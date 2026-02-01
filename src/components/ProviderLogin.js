import React, { useState } from 'react';
import { FaPhone, FaLock, FaSignInAlt } from 'react-icons/fa';

const ProviderLogin = () => {
  const [loginData, setLoginData] = useState({
    phone: '',
    password: ''
  });

  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', loginData);
    alert('Login successful! Redirecting to provider dashboard...');
    // Redirect logic here
  };

  return (
    <div className="provider-login">
      <div className="login-header">
        <h2>Welcome Back!</h2>
        <p>Sign in to your provider account</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label><FaPhone /> Phone Number</label>
          <input
            type="tel"
            name="phone"
            placeholder="03XX-XXXXXXX"
            value={loginData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label><FaLock /> Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={loginData.password}
            onChange={handleChange}
            required
            minLength="6"
          />
          <div className="form-options">
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <a href="#forgot-password" className="forgot-link">
              Forgot Password?
            </a>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-large">
          <FaSignInAlt /> Sign In to Dashboard
        </button>
      </form>

      <div className="login-help">
        <p>Don't have a provider account? Contact us to register:</p>
        <div className="contact-info">
          <p>📞 021-XXXXXXX</p>
          <p>📱 +92 300 XXXXXXX</p>
          <p>✉️ providers@dastak.pk</p>
        </div>
      </div>
    </div>
  );
};

export default ProviderLogin;