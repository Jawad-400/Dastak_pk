import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaWrench, FaStar, FaMapMarkerAlt, FaClock, 
  FaBolt, FaCheckCircle, FaArrowRight, FaSearch,
  FaUsers, FaShieldAlt, FaClock as FaClockRegular,
  FaRupeeSign, FaTrophy, FaHeart, FaShare
} from 'react-icons/fa';
import { socket } from '../Services/socket';

const Hero = () => {
  const navigate = useNavigate();
  const [liveRequests, setLiveRequests] = useState([]);
  const [activeCount, setActiveCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [showStats, setShowStats] = useState(false);

  // Real-time live requests counter
  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setActiveCount(prev => prev + Math.floor(Math.random() * 3));
    }, 30000);

    // Initial active requests count
    setActiveCount(2347);

    // Listen for new requests
    const handleNewRequest = (data) => {
      setActiveCount(prev => prev + 1);
      setLiveRequests(prev => [{
        id: data.id || Date.now(),
        service: data.data?.service_type || 'New Service',
        location: data.data?.location || 'Karachi',
        budget: data.data?.budget || 'Negotiable',
        time: 'Just now',
        urgent: true
      }, ...prev].slice(0, 3));
    };

    socket.on('new_request', handleNewRequest);

    // Animate stats on load
    setTimeout(() => setShowStats(true), 300);

    return () => {
      clearInterval(interval);
      socket.off('new_request', handleNewRequest);
    };
  }, []);

  // Pakistan cities
  const cities = [
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 
    'Faisalabad', 'Multan', 'Peshawar', 'Quetta'
  ];

  // Featured services
  const featuredServices = [
    { id: 1, name: 'Plumbing', icon: '🔧', count: 1234, color: '#3498db' },
    { id: 2, name: 'Electrical', icon: '⚡', count: 987, color: '#f39c12' },
    { id: 3, name: 'AC Repair', icon: '❄️', count: 756, color: '#00bcd4' },
    { id: 4, name: 'Cleaning', icon: '🧹', count: 892, color: '#2ecc71' },
    { id: 5, name: 'Painting', icon: '🎨', count: 543, color: '#e74c3c' },
    { id: 6, name: 'Carpentry', icon: '🔨', count: 421, color: '#9b59b6' },
  ];

  // Real-time active requests
  const activeRequests = [
    {
      id: 1,
      service: '🚰 Plumbing',
      location: 'Gulshan, Karachi',
      budget: '1,500 - 2,500 PKR',
      time: '2 min ago',
      urgent: true,
      orders: 5
    },
    {
      id: 2,
      service: '⚡ Electrical',
      location: 'DHA, Lahore',
      budget: '3,000 - 5,000 PKR',
      time: '5 min ago',
      urgent: false,
      orders: 8
    },
    {
      id: 3,
      service: '❄️ AC Repair',
      location: 'F-10, Islamabad',
      budget: '2,500 - 4,000 PKR',
      time: '10 min ago',
      urgent: false,
      orders: 12
    }
  ];

  // Stats counter animation
  const stats = [
    { id: 1, value: 25000, label: 'Services Completed', prefix: '', suffix: '+', icon: <FaCheckCircle />, color: '#2ecc71' },
    { id: 2, value: 4.9, label: 'Average Rating', prefix: '', suffix: '★', icon: <FaStar />, color: '#f39c12' },
    { id: 3, value: 2.5, label: 'Earned by Providers', prefix: 'Cr', suffix: ' PKR+', icon: <FaRupeeSign />, color: '#3498db' },
    { id: 4, value: 97.8, label: 'Satisfaction Rate', prefix: '', suffix: '%', icon: <FaHeart />, color: '#e74c3c' }
  ];

  // Animated counter component
  const Counter = ({ value, suffix, prefix }) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
      if (showStats) {
        let start = 0;
        const end = value;
        const duration = 2000;
        const increment = end / (duration / 16);
        
        const timer = setInterval(() => {
          start += increment;
          if (start > end) {
            setCount(end);
            clearInterval(timer);
          } else {
            setCount(Math.floor(start));
          }
        }, 16);
        
        return () => clearInterval(timer);
      }
    }, [showStats, value]);
    
    return <span>{prefix}{count}{suffix}</span>;
  };

  return (
    <div className="hero-wrapper">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-particles"></div>
        <div className="container">
          
          {/* Live Activity Badge */}
          <div className="live-badge">
            <span className="pulse-dot"></span>
            <span className="live-text">{activeCount.toLocaleString()} active requests right now</span>
          </div>

          {/* Main Title */}
          <div className="hero-main">
            <h1 className="hero-title">
              <span className="title-dastak">DASTAK</span>
              <span className="title-urdu">دستک</span>
              <span className="title-registered">®</span>
            </h1>
            
            <h2 className="hero-subtitle">
              <span className="subtitle-highlight">Pakistan's #1</span> Service Marketplace
            </h2>
            
            <p className="hero-description">
              Connect with <strong>50,000+ verified professionals</strong> for all your home service needs.
              <span className="trust-badge">
                <FaShieldAlt /> 100% Verified
              </span>
            </p>
          </div>

          {/* Search Bar */}
          <div className="search-container">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="What service do you need? (e.g., Plumbing, Electrical, AC Repair)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select 
              className="city-select"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <button className="search-btn">
              <FaSearch /> Find Services
            </button>
          </div>

          {/* Featured Services */}
          <div className="featured-services">
            <h3>Popular Services</h3>
            <div className="services-grid">
              {featuredServices.map(service => (
                <div 
                  key={service.id} 
                  className="service-card"
                  style={{ borderTop: `3px solid ${service.color}` }}
                  onClick={() => navigate(`/services?category=${service.name.toLowerCase()}`)}
                >
                  <span className="service-icon">{service.icon}</span>
                  <div className="service-info">
                    <h4>{service.name}</h4>
                    <p>{service.count.toLocaleString()}+ jobs</p>
                  </div>
                  <FaArrowRight className="service-arrow" />
                </div>
              ))}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="stats-bar">
            {stats.map((stat, index) => (
              <div key={stat.id} className={`stat-item fade-in delay-${index}`}>
                <div className="stat-icon" style={{ color: stat.color }}>
                  {stat.icon}
                </div>
                <div className="stat-content">
                  <div className="stat-number">
                    <Counter value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                  </div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hero-cta">
            <button 
              className="cta-primary"
              onClick={() => navigate('/post-request')}
            >
              <span className="btn-icon">📝</span>
              <span className="btn-content">
                <strong>Post a Request</strong>
                <small>Get quotes in minutes</small>
              </span>
            </button>
            
            <button 
              className="cta-secondary"
              onClick={() => navigate('/provider-portal')}
            >
              <span className="btn-icon">💼</span>
              <span className="btn-content">
                <strong>Join as Provider</strong>
                <small>Earn up to 100K/month</small>
              </span>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="trust-indicators">
            <div className="trust-item">
              <FaCheckCircle className="trust-icon" />
              <span>Verified Professionals</span>
            </div>
            <div className="trust-item">
              <FaShieldAlt className="trust-icon" />
              <span>Secure Payments</span>
            </div>
            <div className="trust-item">
              <FaClockRegular className="trust-icon" />
              <span>24/7 Support</span>
            </div>
            <div className="trust-item">
              <FaUsers className="trust-icon" />
              <span>50K+ Happy Customers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Requests Section */}
      <div className="active-requests-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2>
                <span className="pulse-dot-large"></span>
                Live Service Requests
              </h2>
              <p>Real-time updates from customers near you</p>
            </div>
            <button className="view-all-btn" onClick={() => navigate('/services')}>
              View All <FaArrowRight />
            </button>
          </div>

          <div className="requests-grid">
            {activeRequests.map((request, index) => (
              <div key={request.id} className={`request-card fade-in-up delay-${index}`}>
                {request.urgent && (
                  <span className="urgent-badge">
                    <FaBolt /> URGENT
                  </span>
                )}
                <div className="request-header">
                  <h3>{request.service}</h3>
                  <span className="request-time">
                    <FaClock /> {request.time}
                  </span>
                </div>
                <p className="request-location">
                  <FaMapMarkerAlt /> {request.location}
                </p>
                <div className="request-footer">
                  <span className="request-budget">
                    <FaRupeeSign /> {request.budget}
                  </span>
                  <span className="request-orders">
                    {request.orders} Orders
                  </span>
                </div>
                <button className="accept-btn" onClick={() => navigate('/post-request')}>
                  View Details
                </button>
              </div>
            ))}

            {/* Live Counter Card */}
            <div className="live-counter-card">
              <div className="counter-content">
                <div className="counter-icon">
                  <FaUsers />
                </div>
                <div className="counter-text">
                  <span className="counter-number">{activeCount.toLocaleString()}+</span>
                  <span className="counter-label">Active Requests</span>
                </div>
                <div className="counter-footer">
                  <span className="live-indicator">
                    <span className="pulse-dot"></span>
                    Updating Live
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2>
                <FaStar className="star-icon" /> 
                What Our Customers Say
              </h2>
              <p>Trusted by thousands across Pakistan</p>
            </div>
            <div className="rating-summary">
              <span className="rating-number">4.8</span>
              <div className="rating-stars">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="star-filled" />
                ))}
              </div>
              <span className="rating-count">2,500+ reviews</span>
            </div>
          </div>

          <div className="reviews-grid">
            <div className="review-card featured">
              <div className="review-quote">"</div>
              <div className="reviewer-info">
                <div className="reviewer-avatar">AR</div>
                <div className="reviewer-details">
                  <h4>Ahmed Raza</h4>
                  <p>Gulshan, Karachi</p>
                </div>
                <div className="review-rating">★★★★★</div>
              </div>
              <p className="review-text">
                "Found a plumber within 30 minutes! Fixed my leaking pipe for ₹1,800. Amazing service! Highly recommended."
              </p>
              <div className="review-meta">
                <span className="service-badge">Plumbing</span>
                <span className="payment-amount">1,800 PKR</span>
              </div>
            </div>

            <div className="review-card">
              <div className="reviewer-info">
                <div className="reviewer-avatar">SK</div>
                <div className="reviewer-details">
                  <h4>Sara Khan</h4>
                  <p>DHA, Lahore</p>
                </div>
                <div className="review-rating">★★★★★</div>
              </div>
              <p className="review-text">
                "Best platform for home services! Got my AC repaired in 2 hours. Professional & affordable."
              </p>
              <div className="review-meta">
                <span className="service-badge">AC Repair</span>
                <span className="payment-amount">3,500 PKR</span>
              </div>
            </div>

            <div className="review-card">
              <div className="reviewer-info">
                <div className="reviewer-avatar">RJ</div>
                <div className="reviewer-details">
                  <h4>Raza Javed</h4>
                  <p>Clifton, Karachi</p>
                </div>
                <div className="review-rating">★★★★☆</div>
              </div>
              <p className="review-text">
                "Car service at my doorstep! Saved me 3 hours of garage time. Will definitely use again!"
              </p>
              <div className="review-meta">
                <span className="service-badge">Car Service</span>
                <span className="payment-amount">2,200 PKR</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Stories */}
      <div className="success-stories">
        <div className="container">
          <div className="section-header">
            <div>
              <h2>
                <FaTrophy className="trophy-icon" />
                Success Stories
              </h2>
              <p>Real providers, real earnings</p>
            </div>
          </div>

          <div className="stories-grid">
            <div className="story-card highlight">
              <div className="story-rank">🏆 Top Earner</div>
              <div className="story-avatar">👷‍♂️</div>
              <h4>Ali Hassan</h4>
              <p className="story-service">Plumber</p>
              <div className="story-earnings">
                <span className="earnings-label">This Month</span>
                <span className="earnings-amount">68,500 PKR</span>
              </div>
              <div className="story-stats">
                <span>⭐ 4.8</span>
                <span>🔧 24 jobs</span>
              </div>
            </div>

            <div className="story-card">
              <div className="story-avatar">👩‍🎨</div>
              <h4>Sana Ahmed</h4>
              <p className="story-service">Painter</p>
              <div className="story-earnings">
                <span className="earnings-label">This Month</span>
                <span className="earnings-amount">42,000 PKR</span>
              </div>
              <div className="story-stats">
                <span>⭐ 4.9</span>
                <span>🔧 18 jobs</span>
              </div>
            </div>

            <div className="story-card">
              <div className="story-avatar">👨‍🔧</div>
              <h4>Kamran Siddiqui</h4>
              <p className="story-service">Electrician</p>
              <div className="story-earnings">
                <span className="earnings-label">This Month</span>
                <span className="earnings-amount">55,000 PKR</span>
              </div>
              <div className="story-stats">
                <span>⭐ 4.7</span>
                <span>🔧 22 jobs</span>
              </div>
            </div>
          </div>

          <div className="cta-banner">
            <div className="banner-content">
              <h3>Ready to start earning?</h3>
              <p>Join 10,000+ service professionals on DASTAK</p>
            </div>
            <button 
              className="cta-banner-btn"
              onClick={() => navigate('/provider-portal')}
            >
              Become a Provider <FaArrowRight />
            </button>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .hero-wrapper {
          overflow-x: hidden;
          background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
        }

        .hero-section {
          position: relative;
          padding: 60px 0 40px;
          background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
          border-bottom: 1px solid #eef2f6;
        }

        .hero-particles {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: radial-gradient(#3498db10 1px, transparent 1px);
          background-size: 30px 30px;
          opacity: 0.4;
        }

        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          position: relative;
          z-index: 2;
        }

        /* Live Badge */
        .live-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 20px;
          background: linear-gradient(145deg, #2c3e5010, #2c3e5005);
          border-radius: 40px;
          margin-bottom: 30px;
          border: 1px solid #2c3e5020;
        }

        .pulse-dot {
          width: 12px;
          height: 12px;
          background: #e74c3c;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .pulse-dot-large {
          width: 16px;
          height: 16px;
          background: #e74c3c;
          border-radius: 50%;
          display: inline-block;
          margin-right: 10px;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }

        .live-text {
          color: #2c3e50;
          font-weight: 600;
          font-size: 15px;
        }

        /* Title */
        .hero-title {
          margin: 0 0 15px;
          font-size: 56px;
          font-weight: 800;
          line-height: 1.1;
        }

        .title-dastak {
          color: #2c3e50;
          letter-spacing: 2px;
        }

        .title-urdu {
          color: #7f8c8d;
          font-size: 42px;
          font-family: 'Noto Nastaliq Urdu', serif;
          margin-left: 8px;
        }

        .title-registered {
          color: #95a5a6;
          font-size: 20px;
          vertical-align: super;
          margin-left: 4px;
        }

        .hero-subtitle {
          font-size: 32px;
          font-weight: 600;
          color: #34495e;
          margin: 0 0 20px;
        }

        .subtitle-highlight {
          background: linear-gradient(145deg, #3498db, #2980b9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          font-size: 18px;
          color: #5d6d7e;
          margin: 0 0 25px;
          display: flex;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
        }

        .trust-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px;
          background: #2ecc7110;
          color: #27ae60;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 600;
          border: 1px solid #2ecc7130;
        }

        /* Search Bar */
        .search-container {
          display: flex;
          gap: 15px;
          margin-bottom: 50px;
          flex-wrap: wrap;
        }

        .search-box {
          flex: 1;
          min-width: 300px;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: #95a5a6;
          font-size: 18px;
        }

        .search-box input {
          width: 100%;
          padding: 18px 18px 18px 52px;
          border: 2px solid #eef2f6;
          border-radius: 16px;
          font-size: 16px;
          transition: all 0.3s;
          background: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }

        .search-box input:focus {
          border-color: #3498db;
          outline: none;
          box-shadow: 0 8px 20px rgba(52,152,219,0.1);
        }

        .city-select {
          padding: 18px 30px;
          border: 2px solid #eef2f6;
          border-radius: 16px;
          font-size: 16px;
          background: white;
          color: #2c3e50;
          cursor: pointer;
          transition: all 0.3s;
          min-width: 180px;
        }

        .city-select:focus {
          border-color: #3498db;
          outline: none;
        }

        .search-btn {
          padding: 18px 36px;
          background: linear-gradient(145deg, #3498db, #2980b9);
          color: white;
          border: none;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s;
          box-shadow: 0 8px 20px rgba(52,152,219,0.3);
        }

        .search-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(52,152,219,0.4);
        }

        /* Featured Services */
        .featured-services {
          margin-bottom: 50px;
        }

        .featured-services h3 {
          font-size: 20px;
          color: #2c3e50;
          margin-bottom: 20px;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 16px;
        }

        .service-card {
          background: white;
          padding: 20px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 15px;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
          border: 1px solid #eef2f6;
        }

        .service-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.06);
        }

        .service-icon {
          font-size: 32px;
        }

        .service-info h4 {
          margin: 0 0 4px;
          font-size: 16px;
          color: #2c3e50;
        }

        .service-info p {
          margin: 0;
          font-size: 13px;
          color: #7f8c8d;
        }

        .service-arrow {
          margin-left: auto;
          color: #bdc3c7;
          font-size: 14px;
          opacity: 0;
          transition: all 0.3s;
        }

        .service-card:hover .service-arrow {
          opacity: 1;
          transform: translateX(4px);
        }

        /* Stats Bar */
        .stats-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 40px;
          padding: 30px;
          background: white;
          border-radius: 24px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.04);
          border: 1px solid #eef2f6;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stat-icon {
          width: 52px;
          height: 52px;
          background: #f8fafc;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .stat-content {
          flex: 1;
        }

        .stat-number {
          font-size: 28px;
          font-weight: 700;
          color: #2c3e50;
          line-height: 1.2;
        }

        .stat-label {
          font-size: 14px;
          color: #7f8c8d;
        }

        /* CTA Buttons */
        .hero-cta {
          display: flex;
          gap: 20px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }

        .cta-primary, .cta-secondary {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 32px;
          border: none;
          border-radius: 16px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s;
          flex: 1;
          min-width: 240px;
        }

        .cta-primary {
          background: linear-gradient(145deg, #2c3e50, #1e2b38);
          color: white;
          box-shadow: 0 8px 20px rgba(44,62,80,0.2);
        }

        .cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(44,62,80,0.3);
        }

        .cta-secondary {
          background: white;
          color: #2c3e50;
          border: 2px solid #eef2f6;
        }

        .cta-secondary:hover {
          border-color: #3498db;
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.04);
        }

        .btn-icon {
          font-size: 28px;
        }

        .btn-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .btn-content strong {
          font-size: 18px;
          margin-bottom: 4px;
        }

        .btn-content small {
          font-size: 13px;
          opacity: 0.9;
        }

        /* Trust Indicators */
        .trust-indicators {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 32px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 60px;
          flex-wrap: wrap;
        }

        .trust-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #2c3e50;
          font-size: 14px;
          font-weight: 500;
        }

        .trust-icon {
          color: #3498db;
          font-size: 18px;
        }

        /* Active Requests Section */
        .active-requests-section {
          padding: 60px 0;
          background: #f8fafc;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .section-header h2 {
          margin: 0 0 8px;
          font-size: 28px;
          color: #2c3e50;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .section-header p {
          margin: 0;
          color: #7f8c8d;
          font-size: 16px;
        }

        .view-all-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: white;
          color: #3498db;
          border: 2px solid #eef2f6;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .view-all-btn:hover {
          border-color: #3498db;
          background: #f8fafc;
        }

        .requests-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .request-card {
          background: white;
          padding: 24px;
          border-radius: 20px;
          position: relative;
          transition: all 0.3s;
          border: 1px solid #eef2f6;
        }

        .request-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.06);
        }

        .urgent-badge {
          position: absolute;
          top: -10px;
          right: 20px;
          background: linear-gradient(145deg, #e74c3c, #c0392b);
          color: white;
          padding: 6px 16px;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .request-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }

        .request-header h3 {
          margin: 0;
          font-size: 18px;
          color: #2c3e50;
        }

        .request-time {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #95a5a6;
          font-size: 13px;
        }

        .request-location {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #5d6d7e;
          font-size: 14px;
          margin-bottom: 20px;
        }

        .request-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-top: 15px;
          border-top: 1px solid #eef2f6;
        }

        .request-budget {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #27ae60;
          font-weight: 600;
        }

        .request-orders {
          color: #7f8c8d;
          font-size: 13px;
        }

        .accept-btn {
          width: 100%;
          padding: 12px;
          background: #f8fafc;
          color: #3498db;
          border: 2px solid #eef2f6;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .accept-btn:hover {
          background: #3498db;
          color: white;
          border-color: #3498db;
        }

        .live-counter-card {
          background: linear-gradient(145deg, #2c3e50, #1e2b38);
          border-radius: 20px;
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .counter-content {
          text-align: center;
          color: white;
        }

        .counter-icon {
          font-size: 48px;
          margin-bottom: 15px;
          color: #3498db;
        }

        .counter-number {
          display: block;
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .counter-label {
          display: block;
          font-size: 16px;
          opacity: 0.9;
          margin-bottom: 20px;
        }

        .counter-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #3498db;
          font-size: 14px;
          font-weight: 600;
        }

        /* Reviews Section */
        .reviews-section {
          padding: 60px 0;
          background: white;
        }

        .rating-summary {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 12px 24px;
          background: #f8fafc;
          border-radius: 60px;
        }

        .rating-number {
          font-size: 28px;
          font-weight: 700;
          color: #2c3e50;
        }

        .rating-stars {
          display: flex;
          gap: 4px;
        }

        .star-filled {
          color: #f39c12;
          font-size: 18px;
        }

        .rating-count {
          color: #7f8c8d;
          font-size: 14px;
        }

        .reviews-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .review-card {
          background: #f8fafc;
          padding: 24px;
          border-radius: 20px;
          transition: all 0.3s;
          position: relative;
        }

        .review-card.featured {
          background: linear-gradient(145deg, #fef9e7, #fff9e6);
          border: 1px solid #fcf3cf;
        }

        .review-quote {
          position: absolute;
          top: 20px;
          right: 20px;
          font-size: 48px;
          color: #3498db10;
          font-family: serif;
        }

        .reviewer-info {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 15px;
        }

        .reviewer-avatar {
          width: 48px;
          height: 48px;
          background: linear-gradient(145deg, #3498db, #2980b9);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 18px;
        }

        .reviewer-details h4 {
          margin: 0 0 4px;
          font-size: 16px;
          color: #2c3e50;
        }

        .reviewer-details p {
          margin: 0;
          font-size: 13px;
          color: #7f8c8d;
        }

        .review-rating {
          margin-left: auto;
          color: #f39c12;
          font-size: 14px;
        }

        .review-text {
          color: #5d6d7e;
          line-height: 1.6;
          margin-bottom: 15px;
          font-size: 15px;
        }

        .review-meta {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .service-badge {
          padding: 4px 12px;
          background: #eef2f6;
          border-radius: 30px;
          font-size: 12px;
          color: #2c3e50;
        }

        .payment-amount {
          color: #27ae60;
          font-weight: 600;
          font-size: 13px;
        }

        /* Success Stories */
        .success-stories {
          padding: 60px 0;
          background: #f8fafc;
        }

        .stories-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 40px;
        }

        .story-card {
          background: white;
          padding: 30px;
          border-radius: 20px;
          text-align: center;
          transition: all 0.3s;
          border: 1px solid #eef2f6;
          position: relative;
        }

        .story-card.highlight {
          border: 2px solid #3498db;
          background: linear-gradient(145deg, #ffffff, #f8fafc);
        }

        .story-rank {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(145deg, #3498db, #2980b9);
          color: white;
          padding: 6px 20px;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        .story-avatar {
          font-size: 56px;
          margin-bottom: 15px;
        }

        .story-card h4 {
          margin: 0 0 8px;
          font-size: 18px;
          color: #2c3e50;
        }

        .story-service {
          color: #7f8c8d;
          font-size: 14px;
          margin-bottom: 20px;
        }

        .story-earnings {
          background: #f8fafc;
          padding: 15px;
          border-radius: 12px;
          margin-bottom: 15px;
        }

        .earnings-label {
          display: block;
          font-size: 12px;
          color: #7f8c8d;
          margin-bottom: 4px;
        }

        .earnings-amount {
          display: block;
          font-size: 24px;
          font-weight: 700;
          color: #27ae60;
        }

        .story-stats {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          color: #5d6d7e;
          font-size: 14px;
        }

        /* CTA Banner */
        .cta-banner {
          background: linear-gradient(145deg, #2c3e50, #1e2b38);
          border-radius: 20px;
          padding: 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
        }

        .banner-content h3 {
          margin: 0 0 8px;
          font-size: 28px;
          color: white;
        }

        .banner-content p {
          margin: 0;
          font-size: 16px;
          color: #bdc3c7;
        }

        .cta-banner-btn {
          padding: 16px 32px;
          background: white;
          color: #2c3e50;
          border: none;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s;
        }

        .cta-banner-btn:hover {
          transform: translateX(4px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.2);
        }

        /* Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fade-in-up {
          animation: fadeInUp 0.6s ease forwards;
        }

        .delay-0 { animation-delay: 0.1s; }
        .delay-1 { animation-delay: 0.2s; }
        .delay-2 { animation-delay: 0.3s; }
        .delay-3 { animation-delay: 0.4s; }

        /* Responsive */
        @media (max-width: 1024px) {
          .hero-title { font-size: 48px; }
          .title-urdu { font-size: 36px; }
          .stats-bar { grid-template-columns: repeat(2, 1fr); }
          .requests-grid { grid-template-columns: repeat(2, 1fr); }
          .reviews-grid { grid-template-columns: repeat(2, 1fr); }
          .stories-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .hero-title { font-size: 40px; }
          .title-urdu { font-size: 30px; }
          .hero-subtitle { font-size: 24px; }
          .search-container { flex-direction: column; }
          .search-btn { width: 100%; }
          .stats-bar { grid-template-columns: 1fr; }
          .requests-grid { grid-template-columns: 1fr; }
          .reviews-grid { grid-template-columns: 1fr; }
          .stories-grid { grid-template-columns: 1fr; }
          .cta-banner { flex-direction: column; text-align: center; gap: 20px; }
        }
      `}</style>
    </div>
  );
};

export default Hero;