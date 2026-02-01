import React from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="attractive-hero">
  <div className="container">
    {/* Main Title Section */}
    <div className="hero-main">
      <h1 className="main-title">
        <span className="title-gradient">DASTAK</span>
        <span className="title-urdu">  دستک</span>
      </h1>
      <h2 className="main-subtitle">Pakistan's #1 Service Marketplace</h2>
      <p className="main-tagline">
        Connecting <span className="highlight">50,000+</span> verified service professionals with customers across Pakistan
      </p>
      
      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-number">25,000+</div>
          <div className="stat-label">Services Completed</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">4.8★</div>
          <div className="stat-label">Average Rating</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">₹2.5Cr+</div>
          <div className="stat-label">Earned by Providers</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">98%</div>
          <div className="stat-label">Satisfaction Rate</div>
        </div>
      </div>
      
      {/* CTA Buttons */}
      <div className="hero-cta">
        <button className="cta-btn cta-primary">
          <span className="btn-icon">📝</span>
          <span className="btn-text">
            <strong>Post a Request</strong>
            <small>Get multiple quotes in minutes</small>
          </span>
        </button>
        
        <button className="cta-btn cta-secondary">
          <span className="btn-icon">💼</span>
          <span className="btn-text">
            <strong>Join as Provider</strong>
            <small>Earn 15,000 PKR- 50,000 PKR/month</small>
          </span>
        </button>
      </div>
    </div>
    
    {/* Active Orders Section */}
    <div className="active-orders-section">
      <div className="section-header">
        <h3>Active Service Requests Near You</h3>
        <a href="#" className="view-all">View All →</a>
      </div>
      
      <div className="orders-grid">
        <div className="order-card">
          <div className="order-header">
            <span className="order-badge urgent">URGENT</span>
            <span className="order-time">30 min ago</span>
          </div>
          <h4 className="order-title"> Pipe Leak Repair</h4>
          <p className="order-location">📍 Gulshan-e-Iqbal, Karachi</p>
          <div className="order-footer">
            <span className="order-budget">Budget: 1,500 PKR- 2,500 PKR</span>
            <span className="order-Orders">5 Orders</span>
          </div>
        </div>
        
        <div className="order-card">
          <div className="order-header">
            <span className="order-badge new">NEW</span>
            <span className="order-time">1 hour ago</span>
          </div>
          <h4 className="order-title"> Home Painting</h4>
          <p className="order-location">📍 DHA Phase 5, Lahore</p>
          <div className="order-footer">
            <span className="order-budget">Budget: 25,000 PKR- 35,000 PKR</span>
            <span className="order-Orders">8 Orders</span>
          </div>
        </div>
        
        <div className="order-card">
          <div className="order-header">
            <span className="order-badge trending">TRENDING</span>
            <span className="order-time">2 hours ago</span>
          </div>
          <h4 className="order-title"> Electrical Wiring</h4>
          <p className="order-location">📍 F-10, Islamabad</p>
          <div className="order-footer">
            <span className="order-budget">Budget: 3,000 PKR- 5,000 PKR</span>
            <span className="order-Orders">12 Orders</span>
          </div>
        </div>
      </div>
    </div>
    
    {/* Customer Reviews Section */}
    <div className="reviews-section">
      <div className="section-header">
        <h3>⭐ What Our Customers Say</h3>
        <div className="average-rating">
          <span className="stars">★★★★★</span>
          <span className="rating-text">4.8/5 from 2,500+ reviews</span>
        </div>
      </div>
      
      <div className="reviews-grid">
        <div className="review-card">
          <div className="review-header">
            <div className="reviewer">
              <div className="avatar">AR</div>
              <div className="reviewer-info">
                <h4>Ahmed Raza</h4>
                <p>Gulshan, Karachi</p>
              </div>
            </div>
            <div className="rating">★★★★★</div>
          </div>
          <p className="review-text">
            "Found a plumber within 30 minutes! Fixed my leaking pipe for ₹1,800. Amazing service!"
          </p>
          <div className="review-service">
            <span className="service-tag">Plumbing</span>
            <span className="transaction"> Payment: 1,800 PKR</span>
          </div>
        </div>
        
        <div className="review-card">
          <div className="review-header">
            <div className="reviewer">
              <div className="avatar">SK</div>
              <div className="reviewer-info">
                <h4>Sara Khan</h4>
                <p>DHA, Lahore</p>
              </div>
            </div>
            <div className="rating">★★★★★</div>
          </div>
          <p className="review-text">
            "Best platform for home services! Got my AC repaired in 2 hours. Professional & affordable."
          </p>
          <div className="review-service">
            <span className="service-tag">AC Repair</span>
            <span className="transaction"> Payment: 3,500 PKR</span>
          </div>
        </div>
        
        <div className="review-card">
          <div className="review-header">
            <div className="reviewer">
              <div className="avatar">RJ</div>
              <div className="reviewer-info">
                <h4>Raza Javed</h4>
                <p>Clifton, Karachi</p>
              </div>
            </div>
            <div className="rating">★★★★☆</div>
          </div>
          <p className="review-text">
            "Car service at my doorstep! Saved me 3 hours of garage time. Will use again!"
          </p>
          <div className="review-service">
            <span className="service-tag">Car Service</span>
            <span className="transaction"> Payment: 2,200 PKR</span>
          </div>
        </div>
      </div>
    </div>
    
    {/* Success Stories */}
    <div className="success-stories">
      <h3> Success Stories</h3>
      <div className="stories-grid">
        <div className="story-card">
          <div className="story-icon">👷‍♂️</div>
          <h4>Ali Hassan - Plumber</h4>
          <p>Earned <strong>68,500 PKR</strong> this month</p>
          <p className="story-stats">24 jobs • 4.8 rating</p>
        </div>
        
        <div className="story-card">
          <div className="story-icon">👩‍🎨</div>
          <h4>Sana Ahmed - Painter</h4>
          <p>Earned <strong>42,000 PKR</strong> this month</p>
          <p className="story-stats">18 jobs • 4.9 rating</p>
        </div>
        
        <div className="story-card">
          <div className="story-icon">👨‍🔧</div>
          <h4>Kamran Siddiqui - Electrician</h4>
          <p>Earned <strong>55,000 PKR</strong> this month</p>
          <p className="story-stats">22 jobs • 4.7 rating</p>
        </div>
      </div>
    </div>
  </div>
</div>
  );
};

export default Hero;