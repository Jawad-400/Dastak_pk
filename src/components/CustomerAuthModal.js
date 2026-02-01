import React, { useState } from 'react';
import { FaTimes, FaUser, FaLock, FaPhone } from 'react-icons/fa';

const CustomerAuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      alert('Login successful!');
    } else {
      alert('Account created successfully!');
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <FaTimes />
        </button>
        
        <div className="modal-header">
          <h2>{isLogin ? 'Customer Sign In' : 'Create Account'}</h2>
          <p>{isLogin ? 'Sign in to your account' : 'Join DASTAK today'}</p>
        </div>

        <div className="auth-tabs">
          <button 
            className={`tab-btn ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Sign In
          </button>
          <button 
            className={`tab-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label><FaUser /> Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label><FaPhone /> Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="03XX-XXXXXXX"
              required
            />
          </div>

          <div className="form-group">
            <label><FaLock /> Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {isLogin && (
            <div className="form-options">
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <a href="#forgot" className="forgot-link">Forgot Password?</a>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-large">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          {isLogin ? (
            <p>Don't have an account? <button onClick={() => setIsLogin(false)}>Sign up here</button></p>
          ) : (
            <p>Already have an account? <button onClick={() => setIsLogin(true)}>Sign in here</button></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerAuthModal;