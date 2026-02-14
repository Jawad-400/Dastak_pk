import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaPhone, FaLock, FaUser, FaMapMarkerAlt, FaEnvelope, FaIdCard,
  FaEye, FaEyeSlash, FaCheckCircle, FaArrowRight, FaSpinner,
  FaShieldAlt, FaClock, FaStar, FaUsers, FaCreditCard,
  FaHandsHelping, FaFacebook, FaWhatsapp, FaTwitter, 
  FaInstagram, FaGoogle, FaMobile
} from 'react-icons/fa';
import { socket } from '../../Services/socket';

const CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Gujranwala', 'Sialkot',
  'Bahawalpur', 'Sargodha', 'Sukkur', 'Larkana', 'Hyderabad'
];

// Statistics data
const stats = [
  { value: '50,000+', label: 'Happy Customers', icon: <FaUsers /> },
  { value: '25,000+', label: 'Jobs Completed', icon: <FaCheckCircle /> },
  { value: '4.9/5', label: 'Customer Rating', icon: <FaStar /> },
  { value: '< 30min', label: 'Avg. Response Time', icon: <FaClock /> }
];

// Features list
const features = [
  { icon: <FaShieldAlt />, title: 'Verified Professionals', description: 'All service providers are background verified' },
  { icon: <FaCreditCard />, title: 'Secure Payments', description: 'Pay only when the job is completed to your satisfaction' },
  { icon: <FaClock />, title: 'Quick Response', description: 'Get Orders from providers within minutes' },
  { icon: <FaHandsHelping />, title: 'Satisfaction Guaranteed', description: '100% money-back guarantee if not satisfied' }
];

const CustomerLogin = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  
  const [formData, setFormData] = useState({ 
    phone: '', 
    password: '', 
    name: '', 
    city: '', 
    email: '',
    cnic: ''
  });
  
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setAnimateIn(true);
  }, []);

  // ========== VALIDATION FUNCTIONS ==========
  const validateField = (name, value) => {
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '');
      if (!digits) return 'Phone number is required.';
      if (!/^03\d{9}$/.test(digits)) return 'Enter valid phone (e.g., 03XXXXXXXXX).';
      return '';
    }

    if (name === 'password') {
      if (!value) return 'Password is required.';
      if (value.length < 6) return 'Password must be at least 6 characters.';
      return '';
    }

    if (name === 'name') {
      if (!value) return 'Full name is required.';
      if (value.length < 2) return 'Please enter your full name.';
      return '';
    }

    if (name === 'city') {
      if (!value) return 'Please select a city.';
      return '';
    }

    if (name === 'email') {
      if (!value) return 'Email is required.';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return 'Please enter a valid email address.';
      return '';
    }

    if (name === 'cnic') {
      if (!value) return 'CNIC is required.';
      const cnicRegex = /^\d{5}-\d{7}-\d$/;
      if (!cnicRegex.test(value)) return 'CNIC must be in format: 12345-1234567-1';
      return '';
    }

    return '';
  };

  const validateAll = () => {
    const nextErrors = {};
    nextErrors.phone = validateField('phone', formData.phone);
    nextErrors.password = validateField('password', formData.password);
    if (!isLogin) {
      nextErrors.name = validateField('name', formData.name);
      nextErrors.city = validateField('city', formData.city);
      nextErrors.email = validateField('email', formData.email);
      nextErrors.cnic = validateField('cnic', formData.cnic);
    }
    Object.keys(nextErrors).forEach((k) => { if (!nextErrors[k]) delete nextErrors[k]; });
    setErrors(nextErrors);
    return nextErrors;
  };

  // ========== HANDLERS ==========
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (touched[name]) {
      setErrors({ ...errors, [name]: validateField(name, value) });
    }
    if (generalError) setGeneralError('');
    if (successMessage) setSuccessMessage('');
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const err = validateField(name, value);
    setErrors({ ...errors, [name]: err });
  };

  // ========== LOGIN HANDLER ==========
  const handleLogin = async (phone, password) => {
    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });

      const data = await response.json();
      
      if (data.success) {
        const { user, token } = data.data;
        
        if (user.user_type !== 'customer') {
          setGeneralError('This account is not registered as a customer');
          return;
        }
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({
          id: user.id,
          name: user.name,
          user_type: 'customer',
          phone: user.phone
        }));
        
        console.log('✅ Customer logged in:', user.name);
        
        if (socket && socket.updateAuth) {
          socket.updateAuth({
            id: user.id,
            name: user.name,
            user_type: 'customer',
            token: token,
            service: ''
          });
        }
        
        setSuccessMessage('Logged in successfully!');
        setTimeout(() => navigate('/customer-portal'), 1000);
      } else {
        setGeneralError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setGeneralError('Network error. Please try again.');
    }
  };

  // ========== REGISTER HANDLER ==========
  const handleRegister = async (userData) => {
    try {
      const response = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          name: userData.name,
          phone: userData.phone.replace(/\D/g, ''),
          user_type: 'customer',
          city: userData.city,
          cnic: userData.cnic
        })
      });

      const data = await response.json();

      if (data.success) {
        const { user, token } = data.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({
          id: user.id,
          name: user.name,
          user_type: 'customer',
          phone: user.phone
        }));
        
        console.log('✅ Customer registered with phone:', user.phone);
        
        if (socket && socket.updateAuth) {
          socket.updateAuth({
            id: user.id,
            name: user.name,
            user_type: 'customer',
            token: token,
            service: ''
          });
          
          setTimeout(() => {
            console.log('🔌 Connecting WebSocket...');
            socket.connect();
          }, 100);
        }
        
        setSuccessMessage('Account created successfully!');
        setTimeout(() => navigate('/customer-portal'), 1500);
        
        return true;
      } else {
        setGeneralError(data.error || 'Registration failed. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      setGeneralError('Network error. Please check if server is running.');
      return false;
    }
  };

  // ========== SUBMIT HANDLER ==========
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setSuccessMessage('');

    const foundErrors = validateAll();
    if (Object.keys(foundErrors).length > 0) {
      const allTouched = { phone: true, password: true };
      if (!isLogin) { 
        allTouched.name = true; 
        allTouched.city = true; 
        allTouched.email = true;
        allTouched.cnic = true;
      }
      setTouched(allTouched);
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (isLogin) {
        await handleLogin(
          formData.phone,
          formData.password
        );
      } else {
        await handleRegister(formData);
      }
    } catch (err) {
      console.error(err);
      setGeneralError(err.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========== TOGGLE LOGIN/SIGNUP ==========
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setTouched({});
    setGeneralError('');
    setSuccessMessage('');
    setFormData({ phone: '', password: '', name: '', city: '', email: '', cnic: '' });
  };

  return (
    <div className="customer-portal-wrapper">
      {/* Hero Section */}
      <div className="portal-hero">
        <div className="hero-particles"></div>
        <div className="container">
          <div className={`hero-content ${animateIn ? 'animate-in' : ''}`}>
            <div className="hero-badge">
              <span className="badge-icon">🏆</span>
              <span className="badge-text">Pakistan's #1 Service Marketplace</span>
            </div>
            
            <h1 className="hero-title">
              <span className="title-dastak">DASTAK</span>
              <span className="title-urdu">دستک</span>
              <span className="title-registered">®</span>
            </h1>
            
            <p className="hero-subtitle">
              <span className="subtitle-highlight">50,000+ Happy Customers</span> trust us for their service needs
            </p>
            
            <div className="hero-stats">
              {stats.map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className="stat-icon">{stat.icon}</div>
                  <div className="stat-content">
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="portal-main">
        <div className="container">
          <div className="portal-grid">
            {/* Left Column - Features */}
            <div className="portal-features-section">
              <div className="features-header">
                <h2>Why Choose DASTAK?</h2>
                <p>Experience the best service marketplace in Pakistan</p>
              </div>

              <div className="features-list">
                {features.map((feature, index) => (
                  <div key={index} className="feature-card">
                    <div className="feature-icon">{feature.icon}</div>
                    <div className="feature-content">
                      <h3>{feature.title}</h3>
                      <p>{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="testimonial-card">
                <div className="testimonial-avatar">👩</div>
                <div className="testimonial-content">
                  <p className="testimonial-text">
                    "Found a plumber within 30 minutes! Fixed my leaking pipe for just ₹1,800. Amazing service!"
                  </p>
                  <p className="testimonial-author">— Sara Khan, Lahore</p>
                  <div className="testimonial-rating">
                    <FaStar /> <FaStar /> <FaStar /> <FaStar /> <FaStar />
                  </div>
                </div>
              </div>

              <div className="app-promo">
                <FaMobile className="app-icon" />
                <div className="app-content">
                  <h4>Get the DASTAK App</h4>
                  <p>Post requests and track orders on the go</p>
                  <div className="app-buttons">
                    <span className="app-badge">App Store</span>
                    <span className="app-badge">Google Play</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Auth Form */}
            <div className="portal-auth-section">
              <div className="auth-card">
                {/* Tabs */}
                <div className="auth-tabs">
                  <button 
                    className={`auth-tab ${isLogin ? 'active' : ''}`}
                    onClick={() => setIsLogin(true)}
                  >
                    <FaUser /> Login
                  </button>
                  <button 
                    className={`auth-tab ${!isLogin ? 'active' : ''}`}
                    onClick={() => setIsLogin(false)}
                  >
                    <FaUser /> Sign Up
                  </button>
                </div>

                {/* Form */}
                <div className="auth-form">
                  <h2>{isLogin ? 'Welcome Back!' : 'Create Account'}</h2>
                  <p className="form-subtitle">
                    {isLogin ? 'Login to access your account' : 'Join thousands of satisfied customers'}
                  </p>
                  
                  {generalError && (
                    <div className="error-message">
                      <span>⚠️</span> {generalError}
                    </div>
                  )}
                  
                  {successMessage && (
                    <div className="success-message">
                      <FaCheckCircle /> {successMessage}
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit}>
                    {/* Phone Field - Always shown */}
                    <div className="input-group">
                      <label>
                        <FaPhone className="input-icon" />
                        <span>Phone Number</span>
                      </label>
                      <div className="input-wrapper">
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="03XX-XXXXXXX"
                          className={errors.phone ? 'error' : ''}
                        />
                      </div>
                      {errors.phone && <span className="error-text">{errors.phone}</span>}
                      <small className="input-hint">Format: 03XX-XXXXXXX</small>
                    </div>

                    {/* Registration Fields */}
                    {!isLogin && (
                      <>
                        <div className="form-row">
                          <div className="input-group">
                            <label>
                              <FaUser className="input-icon" />
                              <span>Full Name</span>
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              placeholder="Your full name"
                              className={errors.name ? 'error' : ''}
                            />
                            {errors.name && <span className="error-text">{errors.name}</span>}
                          </div>

                          <div className="input-group">
                            <label>
                              <FaEnvelope className="input-icon" />
                              <span>Email</span>
                            </label>
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

                        <div className="form-row">
                          <div className="input-group">
                            <label>
                              <FaIdCard className="input-icon" />
                              <span>CNIC</span>
                            </label>
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

                          <div className="input-group">
                            <label>
                              <FaMapMarkerAlt className="input-icon" />
                              <span>City</span>
                            </label>
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
                      </>
                    )}

                    {/* Password Field */}
                    <div className="input-group">
                      <label>
                        <FaLock className="input-icon" />
                        <span>Password</span>
                      </label>
                      <div className="input-wrapper password-wrapper">
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

                    {/* Login Options */}
                    {isLogin && (
                      <div className="form-options">
                        <label className="checkbox-label">
                          <input type="checkbox" /> Remember me
                        </label>
                        <a href="/forgot-password" className="forgot-link">Forgot Password?</a>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button 
                      type="submit" 
                      className={`submit-btn ${!isLogin ? 'register-btn' : ''}`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <FaSpinner className="spin" /> Processing...
                        </>
                      ) : (
                        <>
                          {isLogin ? 'Login' : 'Create Account'} <FaArrowRight />
                        </>
                      )}
                    </button>

                    {/* Social Login (Optional) */}
                    {isLogin && (
                      <div className="social-login">
                        <p>Or continue with</p>
                        <div className="social-icons">
                          <FaGoogle />
                          <FaFacebook />
                          <FaWhatsapp />
                        </div>
                      </div>
                    )}
                  </form>

                  {/* Toggle between Login/Signup */}
                  <div className="auth-footer">
                    <p>
                      {isLogin ? "Don't have an account? " : "Already have an account? "}
                      <button onClick={toggleMode}>
                        {isLogin ? 'Sign Up' : 'Login'}
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .customer-portal-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Hero Section */
        .portal-hero {
          position: relative;
          background: linear-gradient(145deg, #0f172a, #1e293b);
          padding: 80px 0;
          overflow: hidden;
        }

        .hero-particles {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: radial-gradient(#3498db20 1px, transparent 1px);
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

        .hero-content {
          text-align: center;
          color: white;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s ease;
        }

        .hero-content.animate-in {
          opacity: 1;
          transform: translateY(0);
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 20px;
          background: rgba(255,255,255,0.1);
          border-radius: 40px;
          margin-bottom: 30px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
        }

        .badge-icon {
          font-size: 18px;
        }

        .badge-text {
          font-size: 14px;
          font-weight: 500;
          color: #e2e8f0;
        }

        .hero-title {
          margin: 0 0 20px;
          font-size: 56px;
          font-weight: 800;
        }

        .title-dastak {
          color: white;
          letter-spacing: 2px;
        }

        .title-urdu {
          color: #94a3b8;
          font-size: 42px;
          font-family: 'Noto Nastaliq Urdu', serif;
          margin-left: 8px;
        }

        .title-registered {
          color: #64748b;
          font-size: 20px;
          vertical-align: super;
          margin-left: 4px;
        }

        .hero-subtitle {
          font-size: 18px;
          color: #94a3b8;
          margin-bottom: 40px;
        }

        .subtitle-highlight {
          color: #3498db;
          font-weight: 600;
        }

        .hero-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          max-width: 800px;
          margin: 0 auto;
        }

        .stat-card {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.3s;
        }

        .stat-card:hover {
          background: rgba(255,255,255,0.1);
          transform: translateY(-4px);
        }

        .stat-icon {
          font-size: 28px;
          color: #3498db;
        }

        .stat-content {
          text-align: left;
        }

        .stat-value {
          font-size: 20px;
          font-weight: 700;
          color: white;
          line-height: 1.2;
        }

        .stat-label {
          font-size: 12px;
          color: #94a3b8;
        }

        /* Main Content */
        .portal-main {
          padding: 60px 0;
        }

        .portal-grid {
          display: grid;
          grid-template-columns: 1fr 500px;
          gap: 40px;
          align-items: start;
        }

        /* Features Section */
        .portal-features-section {
          background: white;
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.02);
          border: 1px solid #e2e8f0;
        }

        .features-header h2 {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 8px;
        }

        .features-header p {
          font-size: 16px;
          color: #64748b;
          margin: 0 0 30px;
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 30px;
        }

        .feature-card {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 16px;
          transition: all 0.3s;
        }

        .feature-card:hover {
          background: white;
          box-shadow: 0 8px 20px rgba(0,0,0,0.04);
          transform: translateX(4px);
        }

        .feature-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(145deg, #3498db10, #2980b910);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3498db;
          font-size: 24px;
          flex-shrink: 0;
        }

        .feature-content h3 {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 4px;
        }

        .feature-content p {
          font-size: 14px;
          color: #64748b;
          margin: 0;
          line-height: 1.5;
        }

        /* Testimonial */
        .testimonial-card {
          background: linear-gradient(145deg, #0f172a, #1e293b);
          border-radius: 16px;
          padding: 30px;
          margin-bottom: 30px;
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }

        .testimonial-avatar {
          width: 60px;
          height: 60px;
          background: #3498db;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          color: white;
          flex-shrink: 0;
        }

        .testimonial-text {
          color: white;
          font-size: 15px;
          line-height: 1.6;
          margin: 0 0 12px;
          font-style: italic;
        }

        .testimonial-author {
          color: #94a3b8;
          font-size: 13px;
          margin: 0 0 8px;
        }

        .testimonial-rating {
          color: #f59e0b;
          display: flex;
          gap: 2px;
        }

        /* App Promo */
        .app-promo {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: #f0f9ff;
          border-radius: 16px;
          border: 1px solid #b8e1ff;
        }

        .app-icon {
          font-size: 40px;
          color: #3498db;
        }

        .app-content h4 {
          font-size: 16px;
          font-weight: 600;
          color: #0369a1;
          margin: 0 0 4px;
        }

        .app-content p {
          font-size: 13px;
          color: #0284c7;
          margin: 0 0 12px;
        }

        .app-buttons {
          display: flex;
          gap: 8px;
        }

        .app-badge {
          padding: 6px 12px;
          background: white;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          color: #0284c7;
          border: 1px solid #7dd3fc;
        }

        /* Auth Section */
        .portal-auth-section {
          position: sticky;
          top: 100px;
        }

        .auth-card {
          background: white;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.04);
          border: 1px solid #e2e8f0;
        }

        .auth-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 32px;
          padding: 4px;
          background: #f8fafc;
          border-radius: 12px;
        }

        .auth-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border: none;
          background: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          transition: all 0.3s;
        }

        .auth-tab.active {
          background: white;
          color: #3498db;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }

        .auth-form h2 {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 8px;
        }

        .form-subtitle {
          color: #64748b;
          font-size: 14px;
          margin: 0 0 24px;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: #fef2f2;
          color: #dc2626;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
          border: 1px solid #fee2e2;
        }

        .success-message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: #d4edda;
          color: #059669;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
          border: 1px solid #c3e6cb;
        }

        .input-group {
          margin-bottom: 20px;
        }

        .input-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #334155;
        }

        .input-icon {
          color: #3498db;
          font-size: 14px;
        }

        .input-wrapper {
          position: relative;
        }

        .input-wrapper input,
        .input-group input,
        .input-group select {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 15px;
          transition: all 0.2s;
          background: #f8fafc;
        }

        .input-wrapper input:focus,
        .input-group input:focus,
        .input-group select:focus {
          border-color: #3498db;
          outline: none;
          background: white;
        }

        .input-wrapper input.error,
        .input-group input.error,
        .input-group select.error {
          border-color: #dc2626;
        }

        .error-text {
          display: block;
          margin-top: 4px;
          color: #dc2626;
          font-size: 12px;
        }

        .password-wrapper {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          font-size: 16px;
        }

        .input-hint {
          display: block;
          margin-top: 6px;
          font-size: 12px;
          color: #94a3b8;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 0;
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 20px 0;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #475569;
          cursor: pointer;
        }

        .forgot-link {
          color: #3498db;
          font-size: 14px;
          text-decoration: none;
        }

        .forgot-link:hover {
          text-decoration: underline;
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(145deg, #3498db, #2980b9);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s;
          box-shadow: 0 4px 12px rgba(52,152,219,0.3);
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(52,152,219,0.4);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .register-btn {
          background: linear-gradient(145deg, #10b981, #059669);
          box-shadow: 0 4px 12px rgba(16,185,129,0.3);
        }

        .register-btn:hover:not(:disabled) {
          box-shadow: 0 8px 20px rgba(16,185,129,0.4);
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .social-login {
          margin-top: 24px;
          text-align: center;
        }

        .social-login p {
          color: #64748b;
          font-size: 13px;
          margin-bottom: 12px;
          position: relative;
        }

        .social-login p::before,
        .social-login p::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 30%;
          height: 1px;
          background: #e2e8f0;
        }

        .social-login p::before {
          left: 0;
        }

        .social-login p::after {
          right: 0;
        }

        .social-icons {
          display: flex;
          justify-content: center;
          gap: 16px;
        }

        .social-icons svg {
          font-size: 24px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.3s;
        }

        .social-icons svg:hover {
          color: #3498db;
          transform: translateY(-2px);
        }

        .auth-footer {
          text-align: center;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
        }

        .auth-footer p {
          color: #64748b;
          font-size: 14px;
          margin: 0;
        }

        .auth-footer button {
          background: none;
          border: none;
          color: #3498db;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
          text-decoration: underline;
        }

        .auth-footer button:hover {
          color: #2980b9;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .portal-grid {
            grid-template-columns: 1fr;
          }

          .portal-auth-section {
            position: static;
          }

          .hero-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .hero-title {
            font-size: 48px;
          }

          .title-urdu {
            font-size: 36px;
          }
        }

        @media (max-width: 768px) {
          .portal-hero {
            padding: 60px 0;
          }

          .hero-title {
            font-size: 40px;
          }

          .title-urdu {
            font-size: 30px;
          }

          .hero-stats {
            grid-template-columns: 1fr;
            max-width: 400px;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .testimonial-card {
            flex-direction: column;
            text-align: center;
          }

          .testimonial-avatar {
            margin: 0 auto;
          }

          .app-promo {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomerLogin;