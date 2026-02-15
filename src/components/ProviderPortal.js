import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaTools, FaChartLine, FaPhone, FaLock, FaEnvelope, FaMapMarkerAlt,
  FaIdCard, FaEye, FaEyeSlash, FaCheckCircle, FaArrowRight, FaSpinner,
  FaShieldAlt, FaClock, FaStar, FaUsers, FaCreditCard,
  FaHandsHelping, FaMobile, FaBuilding, FaBriefcase, FaRupeeSign,
  FaTrophy, FaMedal, FaRocket, FaBullhorn, FaUserTie
} from 'react-icons/fa';
import { socket } from '../Services/socket';

const CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Gujranwala', 'Sialkot',
  'Bahawalpur', 'Sargodha', 'Sukkur', 'Larkana', 'Hyderabad'
];

const SERVICE_TYPES = [
  { value: 'plumbing', name: 'Plumbing', icon: '🔧' },
  { value: 'electrical', name: 'Electrical', icon: '⚡' },
  { value: 'carpentry', name: 'Carpentry', icon: '🔨' },
  { value: 'painting', name: 'Painting', icon: '🎨' },
  { value: 'ac_repair', name: 'AC Repair', icon: '❄️' },
  { value: 'cleaning', name: 'Cleaning', icon: '🧹' },
  { value: 'appliance_repair', name: 'Appliance Repair', icon: '🔧' },
  { value: 'pest_control', name: 'Pest Control', icon: '🐜' },
  { value: 'mover', name: 'Movers', icon: '🚚' },
  { value: 'gardener', name: 'Gardener', icon: '🌱' },
  { value: 'security', name: 'Security', icon: '🛡️' },
  { value: 'teacher', name: 'Home Tutor', icon: '📚' },
  { value: 'chef', name: 'Chef/Cook', icon: '👨‍🍳' },
  { value: 'photographer', name: 'Photographer', icon: '📸' },
  { value: 'driver', name: 'Driver', icon: '🚗' },
  { value: 'beautician', name: 'Beautician', icon: '💇' }
];

const ProviderPortal = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [activeStat, setActiveStat] = useState(0);

  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    name: '',
    email: '',
    city: '',
    cnic: '',
    serviceType: '',
    address: ''
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Success stories data
  const successStories = [
    {
      name: 'Ali Hassan',
      service: 'Plumber',
      earnings: '85,000',
      jobs: 47,
      rating: 4.9,
      avatar: '👨‍🔧'
    },
    {
      name: 'Sana Ahmed',
      service: 'Painter',
      earnings: '62,000',
      jobs: 38,
      rating: 4.8,
      avatar: '👩‍🎨'
    },
    {
      name: 'Kamran Siddiqui',
      service: 'Electrician',
      earnings: '71,000',
      jobs: 42,
      rating: 4.9,
      avatar: '👨‍🔧'
    }
  ];

  // Stats data
  const stats = [
    { value: '10,000+', label: 'Active Providers', icon: <FaUsers />, color: '#3b82f6' },
    { value: '25,000+', label: 'Jobs Completed', icon: <FaCheckCircle />, color: '#10b981' },
    { value: '4.9/5', label: 'Provider Rating', icon: <FaStar />, color: '#f59e0b' },
    { value: '₨ 45K', label: 'Avg. Monthly', icon: <FaRupeeSign />, color: '#8b5cf6' }
  ];

  useEffect(() => {
    setAnimateIn(true);
    const interval = setInterval(() => {
      setActiveStat((prev) => (prev + 1) % successStories.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Validation functions
  const validateField = (name, value) => {
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '');
      if (!digits) return 'Phone number is required';
      if (!/^03\d{9}$/.test(digits)) return 'Enter valid Pakistani number (03XXXXXXXXX)';
      return '';
    }

    if (name === 'password') {
      if (!value) return 'Password is required';
      if (value.length < 6) return 'Password must be at least 6 characters';
      return '';
    }

    if (!isLogin) {
      if (name === 'name' && !value) return 'Full name is required';
      if (name === 'email') {
        if (!value) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Enter a valid email address';
      }
      if (name === 'city' && !value) return 'Please select your city';
      if (name === 'cnic') {
        if (!value) return 'CNIC is required';
        const cnicRegex = /^\d{5}-\d{7}-\d$/;
        if (!cnicRegex.test(value)) return 'Format: 12345-1234567-1';
      }
      if (name === 'serviceType' && !value) return 'Please select your service';
    }
    return '';
  };

  const validateAll = () => {
    const newErrors = {};
    newErrors.phone = validateField('phone', formData.phone);
    newErrors.password = validateField('password', formData.password);
    
    if (!isLogin) {
      newErrors.name = validateField('name', formData.name);
      newErrors.email = validateField('email', formData.email);
      newErrors.city = validateField('city', formData.city);
      newErrors.cnic = validateField('cnic', formData.cnic);
      newErrors.serviceType = validateField('serviceType', formData.serviceType);
    }
    
    Object.keys(newErrors).forEach(k => !newErrors[k] && delete newErrors[k]);
    setErrors(newErrors);
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (touched[name]) {
      setErrors({ ...errors, [name]: validateField(name, value) });
    }
    setGeneralError('');
    setSuccessMessage('');
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    setErrors({ ...errors, [name]: validateField(name, value) });
  };

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.phone.replace(/\D/g, ''),
          password: formData.password
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const { user, token } = data.data;
        
        if (user.user_type !== 'provider') {
          setGeneralError('This account is registered as a customer. Please use customer login.');
          return;
        }
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({
          id: user.id,
          name: user.name,
          user_type: 'provider',
          phone: user.phone,
          service: user.service || ''
        }));
        
        if (user.service) {
          localStorage.setItem('provider_service', user.service);
        }
        
        if (socket && socket.updateAuth) {
          socket.updateAuth({
            id: user.id,
            name: user.name,
            user_type: 'provider',
            token: token,
            service: user.service || ''
          });
        }
        
        setSuccessMessage(`Welcome back, ${user.name}!`);
        
        setTimeout(() => {
          navigate('/provider-dashboard');
        }, 1500);
      } else {
        setGeneralError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setGeneralError('Network error. Please try again.');
    }
  };

  const handleRegister = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone.replace(/\D/g, ''),
          password: formData.password,
          user_type: 'provider',
          city: formData.city,
          cnic: formData.cnic,
          service: formData.serviceType,
          address: formData.address || ''
        })
      });

      const data = await response.json();

      if (data.success) {
        const { user, token } = data.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({
          id: user.id,
          name: user.name,
          user_type: 'provider',
          phone: user.phone,
          service: user.service || ''
        }));
        
        localStorage.setItem('provider_service', user.service || formData.serviceType);
        
        if (socket && socket.updateAuth) {
          socket.updateAuth({
            id: user.id,
            name: user.name,
            user_type: 'provider',
            token: token,
            service: user.service || formData.serviceType
          });
          
          setTimeout(() => socket.connect(), 500);
        }
        
        setSuccessMessage('Registration successful! Welcome to Dastak!');
        
        setTimeout(() => {
          navigate('/provider-dashboard');
        }, 1500);
      } else {
        setGeneralError(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setGeneralError('Network error. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setSuccessMessage('');

    const errors = validateAll();
    if (Object.keys(errors).length > 0) {
      const allTouched = { phone: true, password: true };
      if (!isLogin) {
        allTouched.name = true;
        allTouched.email = true;
        allTouched.city = true;
        allTouched.cnic = true;
        allTouched.serviceType = true;
      }
      setTouched(allTouched);
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (isLogin) {
        await handleLogin();
      } else {
        await handleRegister();
      }
    } catch (err) {
      setGeneralError(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="provider-portal-wrapper">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="bg-grid"></div>
        <div className="bg-glow glow-1"></div>
        <div className="bg-glow glow-2"></div>
      </div>

      <div className="container">
        {/* Header */}
        <div className={`portal-header ${animateIn ? 'animate-in' : ''}`}>
          <div className="logo-section">
            <FaTools className="logo-icon" />
            <div>
              <h1 className="logo">
                <span className="logo-dastak">DASTAK</span>
                <span className="logo-provider">Provider</span>
              </h1>
              <p className="tagline">Pakistan's Premier Service Provider Network</p>
            </div>
          </div>
          
          <div className="header-actions">
            <button className="help-btn">
              <FaBullhorn /> Need Help?
            </button>
          </div>
        </div>

        {/* Hero Stats */}
        <div className={`stats-grid ${animateIn ? 'animate-in' : ''}`}>
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                {stat.icon}
              </div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="main-grid">
          {/* Left Column - Provider Benefits */}
          <div className={`benefits-column ${animateIn ? 'animate-in' : ''}`}>
            {/* Hero Message */}
            <div className="hero-card">
              <FaRocket className="hero-icon" />
              <h2>Start Earning Today!</h2>
              <p>Join 10,000+ service professionals earning on Dastak</p>
              <div className="earnings-estimate">
                <span className="estimate-label">Average Monthly Earnings</span>
                <span className="estimate-value">₨ 45,000 - 85,000</span>
              </div>
            </div>

            {/* Provider Benefits */}
            <div className="benefits-list">
              <h3>Why Join Dastak Pro?</h3>
              
              <div className="benefit-item">
                <div className="benefit-icon income">
                  <FaRupeeSign />
                </div>
                <div className="benefit-info">
                  <h4>Steady Income</h4>
                  <p>Earn up to ₨ 100,000 per month with regular jobs</p>
                </div>
              </div>

              <div className="benefit-item">
                <div className="benefit-icon flex">
                  <FaClock />
                </div>
                <div className="benefit-info">
                  <h4>Flexible Hours</h4>
                  <p>Work on your own schedule, choose jobs that fit your time</p>
                </div>
              </div>

              <div className="benefit-item">
                <div className="benefit-icon payment">
                  <FaCreditCard />
                </div>
                <div className="benefit-info">
                  <h4>Instant Payments</h4>
                  <p>Get paid directly to your account within 24 hours</p>
                </div>
              </div>

              <div className="benefit-item">
                <div className="benefit-icon verified">
                  <FaShieldAlt />
                </div>
                <div className="benefit-info">
                  <h4>Verified Customers</h4>
                  <p>100% verified customers, no payment disputes</p>
                </div>
              </div>
            </div>

            {/* Success Stories Carousel */}
            <div className="success-stories">
              <h3>Top Earners This Month</h3>
              <div className="stories-carousel">
                {successStories.map((story, index) => (
                  <div 
                    key={index}
                    className={`story-card ${activeStat === index ? 'active' : ''}`}
                  >
                    <div className="story-rank">
                      {index === 0 && <FaTrophy className="gold" />}
                      {index === 1 && <FaMedal className="silver" />}
                      {index === 2 && <FaMedal className="bronze" />}
                    </div>
                    <div className="story-avatar">{story.avatar}</div>
                    <h4>{story.name}</h4>
                    <p className="story-service">{story.service}</p>
                    <div className="story-stats">
                      <div className="story-stat">
                        <span className="stat-label">Earnings</span>
                        <span className="stat-value">₨ {story.earnings}</span>
                      </div>
                      <div className="story-stat">
                        <span className="stat-label">Jobs</span>
                        <span className="stat-value">{story.jobs}</span>
                      </div>
                      <div className="story-stat">
                        <span className="stat-label">Rating</span>
                        <span className="stat-value">{story.rating} ★</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="carousel-dots">
                {successStories.map((_, index) => (
                  <span 
                    key={index}
                    className={`dot ${activeStat === index ? 'active' : ''}`}
                    onClick={() => setActiveStat(index)}
                  />
                ))}
              </div>
            </div>

            {/* Business CTA */}
            <div className="business-cta">
              <FaBuilding className="cta-icon" />
              <div className="cta-content">
                <h4>Grow Your Business</h4>
                <p>Get more jobs, build your reputation, and earn more</p>
              </div>
              <button className="cta-button">
                Learn More <FaArrowRight />
              </button>
            </div>
          </div>

          {/* Right Column - Auth Form */}
          <div className={`auth-column ${animateIn ? 'animate-in' : ''}`}>
            <div className="auth-card">
              {/* Mode Toggle */}
              <div className="mode-toggle">
                <button
                  className={`toggle-btn ${isLogin ? 'active' : ''}`}
                  onClick={() => setIsLogin(true)}
                >
                  Login
                </button>
                <button
                  className={`toggle-btn ${!isLogin ? 'active' : ''}`}
                  onClick={() => setIsLogin(false)}
                >
                  Register as Provider
                </button>
              </div>

              {/* Professional Badge */}
              {!isLogin && (
                <div className="professional-badge">
                  <FaUserTie />
                  <span>Join as a verified professional</span>
                </div>
              )}

              {/* Form Title */}
              <h2 className="form-title">
                {isLogin ? 'Welcome Back, Partner!' : 'Become a Provider'}
              </h2>
              <p className="form-subtitle">
                {isLogin 
                  ? 'Login to access your provider dashboard'
                  : 'Start your journey to financial freedom'}
              </p>

              {/* Messages */}
              {generalError && (
                <div className="message error">
                  <span>⚠️</span> {generalError}
                </div>
              )}
              
              {successMessage && (
                <div className="message success">
                  <FaCheckCircle /> {successMessage}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit}>
                {/* Phone */}
                <div className="input-group">
                  <div className="input-icon-wrapper">
                    <FaPhone />
                  </div>
                  <div className="input-field">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="03XX-XXXXXXX"
                      className={errors.phone ? 'error' : ''}
                    />
                    {errors.phone && <span className="error-text">{errors.phone}</span>}
                  </div>
                </div>

                {/* Registration Fields */}
                {!isLogin && (
                  <>
                    {/* Full Name */}
                    <div className="input-group">
                      <div className="input-icon-wrapper">
                        <FaUserTie />
                      </div>
                      <div className="input-field">
                        <label>Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Enter your full name"
                          className={errors.name ? 'error' : ''}
                        />
                        {errors.name && <span className="error-text">{errors.name}</span>}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="input-group">
                      <div className="input-icon-wrapper">
                        <FaEnvelope />
                      </div>
                      <div className="input-field">
                        <label>Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="your@email.com"
                          className={errors.email ? 'error' : ''}
                        />
                        {errors.email && <span className="error-text">{errors.email}</span>}
                      </div>
                    </div>

                    {/* CNIC */}
                    <div className="input-group">
                      <div className="input-icon-wrapper">
                        <FaIdCard />
                      </div>
                      <div className="input-field">
                        <label>CNIC Number</label>
                        <input
                          type="text"
                          name="cnic"
                          value={formData.cnic}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="12345-1234567-1"
                          className={errors.cnic ? 'error' : ''}
                        />
                        {errors.cnic && <span className="error-text">{errors.cnic}</span>}
                      </div>
                    </div>

                    {/* City and Service Type */}
                    <div className="row">
                      <div className="input-group half">
                        <div className="input-icon-wrapper">
                          <FaMapMarkerAlt />
                        </div>
                        <div className="input-field">
                          <label>City</label>
                          <select
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={errors.city ? 'error' : ''}
                          >
                            <option value="">Select city</option>
                            {CITIES.map(city => (
                              <option key={city} value={city.toLowerCase()}>{city}</option>
                            ))}
                          </select>
                          {errors.city && <span className="error-text">{errors.city}</span>}
                        </div>
                      </div>

                      <div className="input-group half">
                        <div className="input-icon-wrapper">
                          <FaTools />
                        </div>
                        <div className="input-field">
                          <label>Service Type</label>
                          <select
                            name="serviceType"
                            value={formData.serviceType}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={errors.serviceType ? 'error' : ''}
                          >
                            <option value="">Select service</option>
                            {SERVICE_TYPES.map(service => (
                              <option key={service.value} value={service.value}>
                                {service.icon} {service.name}
                              </option>
                            ))}
                          </select>
                          {errors.serviceType && <span className="error-text">{errors.serviceType}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="input-group">
                      <div className="input-icon-wrapper">
                        <FaMapMarkerAlt />
                      </div>
                      <div className="input-field">
                        <label>Business Address (Optional)</label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Area, street, or landmark"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Password */}
                <div className="input-group">
                  <div className="input-icon-wrapper">
                    <FaLock />
                  </div>
                  <div className="input-field">
                    <label>Password</label>
                    <div className="password-field">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder={isLogin ? 'Enter your password' : 'Create a password'}
                        className={errors.password ? 'error' : ''}
                      />
                      <button 
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {errors.password && <span className="error-text">{errors.password}</span>}
                    {!isLogin && (
                      <small className="input-hint">At least 6 characters</small>
                    )}
                  </div>
                </div>

                {/* Login Options */}
                {isLogin && (
                  <div className="login-options">
                    <label className="checkbox">
                      <input type="checkbox" /> 
                      <span>Remember me</span>
                    </label>
                    <a href="/forgot-password" className="forgot-link">Forgot Password?</a>
                  </div>
                )}

                {/* Terms */}
                {!isLogin && (
                  <div className="terms">
                    <input type="checkbox" id="terms" required />
                    <label htmlFor="terms">
                      I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
                    </label>
                  </div>
                )}

                {/* Submit Button */}
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="spin" /> Processing...
                    </>
                  ) : (
                    <>
                      {isLogin ? 'Login to Dashboard' : 'Start Earning'} <FaArrowRight />
                    </>
                  )}
                </button>
              </form>

              {/* Toggle Link */}
              <div className="toggle-link">
                <p>
                  {isLogin ? "New to Dastak? " : "Already a provider? "}
                  <button onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? 'Register as Provider' : 'Login'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .provider-portal-wrapper {
          min-height: 100vh;
          background: #0a0f1c;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        /* Animated Background */
        .animated-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
        }

        .bg-grid {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        .bg-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
        }

        .glow-1 {
          width: 400px;
          height: 400px;
          background: rgba(59,130,246,0.2);
          top: -100px;
          right: -100px;
          animation: pulse 8s infinite;
        }

        .glow-2 {
          width: 300px;
          height: 300px;
          background: rgba(16,185,129,0.15);
          bottom: -50px;
          left: -50px;
          animation: pulse 10s infinite reverse;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }

        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 40px 24px;
          position: relative;
          z-index: 2;
        }

        /* Header */
        .portal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          opacity: 0;
          transform: translateY(-20px);
          transition: all 0.6s ease;
        }

        .portal-header.animate-in {
          opacity: 1;
          transform: translateY(0);
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .logo-icon {
          font-size: 40px;
          color: #3b82f6;
          background: rgba(59,130,246,0.1);
          padding: 12px;
          border-radius: 16px;
        }

        .logo {
          margin: 0 0 4px;
          font-size: 28px;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logo-dastak {
          color: white;
        }

        .logo-provider {
          font-size: 16px;
          background: linear-gradient(145deg, #3b82f6, #60a5fa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .tagline {
          color: #94a3b8;
          font-size: 13px;
          margin: 0;
        }

        .help-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 30px;
          color: white;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }

        .help-btn:hover {
          background: rgba(255,255,255,0.1);
          border-color: #3b82f6;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 40px;
          opacity: 0;
          transform: translateY(-20px);
          transition: all 0.6s ease 0.1s;
        }

        .stats-grid.animate-in {
          opacity: 1;
          transform: translateY(0);
        }

        .stat-card {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.3s;
        }

        .stat-card:hover {
          background: rgba(255,255,255,0.05);
          border-color: #3b82f6;
          transform: translateY(-4px);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 20px;
          font-weight: 700;
          color: white;
          line-height: 1.2;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: #94a3b8;
        }

        /* Main Grid */
        .main-grid {
          display: grid;
          grid-template-columns: 1fr 480px;
          gap: 40px;
        }

        /* Benefits Column */
        .benefits-column {
          opacity: 0;
          transform: translateX(-20px);
          transition: all 0.6s ease 0.2s;
        }

        .benefits-column.animate-in {
          opacity: 1;
          transform: translateX(0);
        }

        .hero-card {
          background: linear-gradient(145deg, #1e293b, #0f172a);
          border-radius: 24px;
          padding: 32px;
          margin-bottom: 32px;
          border: 1px solid #3b82f630;
          position: relative;
          overflow: hidden;
        }

        .hero-card::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, #3b82f620, transparent 70%);
          animation: rotate 20s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .hero-icon {
          font-size: 48px;
          color: #3b82f6;
          margin-bottom: 16px;
          position: relative;
          z-index: 2;
        }

        .hero-card h2 {
          font-size: 24px;
          font-weight: 700;
          color: white;
          margin: 0 0 8px;
          position: relative;
          z-index: 2;
        }

        .hero-card p {
          font-size: 15px;
          color: #94a3b8;
          margin: 0 0 20px;
          position: relative;
          z-index: 2;
        }

        .earnings-estimate {
          background: rgba(59,130,246,0.1);
          border: 1px solid #3b82f6;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          z-index: 2;
        }

        .estimate-label {
          color: #94a3b8;
          font-size: 13px;
        }

        .estimate-value {
          color: #10b981;
          font-size: 18px;
          font-weight: 700;
        }

        .benefits-list {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 24px;
          padding: 24px;
          margin-bottom: 32px;
        }

        .benefits-list h3 {
          font-size: 18px;
          font-weight: 600;
          color: white;
          margin: 0 0 20px;
        }

        .benefit-item {
          display: flex;
          gap: 16px;
          padding: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .benefit-item:last-child {
          border-bottom: none;
        }

        .benefit-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .benefit-icon.income { background: #10b98115; color: #10b981; }
        .benefit-icon.flex { background: #f59e0b15; color: #f59e0b; }
        .benefit-icon.payment { background: #3b82f615; color: #3b82f6; }
        .benefit-icon.verified { background: #8b5cf615; color: #8b5cf6; }

        .benefit-info h4 {
          font-size: 15px;
          font-weight: 600;
          color: white;
          margin: 0 0 4px;
        }

        .benefit-info p {
          font-size: 13px;
          color: #94a3b8;
          margin: 0;
          line-height: 1.5;
        }

        /* Success Stories */
        .success-stories {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 24px;
          padding: 24px;
          margin-bottom: 32px;
        }

        .success-stories h3 {
          font-size: 18px;
          font-weight: 600;
          color: white;
          margin: 0 0 20px;
        }

        .stories-carousel {
          position: relative;
          min-height: 280px;
          margin-bottom: 20px;
        }

        .story-card {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          background: linear-gradient(145deg, #1e293b, #0f172a);
          border-radius: 16px;
          padding: 24px;
          opacity: 0;
          transform: translateX(20px);
          transition: all 0.5s ease;
          pointer-events: none;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .story-card.active {
          opacity: 1;
          transform: translateX(0);
          pointer-events: auto;
          position: relative;
        }

        .story-rank {
          position: absolute;
          top: -10px;
          right: 20px;
          font-size: 20px;
        }

        .gold { color: #fbbf24; }
        .silver { color: #94a3b8; }
        .bronze { color: #b45309; }

        .story-avatar {
          font-size: 48px;
          margin-bottom: 12px;
        }

        .story-card h4 {
          font-size: 18px;
          font-weight: 600;
          color: white;
          margin: 0 0 4px;
        }

        .story-service {
          color: #3b82f6;
          font-size: 13px;
          margin-bottom: 16px;
        }

        .story-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .story-stat {
          text-align: center;
        }

        .story-stat .stat-label {
          display: block;
          font-size: 11px;
          color: #94a3b8;
          margin-bottom: 4px;
        }

        .story-stat .stat-value {
          font-size: 14px;
          font-weight: 600;
          color: white;
        }

        .carousel-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          cursor: pointer;
          transition: all 0.3s;
        }

        .dot.active {
          width: 24px;
          background: #3b82f6;
          border-radius: 4px;
        }

        /* Business CTA */
        .business-cta {
          background: linear-gradient(145deg, #1e293b, #0f172a);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          border: 1px solid #3b82f630;
        }

        .cta-icon {
          font-size: 32px;
          color: #3b82f6;
        }

        .cta-content {
          flex: 1;
        }

        .cta-content h4 {
          font-size: 15px;
          font-weight: 600;
          color: white;
          margin: 0 0 4px;
        }

        .cta-content p {
          font-size: 12px;
          color: #94a3b8;
          margin: 0;
        }

        .cta-button {
          padding: 8px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.3s;
        }

        .cta-button:hover {
          background: #2563eb;
          transform: translateX(4px);
        }

        /* Auth Column */
        .auth-column {
          opacity: 0;
          transform: translateX(20px);
          transition: all 0.6s ease 0.3s;
        }

        .auth-column.animate-in {
          opacity: 1;
          transform: translateX(0);
        }

        .auth-card {
          background: rgba(255,255,255,0.02);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 32px;
          padding: 32px;
        }

        .mode-toggle {
          display: flex;
          gap: 8px;
          padding: 4px;
          background: rgba(255,255,255,0.03);
          border-radius: 12px;
          margin-bottom: 24px;
        }

        .toggle-btn {
          flex: 1;
          padding: 12px;
          border: none;
          background: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.3s;
        }

        .toggle-btn.active {
          background: #3b82f6;
          color: white;
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        }

        .professional-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(59,130,246,0.1);
          border: 1px solid #3b82f6;
          border-radius: 12px;
          margin-bottom: 20px;
          color: #3b82f6;
        }

        .form-title {
          font-size: 24px;
          font-weight: 700;
          color: white;
          margin: 0 0 8px;
        }

        .form-subtitle {
          font-size: 14px;
          color: #94a3b8;
          margin: 0 0 24px;
        }

        .message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .message.error {
          background: rgba(239,68,68,0.1);
          color: #ef4444;
          border: 1px solid #ef4444;
        }

        .message.success {
          background: rgba(16,185,129,0.1);
          color: #10b981;
          border: 1px solid #10b981;
        }

        .input-group {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .input-icon-wrapper {
          width: 48px;
          height: 48px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3b82f6;
          font-size: 18px;
          flex-shrink: 0;
        }

        .input-field {
          flex: 1;
        }

        .input-field label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: #94a3b8;
          margin-bottom: 4px;
        }

        .input-field input,
        .input-field select {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          font-size: 14px;
          color: white;
          transition: all 0.3s;
        }

        .input-field input:focus,
        .input-field select:focus {
          border-color: #3b82f6;
          outline: none;
          background: rgba(255,255,255,0.05);
        }

        .input-field input.error,
        .input-field select.error {
          border-color: #ef4444;
        }

        .password-field {
          position: relative;
        }

        .password-field input {
          padding-right: 40px;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
        }

        .error-text {
          display: block;
          margin-top: 4px;
          color: #ef4444;
          font-size: 11px;
        }

        .input-hint {
          display: block;
          margin-top: 4px;
          color: #94a3b8;
          font-size: 11px;
        }

        .row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .input-group.half {
          margin-bottom: 0;
        }

        .login-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 20px 0;
        }

        .checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #94a3b8;
          font-size: 13px;
          cursor: pointer;
        }

        .forgot-link {
          color: #3b82f6;
          font-size: 13px;
          text-decoration: none;
        }

        .terms {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 20px 0;
          font-size: 13px;
          color: #94a3b8;
        }

        .terms a {
          color: #3b82f6;
          text-decoration: none;
        }

        .submit-button {
          width: 100%;
          padding: 14px;
          background: linear-gradient(145deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59,130,246,0.4);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .toggle-link {
          text-align: center;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .toggle-link p {
          color: #94a3b8;
          font-size: 14px;
          margin: 0;
        }

        .toggle-link button {
          background: none;
          border: none;
          color: #3b82f6;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .main-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .portal-header {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .row {
            grid-template-columns: 1fr;
          }

          .input-group {
            flex-direction: column;
          }

          .input-icon-wrapper {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ProviderPortal;