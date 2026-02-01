import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles.css';

const PlaceorderModal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const job = location.state?.job || {};
  
  const [orderAmount, setorderAmount] = useState('');
  const [message, setMessage] = useState('');
  const [availableTime, setAvailableTime] = useState('today');

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    
    // Save order to localStorage or send to backend
    const newOrder = {
      jobId: job.id,
      jobTitle: job.title,
      customer: job.customer,
      orderAmount,
      message,
      availableTime,
      timestamp: new Date().toISOString()
    };

    // Save to localStorage (temporary)
    const existingOrders = JSON.parse(localStorage.getItem('myOrders') || '[]');
    existingOrders.push(newOrder);
    localStorage.setItem('myOrders', JSON.stringify(existingOrders));

    // Show success message
    alert(`✅ Order placed successfully for PKR ${orderAmount}!`);
    
    // Redirect to My Orders page
    navigate('/provider/my-orders');
  };

  const calculateSuggestedOrder = () => {
    if (!job.budget) return '';
    const [min, max] = job.budget.replace('₹', '').replace(',', '').split('-').map(num => parseInt(num.trim()));
    const suggested = Math.floor((min + max) / 2);
    return suggested;
  };

  return (
    <div className="place-order-modal">
      <div className="container">
        <div className="order-modal-content">
          {/* Header */}
          <div className="modal-header">
            <h2>Place Your Order</h2>
            <button className="btn-close" onClick={() => navigate(-1)}>×</button>
          </div>

          {/* Job Info */}
          <div className="job-info-card">
            <h3>{job.service} - {job.title}</h3>
            <div className="job-details">
              <p><strong>Customer:</strong> {job.customer}</p>
              <p><strong>Location:</strong> {job.location}</p>
              <p><strong>Customer Budget:</strong> {job.budget}</p>
              <p><strong>Posted:</strong> {job.postedTime}</p>
            </div>
          </div>

          {/* order Form */}
          <form onSubmit={handleSubmitOrder} className="order-form">
            <div className="form-group">
              <label>Your Order Amount (PKR) *</label>
              <div className="order-amount-input">
                <span className="currency">PKR</span>
                <input
                  type="number"
                  value={orderAmount}
                  onChange={(e) => setorderAmount(e.target.value)}
                  placeholder="Enter your order amount"
                  required
                  min="1"
                />
              </div>
              <p className="suggestion">
                Suggested: PKR {calculateSuggestedOrder()} (within customer's budget)
              </p>
            </div>

            <div className="form-group">
              <label>When can you do this job? *</label>
              <select 
                value={availableTime}
                onChange={(e) => setAvailableTime(e.target.value)}
                required
              >
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="weekend">This Weekend</option>
                <option value="next-week">Next Week</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>

            <div className="form-group">
              <label>Message to Customer (Optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Example: I have 5 years experience in plumbing. I can fix this in 1 hour."
                rows="3"
              />
            </div>

            {/* Order Summary */}
            <div className="order-summary">
              <h4>Order Summary:</h4>
              <div className="summary-row">
                <span>Your Order:</span>
                <strong>PKR {orderAmount || '0'}</strong>
              </div>
              <div className="summary-row">
                <span>Service Fee (5%):</span>
                <span>PKR {orderAmount ? Math.floor(orderAmount * 0.05) : '0'}</span>
              </div>
              <div className="summary-row total">
                <span>You'll Earn:</span>
                <strong>PKR {orderAmount ? Math.floor(orderAmount * 0.95) : '0'}</strong>
              </div>
            </div>

            {/* Terms */}
            <div className="terms">
              <label>
                <input type="checkbox" required />
                I agree to DASTAK's terms and service fee
              </label>
            </div>

            {/* Action Buttons */}
            <div className="order-actions">
              <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>
                Cancel
              </button>
              <button type="submit" className="btn-submit-order">
                Submit Order
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PlaceorderModal;