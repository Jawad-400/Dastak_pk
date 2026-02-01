import React, { useState } from 'react';
import { FaUser, FaPhone, FaLock, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import CITIES from '../data/pakistanCities';

const cities = CITIES;

const CustomerAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    name: '',
    email: '',
    city: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      alert('Customer login successful!');
    } else {
      alert('Customer account created successfully!');
    }
  };

  return (
    <section className="customer-auth">
      <div className="container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon customer">
              <FaUser />
            </div>
            <h1>Customer Portal</h1>
            <p>Sign in or create account to post service requests</p>
          </div>

          <div className="auth-tabs">
            <button 
              className={`auth-tab ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              Customer Sign In
            </button>
            <button 
              className={`auth-tab ${!isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              Create Account
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label><FaPhone /> Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="03XX-XXXXXXX"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label><FaLock /> Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label><FaUser /> Full Name</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label><FaEnvelope /> Email Address</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label><FaMapMarkerAlt /> City</label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select your city</option>
                    {cities.map((c) => (
                      <option key={c} value={c.toLowerCase()}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-terms">
                  <input type="checkbox" id="terms" required />
                  <label htmlFor="terms">
                    I agree to Terms of Service & Privacy Policy
                  </label>
                </div>
              </>
            )}

            {isLogin && (
              <div className="form-options">
                <label>
                  <input type="checkbox" /> Remember me
                </label>
                <a href="#forgot-password">Forgot Password?</a>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-large btn-full">
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="auth-switch">
            {isLogin ? (
              <p>
                New to DASTAK? 
                <button onClick={() => setIsLogin(false)}>Create account</button>
              </p>
            ) : (
              <p>
                Already have an account? 
                <button onClick={() => setIsLogin(true)}>Sign in here</button>
              </p>
            )}
          </div>

          <div className="customer-benefits">
            <h4>Benefits of Creating Account:</h4>
            <ul>
              <li>✅ Post unlimited service requests</li>
              <li>✅ Track your requests in real-time</li>
              <li>✅ Save favorite service providers</li>
              <li>✅ Get exclusive offers</li>
              <li>✅ Rate and review providers</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerAuth;