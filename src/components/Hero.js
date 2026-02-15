import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaWrench, FaStar, FaMapMarkerAlt, FaClock, 
  FaBolt, FaCheckCircle, FaArrowRight, FaSearch,
  FaUsers, FaShieldAlt, FaClock as FaClockRegular,
  FaRupeeSign, FaTrophy, FaHeart, FaShare,
  FaTools, FaPaintBrush, FaHammer, FaBroom,
  FaTv, FaSnowflake, FaBug, FaTruck,
  FaSeedling, FaChalkboardTeacher, FaUtensils,
  FaCamera, FaGlassCheers, FaCar, FaCut
} from 'react-icons/fa';
import { socket } from '../Services/socket';
import { SERVICE_TYPES } from '../components/serviceTypes';

const Hero = () => {
  const navigate = useNavigate();
  const [liveRequests, setLiveRequests] = useState([]);
  const [activeCount, setActiveCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [hoveredService, setHoveredService] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);

  // Check login status on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setIsLoggedIn(true);
        setUserType(user.user_type);
        console.log('✅ User logged in:', user.name, 'as', user.user_type);
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
  }, []);

  // Helper function to render icon
  const renderIcon = (Icon, color, size = 24) => {
    return <Icon style={{ color }} size={size} />;
  };

  // Real-time live requests counter
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCount(prev => prev + Math.floor(Math.random() * 3));
    }, 30000);

    setActiveCount(2347);

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

    setTimeout(() => setShowStats(true), 300);

    return () => {
      clearInterval(interval);
      socket.off('new_request', handleNewRequest);
    };
  }, []);

  // Pakistan cities
  const cities = [
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 
    'Faisalabad', 'Multan', 'Peshawar', 'Quetta',
    'Gujranwala', 'Hyderabad', 'Sialkot', 'Bahawalpur'
  ];

  // Handle Find Services button click
  const handleFindServices = () => {
    console.log('🔍 Find Services clicked', { isLoggedIn, userType, searchQuery, selectedCity });
    
    // Build search params
    const searchParams = new URLSearchParams();
    if (searchQuery) searchParams.append('q', searchQuery);
    if (selectedCity) searchParams.append('city', selectedCity);
    
    // If not logged in, redirect to customer login with return URL
    if (!isLoggedIn) {
      console.log('➡️ Not logged in, redirecting to customer login');
      navigate(`/customer-login?returnTo=/services&${searchParams.toString()}`);
      return;
    }
    
    // If logged in as provider, they should use provider dashboard
    if (userType === 'provider') {
      console.log('➡️ Logged in as provider, redirecting to provider dashboard');
      navigate('/provider-dashboard');
      return;
    }
    
    // If logged in as customer, go directly to services
    console.log('➡️ Logged in as customer, going to services page');
    navigate(`/services?${searchParams.toString()}`);
  };

  // Handle service pill click
  const handleServiceClick = (serviceName) => {
    console.log('🔧 Service clicked:', serviceName);
    
    // If not logged in, redirect to customer login with service pre-selected
    if (!isLoggedIn) {
      navigate(`/customer-login?returnTo=/post-request&service=${encodeURIComponent(serviceName)}`);
      return;
    }
    
    // If logged in as provider, redirect to provider dashboard
    if (userType === 'provider') {
      navigate('/provider-dashboard');
      return;
    }
    
    // If logged in as customer, go directly to post request with service pre-filled
    navigate(`/post-request?service=${encodeURIComponent(serviceName)}`);
  };

  // Handle Post Request button click
  const handlePostRequest = () => {
    console.log('📝 Post Request clicked');
    
    if (!isLoggedIn) {
      navigate('/customer-login?returnTo=/post-request');
      return;
    }
    
    if (userType === 'provider') {
      navigate('/provider-dashboard');
      return;
    }
    
    navigate('/post-request');
  };

  // Handle Join as Provider button click
  const handleJoinProvider = () => {
    console.log('💼 Join as Provider clicked');
    
    if (!isLoggedIn) {
      navigate('/provider-portal');
      return;
    }
    
    if (userType === 'provider') {
      navigate('/provider-dashboard');
      return;
    }
    
    // If logged in as customer, they can still view provider portal
    navigate('/provider-portal');
  };

  // Handle View All Services click
  const handleViewAllServices = () => {
    console.log('👁️ View All Services clicked');
    
    if (!isLoggedIn) {
      navigate('/customer-login?returnTo=/services');
      return;
    }
    
    if (userType === 'provider') {
      navigate('/provider-dashboard');
      return;
    }
    
    navigate('/services');
  };

  // Real-time active requests
  const activeRequests = [
    {
      id: 1,
      service: '🚰 Plumbing',
      location: 'Gulshan, Karachi',
      budget: '1,500 - 2,500',
      time: '2 min ago',
      urgent: true,
      orders: 5
    },
    {
      id: 2,
      service: '⚡ Electrical',
      location: 'DHA, Lahore',
      budget: '3,000 - 5,000',
      time: '5 min ago',
      urgent: false,
      orders: 8
    },
    {
      id: 3,
      service: '❄️ AC Repair',
      location: 'F-10, Islamabad',
      budget: '2,500 - 4,000',
      time: '10 min ago',
      urgent: false,
      orders: 12
    },
    {
      id: 4,
      service: '🔨 Carpentry',
      location: 'Gulberg, Lahore',
      budget: '2,000 - 6,000',
      time: '15 min ago',
      urgent: false,
      orders: 7
    }
  ];

  // Stats counter animation
  const stats = [
    { id: 1, value: 25000, label: 'Services Completed', prefix: '', suffix: '+', icon: <FaCheckCircle />, color: '#10b981' },
    { id: 2, value: 4.9, label: 'Average Rating', prefix: '', suffix: '★', icon: <FaStar />, color: '#f59e0b' },
    { id: 3, value: 2.5, label: 'Crore+ Earned', prefix: 'Rs. ', suffix: 'Cr', icon: <FaRupeeSign />, color: '#3b82f6' },
    { id: 4, value: 97.8, label: 'Satisfaction Rate', prefix: '', suffix: '%', icon: <FaHeart />, color: '#ef4444' }
  ];

  // Animated counter component
  const Counter = ({ value, suffix, prefix, id }) => {
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
    
    return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
  };

  return (
    <div className="hero-wrapper">
      {/* Login Status Indicator (optional - for debugging) */}
      {isLoggedIn && (
        <div style={{ display: 'none' }}>
          Logged in as: {userType}
        </div>
      )}

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-particles"></div>
        
        {/* Floating Elements */}
        <div className="floating-elements">
          <div className="floating-element floating-1">🔧</div>
          <div className="floating-element floating-2">⚡</div>
          <div className="floating-element floating-3">🔨</div>
          <div className="floating-element floating-4">🎨</div>
        </div>

        <div className="container">
          
          {/* Live Activity Badge */}
          <div className="live-badge">
            <span className="pulse-dot"></span>
            <span className="live-text">{activeCount.toLocaleString()} active requests right now</span>
            <span className="live-badge-glow"></span>
          </div>

          {/* Main Title */}
          <div className="hero-main">
            <h1 className="hero-title">
              <span className="title-dastak">DASTAK</span>
              <span className="title-urdu">دستک</span>
              <span className="title-registered">®</span>
            </h1>
            
            <h2 className="hero-subtitle">
              <span className="subtitle-highlight">Pakistan's #1</span> Home Services Platform
            </h2>
            
            <p className="hero-description">
              Connect with <strong>50,000+ verified professionals</strong> for all your service needs.
              <span className="trust-badge">
                <FaShieldAlt /> 100% Verified
              </span>
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <div className="search-container">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="What service do you need? (e.g., Plumbing, Electrical, AC Repair)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleFindServices()}
              />
            </div>
            <div className="search-options">
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
              <button className="search-btn" onClick={handleFindServices}>
                <FaSearch /> Find Services
              </button>
            </div>
          </div>

          {/* Popular Services Carousel */}
          <div className="popular-services">
            <div className="section-header-mini">
              <h3>Popular Services</h3>
              <a href="#" onClick={(e) => { e.preventDefault(); handleViewAllServices(); }} className="view-all-link">
                View All <FaArrowRight />
              </a>
            </div>
            <div className="services-carousel">
              {SERVICE_TYPES.slice(0, 12).map((service, index) => (
                <div 
                  key={service.id} 
                  className={`service-pill ${hoveredService === service.id ? 'hovered' : ''}`}
                  style={{ 
                    background: `linear-gradient(135deg, ${service.color}15, ${service.color}05)`,
                    borderColor: hoveredService === service.id ? service.color : 'transparent'
                  }}
                  onMouseEnter={() => setHoveredService(service.id)}
                  onMouseLeave={() => setHoveredService(null)}
                  onClick={() => handleServiceClick(service.name)}
                >
                  <span className="service-pill-icon" style={{ color: service.color }}>
                    {renderIcon(service.icon, service.color, 18)}
                  </span>
                  <span className="service-pill-name">{service.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={stat.id} className={`stat-card fade-in delay-${index}`}>
                <div className="stat-icon-wrapper" style={{ background: `${stat.color}15` }}>
                  <div className="stat-icon" style={{ color: stat.color }}>
                    {stat.icon}
                  </div>
                </div>
                <div className="stat-content">
                  <div className="stat-number">
                    <Counter value={stat.value} suffix={stat.suffix} prefix={stat.prefix} id={stat.id} />
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
              onClick={handlePostRequest}
            >
              <span className="btn-icon">📋</span>
              <span className="btn-content">
                <span className="btn-title">Post a Request</span>
                <span className="btn-subtitle">Get quotes in minutes</span>
              </span>
              <FaArrowRight className="btn-arrow" />
            </button>
            
            <button 
              className="cta-secondary"
              onClick={handleJoinProvider}
            >
              <span className="btn-icon">💼</span>
              <span className="btn-content">
                <span className="btn-title">Join as Provider</span>
                <span className="btn-subtitle">Earn up to Rs. 100K/month</span>
              </span>
              <FaArrowRight className="btn-arrow" />
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="trust-indicators">
            <div className="trust-item">
              <div className="trust-icon-wrapper">
                <FaCheckCircle className="trust-icon" />
              </div>
              <span>Verified Professionals</span>
            </div>
            <div className="trust-item">
              <div className="trust-icon-wrapper">
                <FaShieldAlt className="trust-icon" />
              </div>
              <span>Secure Payments</span>
            </div>
            <div className="trust-item">
              <div className="trust-icon-wrapper">
                <FaClockRegular className="trust-icon" />
              </div>
              <span>24/7 Support</span>
            </div>
            <div className="trust-item">
              <div className="trust-icon-wrapper">
                <FaUsers className="trust-icon" />
              </div>
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
                <span className="section-badge">LIVE</span>
                Active Service Requests
              </h2>
              <p>Real-time updates from customers near you</p>
            </div>
            <button className="view-all-btn" onClick={handleViewAllServices}>
              Browse All Services <FaArrowRight />
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
                    <FaRupeeSign /> {request.budget} PKR
                  </span>
                  <span className="request-orders">
                    {request.orders} offers
                  </span>
                </div>
                <button className="accept-btn" onClick={handlePostRequest}>
                  Post Similar Request
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
                <span className="section-badge">TRUSTED</span>
                What Our Customers Say
              </h2>
              <p>Join thousands of satisfied customers across Pakistan</p>
            </div>
            <div className="rating-summary">
              <span className="rating-number">4.8</span>
              <div className="rating-stars">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="star-filled" />
                ))}
              </div>
              <span className="rating-count">(2,500+ reviews)</span>
            </div>
          </div>

          <div className="reviews-grid">
            <div className="review-card featured">
              <div className="review-quote">"</div>
              <div className="reviewer-info">
                <div className="reviewer-avatar" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>AR</div>
                <div className="reviewer-details">
                  <h4>Ahmed Raza</h4>
                  <p>Gulshan, Karachi</p>
                </div>
                <div className="review-rating">★★★★★</div>
              </div>
              <p className="review-text">
                "Found a plumber within 30 minutes! Fixed my leaking pipe for just Rs. 1,800. Amazing service! Highly recommended."
              </p>
              <div className="review-meta">
                <span className="service-badge">Plumbing</span>
                <span className="payment-amount">Rs. 1,800</span>
              </div>
            </div>

            <div className="review-card">
              <div className="reviewer-info">
                <div className="reviewer-avatar" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>SK</div>
                <div className="reviewer-details">
                  <h4>Sara Khan</h4>
                  <p>DHA, Lahore</p>
                </div>
                <div className="review-rating">★★★★★</div>
              </div>
              <p className="review-text">
                "Best platform for home services! Got my AC repaired in 2 hours. Professional service at affordable rates."
              </p>
              <div className="review-meta">
                <span className="service-badge">AC Repair</span>
                <span className="payment-amount">Rs. 3,500</span>
              </div>
            </div>

            <div className="review-card">
              <div className="reviewer-info">
                <div className="reviewer-avatar" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>RJ</div>
                <div className="reviewer-details">
                  <h4>Raza Javed</h4>
                  <p>Clifton, Karachi</p>
                </div>
                <div className="review-rating">★★★★☆</div>
              </div>
              <p className="review-text">
                "Car service at my doorstep! Saved me hours of going to the garage. Will definitely use again!"
              </p>
              <div className="review-meta">
                <span className="service-badge">Car Service</span>
                <span className="payment-amount">Rs. 2,200</span>
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
                <span className="section-badge">SUCCESS</span>
                Provider Success Stories
              </h2>
              <p>Real providers, real earnings on Dastak</p>
            </div>
          </div>

          <div className="stories-grid">
            <div className="story-card highlight">
              <div className="story-rank">🏆 Top Earner</div>
              <div className="story-avatar">👨‍🔧</div>
              <h4>Ali Hassan</h4>
              <p className="story-service">Plumber</p>
              <div className="story-earnings">
                <span className="earnings-label">This Month</span>
                <span className="earnings-amount">Rs. 68,500</span>
              </div>
              <div className="story-stats">
                <span><FaStar /> 4.8</span>
                <span><FaTools /> 24 jobs</span>
              </div>
            </div>

            <div className="story-card">
              <div className="story-avatar">👩‍🎨</div>
              <h4>Sana Ahmed</h4>
              <p className="story-service">Painter</p>
              <div className="story-earnings">
                <span className="earnings-label">This Month</span>
                <span className="earnings-amount">Rs. 42,000</span>
              </div>
              <div className="story-stats">
                <span><FaStar /> 4.9</span>
                <span><FaTools /> 18 jobs</span>
              </div>
            </div>

            <div className="story-card">
              <div className="story-avatar">👨‍🔧</div>
              <h4>Kamran Siddiqui</h4>
              <p className="story-service">Electrician</p>
              <div className="story-earnings">
                <span className="earnings-label">This Month</span>
                <span className="earnings-amount">Rs. 55,000</span>
              </div>
              <div className="story-stats">
                <span><FaStar /> 4.7</span>
                <span><FaTools /> 22 jobs</span>
              </div>
            </div>
          </div>

          <div className="cta-banner">
            <div className="banner-content">
              <h3>Ready to start earning?</h3>
              <p>Join 10,000+ service professionals on Dastak</p>
            </div>
            <button 
              className="cta-banner-btn"
              onClick={handleJoinProvider}
            >
              Become a Provider <FaArrowRight />
            </button>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        /* All your existing styles remain exactly the same */
        .hero-wrapper {
          overflow-x: hidden;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .hero-section {
          position: relative;
          padding: 60px 0 60px;
          background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
          border-bottom: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .hero-particles {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: radial-gradient(#3b82f6 1px, transparent 1px);
          background-size: 50px 50px;
          opacity: 0.1;
        }

        .floating-elements {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        .floating-element {
          position: absolute;
          font-size: 24px;
          opacity: 0.2;
          animation: float 20s infinite linear;
        }

        .floating-1 { top: 10%; left: 5%; animation-duration: 25s; }
        .floating-2 { top: 70%; right: 5%; animation-duration: 30s; }
        .floating-3 { bottom: 20%; left: 15%; animation-duration: 35s; }
        .floating-4 { top: 40%; right: 15%; animation-duration: 40s; }

        @keyframes float {
          from { transform: rotate(0deg) translateX(0) rotate(0deg); }
          to { transform: rotate(360deg) translateX(100px) rotate(-360deg); }
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
          background: linear-gradient(145deg, #3b82f6, #2563eb);
          border-radius: 40px;
          margin-bottom: 30px;
          position: relative;
          overflow: hidden;
        }

        .live-badge-glow {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: glow 3s infinite;
        }

        @keyframes glow {
          to { left: 100%; }
        }

        .pulse-dot {
          width: 12px;
          height: 12px;
          background: #ffffff;
          border-radius: 50%;
          animation: pulse 2s infinite;
          box-shadow: 0 0 0 2px rgba(255,255,255,0.3);
        }

        .pulse-dot-large {
          width: 16px;
          height: 16px;
          background: #ef4444;
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
          color: white;
          font-weight: 600;
          font-size: 15px;
          position: relative;
          z-index: 2;
        }

        /* Title */
        .hero-title {
          margin: 0 0 15px;
          font-size: clamp(2rem, 8vw, 4rem);
          font-weight: 800;
          line-height: 1.2;
        }

        .title-dastak {
          background: linear-gradient(145deg, #1e293b, #0f172a);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 2px;
        }

        .title-urdu {
          color: #64748b;
          font-size: 48px;
          font-family: 'Noto Nastaliq Urdu', serif;
          margin-left: 8px;
        }

        .title-registered {
          color: #94a3b8;
          font-size: 20px;
          vertical-align: super;
          margin-left: 4px;
        }

        .hero-subtitle {
          font-size: 32px;
          font-weight: 600;
          color: #334155;
          margin: 0 0 20px;
        }

        .subtitle-highlight {
          background: linear-gradient(145deg, #3b82f6, #2563eb);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          font-size: 18px;
          color: #64748b;
          margin: 0 0 30px;
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
          background: #3b82f610;
          color: #3b82f6;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 600;
          border: 1px solid #3b82f630;
        }

        /* Search Bar */
        .search-container {
          margin-bottom: 40px;
        }

        .search-box {
          position: relative;
          margin-bottom: 15px;
        }

        .search-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 18px;
        }

        .search-box input {
          width: 100%;
          padding: 20px 20px 20px 52px;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          font-size: 16px;
          transition: all 0.3s;
          background: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }

        .search-box input:focus {
          border-color: #3b82f6;
          outline: none;
          box-shadow: 0 8px 24px rgba(59,130,246,0.15);
        }

        .search-options {
          display: flex;
          gap: 12px;
        }

        .city-select {
          flex: 1;
          padding: 16px 20px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 15px;
          background: white;
          color: #1e293b;
          cursor: pointer;
          transition: all 0.3s;
        }

        .city-select:focus {
          border-color: #3b82f6;
          outline: none;
          box-shadow: 0 4px 12px rgba(59,130,246,0.1);
        }

        .search-btn {
          padding: 16px 32px;
          background: linear-gradient(145deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
          box-shadow: 0 8px 20px rgba(59,130,246,0.3);
          white-space: nowrap;
        }

        .search-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(59,130,246,0.4);
        }

        .search-btn:active {
          transform: translateY(0);
        }

        /* Popular Services */
        .popular-services {
          margin-bottom: 50px;
        }

        .section-header-mini {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .section-header-mini h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .view-all-link {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #3b82f6;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
        }

        .view-all-link:hover {
          gap: 10px;
          color: #2563eb;
        }

        .services-carousel {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .service-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: white;
          border: 2px solid transparent;
          border-radius: 40px;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }

        .service-pill:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(59,130,246,0.15);
        }

        .service-pill.hovered {
          border-color: #3b82f6;
          background: linear-gradient(135deg, #3b82f610, #ffffff);
        }

        .service-pill-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .service-pill-name {
          font-size: 14px;
          font-weight: 500;
          color: #334155;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 50px;
        }

        .stat-card {
          background: white;
          padding: 24px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.3s;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.04);
          border-color: #3b82f630;
        }

        .stat-icon-wrapper {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon {
          font-size: 28px;
        }

        .stat-content {
          flex: 1;
        }

        .stat-number {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.2;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #64748b;
        }

        /* CTA Buttons */
        .hero-cta {
          display: flex;
          gap: 20px;
          margin-bottom: 50px;
        }

        .cta-primary, .cta-secondary {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;
          border: none;
          border-radius: 16px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }

        .cta-primary {
          background: linear-gradient(145deg, #0f172a, #1e293b);
          color: white;
          box-shadow: 0 8px 20px rgba(15,23,42,0.2);
        }

        .cta-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transition: left 0.5s;
        }

        .cta-primary:hover::before {
          left: 100%;
        }

        .cta-secondary {
          background: white;
          color: #1e293b;
          border: 2px solid #e2e8f0;
        }

        .cta-secondary:hover {
          border-color: #3b82f6;
          background: #f8fafc;
        }

        .btn-icon {
          font-size: 32px;
        }

        .btn-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }

        .btn-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .btn-subtitle {
          font-size: 13px;
          opacity: 0.9;
        }

        .btn-arrow {
          transition: transform 0.3s;
        }

        .cta-primary:hover .btn-arrow,
        .cta-secondary:hover .btn-arrow {
          transform: translateX(4px);
        }

        /* Trust Indicators */
        .trust-indicators {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 40px;
          padding: 20px 30px;
          background: white;
          border-radius: 60px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }

        .trust-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #334155;
          font-size: 14px;
          font-weight: 500;
        }

        .trust-icon-wrapper {
          width: 32px;
          height: 32px;
          background: #3b82f610;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .trust-icon {
          color: #3b82f6;
          font-size: 16px;
        }

        /* Active Requests Section */
        .active-requests-section {
          padding: 80px 0;
          background: #f8fafc;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 40px;
        }

        .section-badge {
          display: inline-block;
          padding: 4px 12px;
          background: linear-gradient(145deg, #3b82f6, #2563eb);
          color: white;
          font-size: 12px;
          font-weight: 600;
          border-radius: 30px;
          margin-right: 12px;
          letter-spacing: 0.5px;
        }

        .section-header h2 {
          margin: 0 0 8px;
          font-size: 32px;
          font-weight: 700;
          color: #0f172a;
          display: flex;
          align-items: center;
        }

        .section-header p {
          margin: 0;
          color: #64748b;
          font-size: 16px;
        }

        .view-all-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          background: white;
          color: #3b82f6;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .view-all-btn:hover {
          border-color: #3b82f6;
          background: #f8fafc;
          gap: 14px;
        }

        .requests-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .request-card {
          background: white;
          padding: 24px;
          border-radius: 20px;
          position: relative;
          transition: all 0.3s;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }

        .request-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 30px rgba(59,130,246,0.1);
          border-color: #3b82f630;
        }

        .urgent-badge {
          position: absolute;
          top: -10px;
          right: 20px;
          background: linear-gradient(145deg, #ef4444, #dc2626);
          color: white;
          padding: 6px 16px;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 12px rgba(239,68,68,0.3);
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
          font-weight: 600;
          color: #0f172a;
        }

        .request-time {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #94a3b8;
          font-size: 13px;
        }

        .request-location {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-size: 14px;
          margin-bottom: 20px;
        }

        .request-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-top: 15px;
          border-top: 1px solid #e2e8f0;
        }

        .request-budget {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #10b981;
          font-weight: 600;
          font-size: 16px;
        }

        .request-orders {
          color: #64748b;
          font-size: 13px;
        }

        .accept-btn {
          width: 100%;
          padding: 12px;
          background: #f8fafc;
          color: #3b82f6;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .accept-btn:hover {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .live-counter-card {
          background: linear-gradient(145deg, #0f172a, #1e293b);
          border-radius: 20px;
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .live-counter-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(transparent, #3b82f630, transparent);
          animation: rotate 10s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .counter-content {
          text-align: center;
          color: white;
          position: relative;
          z-index: 2;
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(10px);
          padding: 24px;
          border-radius: 16px;
          width: 100%;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .counter-icon {
          font-size: 48px;
          margin-bottom: 15px;
          color: #3b82f6;
        }

        .counter-number {
          display: block;
          font-size: 40px;
          font-weight: 700;
          margin-bottom: 8px;
          background: linear-gradient(145deg, #ffffff, #e2e8f0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .counter-label {
          display: block;
          font-size: 16px;
          opacity: 0.9;
          margin-bottom: 20px;
          color: #cbd5e1;
        }

        .counter-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #3b82f6;
          font-size: 14px;
          font-weight: 600;
        }

        /* Reviews Section */
        .reviews-section {
          padding: 80px 0;
          background: white;
        }

        .rating-summary {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 12px 24px;
          background: #f8fafc;
          border-radius: 60px;
          border: 1px solid #e2e8f0;
        }

        .rating-number {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
        }

        .rating-stars {
          display: flex;
          gap: 4px;
        }

        .star-filled {
          color: #f59e0b;
          font-size: 18px;
        }

        .rating-count {
          color: #64748b;
          font-size: 14px;
        }

        .reviews-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .review-card {
          background: #f8fafc;
          padding: 28px;
          border-radius: 20px;
          transition: all 0.3s;
          position: relative;
          border: 1px solid #e2e8f0;
        }

        .review-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 30px rgba(59,130,246,0.1);
          border-color: #3b82f630;
        }

        .review-card.featured {
          background: linear-gradient(145deg, #fef9e7, #fff9e6);
          border: 1px solid #fcd34d;
        }

        .review-quote {
          position: absolute;
          top: 20px;
          right: 20px;
          font-size: 64px;
          color: #3b82f610;
          font-family: serif;
          font-weight: 700;
        }

        .reviewer-info {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 15px;
        }

        .reviewer-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 18px;
          color: white;
        }

        .reviewer-details h4 {
          margin: 0 0 4px;
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
        }

        .reviewer-details p {
          margin: 0;
          font-size: 13px;
          color: #64748b;
        }

        .review-rating {
          margin-left: auto;
          color: #f59e0b;
          font-size: 14px;
        }

        .review-text {
          color: #475569;
          line-height: 1.6;
          margin-bottom: 20px;
          font-size: 15px;
          font-style: italic;
        }

        .review-meta {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .service-badge {
          padding: 6px 14px;
          background: #e2e8f0;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 500;
          color: #334155;
        }

        .payment-amount {
          color: #10b981;
          font-weight: 600;
          font-size: 14px;
        }

        /* Success Stories */
        .success-stories {
          padding: 80px 0;
          background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
        }

        .stories-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 50px;
        }

        .story-card {
          background: white;
          padding: 40px 30px;
          border-radius: 24px;
          text-align: center;
          transition: all 0.3s;
          border: 1px solid #e2e8f0;
          position: relative;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }

        .story-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 24px 36px rgba(59,130,246,0.1);
          border-color: #3b82f630;
        }

        .story-card.highlight {
          border: 2px solid #3b82f6;
          background: linear-gradient(145deg, #ffffff, #f8fafc);
        }

        .story-rank {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(145deg, #3b82f6, #2563eb);
          color: white;
          padding: 6px 20px;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        }

        .story-avatar {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .story-card h4 {
          margin: 0 0 6px;
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
        }

        .story-service {
          color: #64748b;
          font-size: 15px;
          margin-bottom: 20px;
        }

        .story-earnings {
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          padding: 16px;
          border-radius: 16px;
          margin-bottom: 16px;
          border: 1px solid #e2e8f0;
        }

        .earnings-label {
          display: block;
          font-size: 12px;
          color: #64748b;
          margin-bottom: 6px;
        }

        .earnings-amount {
          display: block;
          font-size: 28px;
          font-weight: 700;
          color: #10b981;
        }

        .story-stats {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          color: #64748b;
          font-size: 14px;
        }

        .story-stats svg {
          margin-right: 4px;
          color: #f59e0b;
        }

        /* CTA Banner */
        .cta-banner {
          background: linear-gradient(145deg, #0f172a, #1e293b);
          border-radius: 24px;
          padding: 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 30px;
          position: relative;
          overflow: hidden;
        }

        .cta-banner::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, #3b82f620, transparent 70%);
          animation: pulse 4s ease-in-out infinite;
        }

        .banner-content {
          position: relative;
          z-index: 2;
        }

        .banner-content h3 {
          margin: 0 0 8px;
          font-size: 32px;
          font-weight: 700;
          color: white;
        }

        .banner-content p {
          margin: 0;
          font-size: 18px;
          color: #cbd5e1;
        }

        .cta-banner-btn {
          padding: 18px 36px;
          background: white;
          color: #0f172a;
          border: none;
          border-radius: 16px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s;
          position: relative;
          z-index: 2;
          box-shadow: 0 8px 20px rgba(0,0,0,0.2);
        }

        .cta-banner-btn:hover {
          transform: translateX(4px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.3);
          background: #f8fafc;
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

        .fade-in {
          animation: fadeIn 1s ease forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .delay-0 { animation-delay: 0.1s; }
        .delay-1 { animation-delay: 0.2s; }
        .delay-2 { animation-delay: 0.3s; }
        .delay-3 { animation-delay: 0.4s; }

        /* Responsive */
        @media (max-width: 1024px) {
          .hero-title { font-size: 48px; }
          .title-urdu { font-size: 36px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .requests-grid { grid-template-columns: repeat(2, 1fr); }
          .reviews-grid { grid-template-columns: repeat(2, 1fr); }
          .stories-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .hero-title { font-size: 40px; }
          .title-urdu { font-size: 30px; }
          .hero-subtitle { font-size: 24px; }
          .search-options { flex-direction: column; }
          .search-btn { width: 100%; }
          .services-carousel { justify-content: center; }
          .stats-grid { grid-template-columns: 1fr; }
          .hero-cta { flex-direction: column; }
          .trust-indicators { flex-direction: column; gap: 20px; border-radius: 30px; }
          .requests-grid { grid-template-columns: 1fr; }
          .reviews-grid { grid-template-columns: 1fr; }
          .stories-grid { grid-template-columns: 1fr; }
          .cta-banner { flex-direction: column; text-align: center; padding: 30px; }
          .section-header { flex-direction: column; gap: 20px; text-align: center; }
          .section-header h2 { flex-wrap: wrap; justify-content: center; }
        }
      `}</style>
    </div>
  );
};

export default Hero;