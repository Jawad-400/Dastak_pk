import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaPhone, FaLock, FaUser, FaMapMarkerAlt, FaEnvelope, FaIdCard,
  FaEye, FaEyeSlash, FaCheckCircle, FaArrowRight, FaSpinner,
  FaShieldAlt, FaClock, FaStar, FaUsers, FaCreditCard,
  FaHandsHelping, FaMobile, FaHome, FaTools,
  FaFacebook, FaGoogle, FaApple, FaSmile, FaGift
} from 'react-icons/fa';
import { socket } from '../../Services/socket';

const CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Gujranwala', 'Sialkot',
  'Bahawalpur', 'Sargodha', 'Sukkur', 'Larkana', 'Hyderabad'
];

const CustomerLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const returnTo = queryParams.get('returnTo') || '/';
  const preSelectedService = queryParams.get('service') || '';

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    name: '',
    email: '',
    city: '',
    cnic: '',
    address: ''
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const testimonials = [
    {
      name: 'Sara Khan',
      location: 'DHA, Lahore',
      text: 'Found a plumber within 30 minutes! Fixed my leaking pipe for just Rs. 1,800. Amazing service!',
      rating: 5,
      service: 'Plumbing'
    },
    {
      name: 'Ahmed Raza',
      location: 'Gulshan, Karachi',
      text: 'Best platform for home services! Got my AC repaired in 2 hours. Professional & affordable.',
      rating: 5,
      service: 'AC Repair'
    },
    {
      name: 'Fatima Akhtar',
      location: 'F-10, Islamabad',
      text: 'The electrician was very professional. Fixed all my wiring issues in no time. Highly recommended!',
      rating: 5,
      service: 'Electrical'
    }
  ];

  useEffect(() => {
    setAnimateIn(true);
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
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
        
        if (user.user_type !== 'customer') {
          setGeneralError('This account is registered as a provider. Please use provider login.');
          return;
        }
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({
          id: user.id,
          name: user.name,
          user_type: 'customer',
          phone: user.phone
        }));
        
        if (socket && socket.updateAuth) {
          socket.updateAuth({
            id: user.id,
            name: user.name,
            user_type: 'customer',
            token: token,
            service: ''
          });
        }
        
        setSuccessMessage(`Welcome back, ${user.name}!`);
        
        setTimeout(() => {
          if (returnTo && returnTo !== '/') {
            navigate(returnTo);
          } else {
            navigate('/customer-portal');
          }
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
          user_type: 'customer',
          city: formData.city,
          cnic: formData.cnic,
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
          user_type: 'customer',
          phone: user.phone
        }));
        
        if (socket && socket.updateAuth) {
          socket.updateAuth({
            id: user.id,
            name: user.name,
            user_type: 'customer',
            token: token,
            service: ''
          });
          
          setTimeout(() => socket.connect(), 500);
        }
        
        setSuccessMessage('Account created successfully!');
        
        setTimeout(() => {
          navigate('/customer-portal');
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
    <div className="customer-login-wrapper">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>

      <div className="container">
        {/* Header */}
        <div className={`login-header ${animateIn ? 'animate-in' : ''}`}>
          <div className="logo-section">
            <h1 className="logo">
              <span className="logo-dastak">DASTAK</span>
              <span className="logo-customer">Customer</span>
            </h1>
            <p className="tagline">Your trusted home service partner</p>
          </div>
          
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-value">50K+</span>
              <span className="stat-label">Happy Customers</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">25K+</span>
              <span className="stat-label">Jobs Done</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">4.9</span>
              <span className="stat-label">Rating</span>
            </div>
          </div>
        </div>

        <div className="main-grid">
          {/* Left Column - Features & Testimonials */}
          <div className={`features-column ${animateIn ? 'animate-in' : ''}`}>
            {/* Welcome Message */}
            <div className="welcome-card">
              <FaSmile className="welcome-icon" />
              <h2>Welcome to Dastak!</h2>
              <p>Find trusted professionals for all your home service needs</p>
              {preSelectedService && (
                <div className="preselected-service">
                  <FaTools />
                  <span>You're looking for: <strong>{preSelectedService}</strong></span>
                </div>
              )}
            </div>

            {/* Customer Benefits */}
            <div className="benefits-grid">
              <div className="benefit-card">
                <div className="benefit-icon verified">
                  <FaShieldAlt />
                </div>
                <h3>Verified Pros</h3>
                <p>All service providers are background checked</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon payment">
                  <FaCreditCard />
                </div>
                <h3>Secure Payment</h3>
                <p>Pay only when job is completed</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon response">
                  <FaClock />
                </div>
                <h3>Quick Response</h3>
                <p>Get quotes within 30 minutes</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon guarantee">
                  <FaHandsHelping />
                </div>
                <h3>Satisfaction</h3>
                <p>100% money-back guarantee</p>
              </div>
            </div>

            {/* Animated Testimonials */}
            <div className="testimonials-section">
              <h3>What Our Customers Say</h3>
              <div className="testimonial-carousel">
                {testimonials.map((testimonial, index) => (
                  <div 
                    key={index}
                    className={`testimonial-slide ${currentTestimonial === index ? 'active' : ''}`}
                  >
                    <div className="testimonial-header">
                      <div className="testimonial-avatar">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div className="testimonial-info">
                        <h4>{testimonial.name}</h4>
                        <p>{testimonial.location}</p>
                      </div>
                    </div>
                    <p className="testimonial-text">"{testimonial.text}"</p>
                    <div className="testimonial-footer">
                      <span className="service-badge">{testimonial.service}</span>
                      <div className="rating">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={i < testimonial.rating ? 'star-filled' : 'star-empty'} />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="carousel-dots">
                {testimonials.map((_, index) => (
                  <span 
                    key={index}
                    className={`dot ${currentTestimonial === index ? 'active' : ''}`}
                    onClick={() => setCurrentTestimonial(index)}
                  />
                ))}
              </div>
            </div>

            {/* App Download */}
            <div className="app-download">
              <FaMobile className="app-icon" />
              <div className="app-text">
                <h4>Get the Dastak App</h4>
                <p>Post requests and track orders on the go</p>
              </div>
              <div className="app-badges">
                <span className="badge"><FaApple /> App Store</span>
                <span className="badge"><FaGoogle /> Play Store</span>
              </div>
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
                  Sign Up
                </button>
              </div>

              {/* Welcome Gift */}
              {!isLogin && (
                <div className="welcome-gift">
                  <FaGift />
                  <span>Get Rs. 200 off on your first service!</span>
                </div>
              )}

              {/* Form Title */}
              <h2 className="form-title">
                {isLogin ? 'Welcome Back!' : 'Create Account'}
              </h2>
              <p className="form-subtitle">
                {isLogin 
                  ? 'Login to access your account'
                  : 'Join as a customer to post service requests'}
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
                    <FaPhone className="input-icon" />
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
                        <FaUser className="input-icon" />
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
                        <FaEnvelope className="input-icon" />
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
                        <FaIdCard className="input-icon" />
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

                    {/* City */}
                    <div className="input-group">
                      <div className="input-icon-wrapper">
                        <FaMapMarkerAlt className="input-icon" />
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
                          <option value="">Select your city</option>
                          {CITIES.map(city => (
                            <option key={city} value={city.toLowerCase()}>{city}</option>
                          ))}
                        </select>
                        {errors.city && <span className="error-text">{errors.city}</span>}
                      </div>
                    </div>

                    {/* Address (Optional) */}
                    <div className="input-group">
                      <div className="input-icon-wrapper">
                        <FaHome className="input-icon" />
                      </div>
                      <div className="input-field">
                        <label>Address (Optional)</label>
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
                    <FaLock className="input-icon" />
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
                      {isLogin ? 'Login to Account' : 'Create Account'} <FaArrowRight />
                    </>
                  )}
                </button>

                {/* Social Login */}
                {isLogin && (
                  <div className="social-login">
                    <p>Or continue with</p>
                    <div className="social-icons">
                      <button className="social-btn google">
                        <FaGoogle /> Google
                      </button>
                      <button className="social-btn facebook">
                        <FaFacebook /> Facebook
                      </button>
                    </div>
                  </div>
                )}
              </form>

              {/* Toggle Link */}
              <div className="toggle-link">
                <p>
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? 'Sign Up' : 'Login'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .customer-login-wrapper {
          min-height: 100vh;
          background: linear-gradient(145deg, #f0f9ff 0%, #e6f2ff 100%);
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

        .bg-shape {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(145deg, #3b82f6, #60a5fa);
          opacity: 0.1;
          filter: blur(60px);
        }

        .shape-1 {
          width: 400px;
          height: 400px;
          top: -100px;
          right: -100px;
          animation: float 20s infinite;
        }

        .shape-2 {
          width: 300px;
          height: 300px;
          bottom: -50px;
          left: -50px;
          animation: float 25s infinite reverse;
        }

        .shape-3 {
          width: 200px;
          height: 200px;
          top: 50%;
          left: 30%;
          animation: float 15s infinite;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }

        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 40px 24px;
          position: relative;
          z-index: 2;
        }

        /* Header */
        .login-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          opacity: 0;
          transform: translateY(-20px);
          transition: all 0.6s ease;
        }

        .login-header.animate-in {
          opacity: 1;
          transform: translateY(0);
        }

        .logo-section {
          display: flex;
          flex-direction: column;
        }

        .logo {
          margin: 0 0 4px;
          font-size: 32px;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logo-dastak {
          background: linear-gradient(145deg, #0f172a, #1e293b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .logo-customer {
          font-size: 18px;
          background: linear-gradient(145deg, #3b82f6, #2563eb);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .tagline {
          color: #64748b;
          font-size: 14px;
          margin: 0;
        }

        .header-stats {
          display: flex;
          gap: 24px;
          background: white;
          padding: 12px 24px;
          border-radius: 40px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-value {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
        }

        .stat-label {
          font-size: 11px;
          color: #64748b;
        }

        /* Main Grid */
        .main-grid {
          display: grid;
          grid-template-columns: 1fr 480px;
          gap: 40px;
        }

        /* Features Column */
        .features-column {
          opacity: 0;
          transform: translateX(-20px);
          transition: all 0.6s ease 0.1s;
        }

        .features-column.animate-in {
          opacity: 1;
          transform: translateX(0);
        }

        .welcome-card {
          background: white;
          border-radius: 24px;
          padding: 32px;
          margin-bottom: 32px;
          box-shadow: 0 8px 24px rgba(59,130,246,0.08);
          border: 1px solid #e2e8f0;
          position: relative;
          overflow: hidden;
        }

        .welcome-card::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 150px;
          height: 150px;
          background: linear-gradient(145deg, #3b82f6, #2563eb);
          opacity: 0.05;
          border-radius: 50%;
          transform: translate(50px, -50px);
        }

        .welcome-icon {
          font-size: 48px;
          color: #3b82f6;
          margin-bottom: 16px;
        }

        .welcome-card h2 {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 8px;
        }

        .welcome-card p {
          font-size: 15px;
          color: #64748b;
          margin: 0 0 16px;
        }

        .preselected-service {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #3b82f610;
          border-radius: 30px;
          color: #3b82f6;
          font-size: 14px;
        }

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }

        .benefit-card {
          background: white;
          padding: 20px;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s;
        }

        .benefit-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(59,130,246,0.1);
          border-color: #3b82f6;
        }

        .benefit-icon {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin-bottom: 12px;
        }

        .benefit-icon.verified { background: #3b82f610; color: #3b82f6; }
        .benefit-icon.payment { background: #10b98110; color: #10b981; }
        .benefit-icon.response { background: #f59e0b10; color: #f59e0b; }
        .benefit-icon.guarantee { background: #ef444410; color: #ef4444; }

        .benefit-card h3 {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 4px;
        }

        .benefit-card p {
          font-size: 13px;
          color: #64748b;
          margin: 0;
          line-height: 1.5;
        }

        /* Testimonials */
        .testimonials-section {
          background: white;
          border-radius: 24px;
          padding: 24px;
          margin-bottom: 32px;
          border: 1px solid #e2e8f0;
        }

        .testimonials-section h3 {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 20px;
        }

        .testimonial-carousel {
          position: relative;
          min-height: 200px;
          margin-bottom: 16px;
        }

        .testimonial-slide {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          opacity: 0;
          transform: translateX(20px);
          transition: all 0.5s ease;
          pointer-events: none;
        }

        .testimonial-slide.active {
          opacity: 1;
          transform: translateX(0);
          pointer-events: auto;
          position: relative;
        }

        .testimonial-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .testimonial-avatar {
          width: 48px;
          height: 48px;
          background: linear-gradient(145deg, #3b82f6, #2563eb);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 18px;
        }

        .testimonial-info h4 {
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 2px;
        }

        .testimonial-info p {
          font-size: 12px;
          color: #64748b;
          margin: 0;
        }

        .testimonial-text {
          font-size: 14px;
          color: #475569;
          line-height: 1.6;
          margin-bottom: 12px;
          font-style: italic;
        }

        .testimonial-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .service-badge {
          padding: 4px 12px;
          background: #3b82f610;
          border-radius: 20px;
          font-size: 12px;
          color: #3b82f6;
          font-weight: 500;
        }

        .rating {
          display: flex;
          gap: 2px;
        }

        .star-filled {
          color: #f59e0b;
          font-size: 12px;
        }

        .star-empty {
          color: #e2e8f0;
          font-size: 12px;
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
          background: #e2e8f0;
          cursor: pointer;
          transition: all 0.3s;
        }

        .dot.active {
          width: 24px;
          background: #3b82f6;
          border-radius: 4px;
        }

        /* App Download */
        .app-download {
          display: flex;
          align-items: center;
          gap: 16px;
          background: linear-gradient(145deg, #0f172a, #1e293b);
          border-radius: 20px;
          padding: 20px;
          color: white;
        }

        .app-icon {
          font-size: 40px;
          color: #3b82f6;
        }

        .app-text {
          flex: 1;
        }

        .app-text h4 {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 4px;
        }

        .app-text p {
          font-size: 12px;
          opacity: 0.8;
          margin: 0;
        }

        .app-badges {
          display: flex;
          gap: 8px;
        }

        .badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          background: rgba(255,255,255,0.1);
          border-radius: 30px;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }

        .badge:hover {
          background: rgba(255,255,255,0.2);
        }

        /* Auth Column */
        .auth-column {
          opacity: 0;
          transform: translateX(20px);
          transition: all 0.6s ease 0.2s;
        }

        .auth-column.animate-in {
          opacity: 1;
          transform: translateX(0);
        }

        .auth-card {
          background: white;
          border-radius: 32px;
          padding: 32px;
          box-shadow: 0 20px 40px rgba(59,130,246,0.1);
          border: 1px solid #e2e8f0;
        }

        .mode-toggle {
          display: flex;
          gap: 8px;
          padding: 4px;
          background: #f8fafc;
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
          color: #64748b;
          cursor: pointer;
          transition: all 0.3s;
        }

        .toggle-btn.active {
          background: white;
          color: #3b82f6;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }

        .welcome-gift {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: linear-gradient(145deg, #f59e0b10, #fbbf2410);
          border: 1px solid #f59e0b20;
          border-radius: 12px;
          margin-bottom: 20px;
          color: #f59e0b;
          font-size: 13px;
          font-weight: 500;
        }

        .form-title {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 8px;
        }

        .form-subtitle {
          font-size: 14px;
          color: #64748b;
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
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fee2e2;
        }

        .message.success {
          background: #d4edda;
          color: #059669;
          border: 1px solid #c3e6cb;
        }

        .input-group {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .input-icon-wrapper {
          width: 48px;
          height: 48px;
          background: #f8fafc;
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
          color: #64748b;
          margin-bottom: 4px;
        }

        .input-field input,
        .input-field select {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          transition: all 0.3s;
          background: white;
        }

        .input-field input:focus,
        .input-field select:focus {
          border-color: #3b82f6;
          outline: none;
          box-shadow: 0 4px 12px rgba(59,130,246,0.1);
        }

        .input-field input.error,
        .input-field select.error {
          border-color: #dc2626;
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
          color: #64748b;
          cursor: pointer;
        }

        .error-text {
          display: block;
          margin-top: 4px;
          color: #dc2626;
          font-size: 11px;
        }

        .input-hint {
          display: block;
          margin-top: 4px;
          color: #94a3b8;
          font-size: 11px;
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
          font-size: 13px;
          color: #475569;
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
          color: #475569;
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

        .social-login {
          margin-top: 24px;
          text-align: center;
        }

        .social-login p {
          color: #64748b;
          font-size: 12px;
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

        .social-login p::before { left: 0; }
        .social-login p::after { right: 0; }

        .social-icons {
          display: flex;
          gap: 12px;
        }

        .social-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          background: white;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }

        .social-btn.google {
          color: #ea4335;
        }

        .social-btn.facebook {
          color: #1877f2;
        }

        .social-btn:hover {
          border-color: #3b82f6;
          background: #f8fafc;
        }

        .toggle-link {
          text-align: center;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
        }

        .toggle-link p {
          color: #64748b;
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

          .login-header {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }

          .benefits-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .benefits-grid {
            grid-template-columns: 1fr;
          }

          .app-download {
            flex-direction: column;
            text-align: center;
          }

          .input-group {
            flex-direction: column;
          }

          .input-icon-wrapper {
            width: 100%;
          }

          .header-stats {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomerLogin;