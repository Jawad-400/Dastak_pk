import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaTools, FaUserShield, FaChartLine, FaPhone, FaLock,
  FaEnvelope, FaUser, FaMapMarkerAlt, FaIdCard, FaCamera,
  FaCheckCircle, FaArrowRight, FaStar, FaShieldAlt,
  FaCreditCard, FaClock, FaUsers, FaHandsHelping,
  FaEye, FaEyeSlash, FaSpinner, FaWhatsapp,
  FaFacebook, FaTwitter, FaLinkedin, FaInstagram
} from 'react-icons/fa';
import { socket } from '../Services/socket';
import CITIES from '../data/pakistanCities';
import { SERVICE_TYPES } from '../components/serviceTypes';

const cities = CITIES;

// Statistics data for the hero section
const stats = [
  { value: '10,000+', label: 'Active Providers', icon: <FaUsers /> },
  { value: '25,000+', label: 'Jobs Completed', icon: <FaCheckCircle /> },
  { value: '4.9/5', label: 'Provider Rating', icon: <FaStar /> },
  { value: '₨ 45K', label: 'Avg. Monthly Earnings', icon: <FaChartLine /> }
];

// Features list
const features = [
  { icon: <FaShieldAlt />, title: 'Verified Platform', description: '100% verified customers and secure payments' },
  { icon: <FaHandsHelping />, title: 'Instant Jobs', description: 'Get real-time job notifications in your area' },
  { icon: <FaCreditCard />, title: 'Quick Payments', description: 'Receive payments directly to your account' },
  { icon: <FaClock />, title: 'Flexible Hours', description: 'Work on your own schedule, choose your jobs' }
];

const ProviderPortal = () => {
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // ========== REFS TO PREVENT DUPLICATE CONNECTIONS ==========
  const hasConnected = useRef(false);
  const connectionInProgress = useRef(false);

  // ========== LOGIN STATE - PHONE ONLY ==========
  const [loginData, setLoginData] = useState({
    phone: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // ========== REGISTER STATE ==========
  const [regData, setRegData] = useState({
    fullName: '',
    email: '',
    phone: '',
    serviceType: '',
    cnic: '',
    city: '',
    address: ''
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [cnicPreview, setCnicPreview] = useState(null);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Animation states
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setAnimateIn(true);
  }, []);

  // ========== LOGIN HANDLER ==========
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');
    setIsLoggingIn(true);
  
    try {
      // Validate phone
      if (!loginData.phone) {
        setLoginError('Please enter your phone number');
        setIsLoggingIn(false);
        return;
      }
  
      // Validate password
      if (!loginData.password) {
        setLoginError('Please enter your password');
        setIsLoggingIn(false);
        return;
      }
  
      // Clean phone number
      const cleanPhone = loginData.phone.replace(/\D/g, '');
  
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: cleanPhone,
          password: loginData.password 
        })
      });
  
      const data = await response.json();
  
      if (data.success) {
        const { user, token } = data.data;
  
        // ✅ CRITICAL: Verify user is a provider
        if (user.user_type !== 'provider') {
          setLoginError('This account is not registered as a service provider');
          setIsLoggingIn(false);
          
          // Clear any existing provider data
          localStorage.removeItem('provider_service');
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          return;
        }
  
        // ✅ CLEAR ANY EXISTING SESSION FIRST
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('provider_service');
        
        // Wait a moment for clear to complete
        await new Promise(resolve => setTimeout(resolve, 50));
  
        // ✅ STORE PROVIDER DATA - FORCE provider type
        const providerData = {
          id: user.id,
          name: user.name,
          user_type: 'provider', // ✅ FORCED - IMPORTANT!
          phone: user.phone,
          email: user.email || '',
          service: user.service || loginData.service || 'electrical',
          verified: user.verified || true,
          created_at: user.created_at || new Date().toISOString()
        };
  
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(providerData));
        
        // Store provider service separately
        if (user.service) {
          localStorage.setItem('provider_service', user.service);
        } else if (loginData.service) {
          localStorage.setItem('provider_service', loginData.service);
        }
  
        console.log('✅ Provider logged in:', {
          name: user.name,
          id: user.id,
          type: 'provider',
          service: user.service || loginData.service
        });
  
        // ✅ VERIFY STORAGE
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('📦 Stored user data:', {
          id: storedUser.id,
          name: storedUser.name,
          user_type: storedUser.user_type,
          service: storedUser.service
        });
  
        // ✅ DISCONNECT EXISTING WEBSOCKET
        if (socket && socket.disconnect) {
          socket.disconnect();
          await new Promise(resolve => setTimeout(resolve, 100));
        }
  
        // ✅ UPDATE WEBSOCKET AUTHENTICATION
        if (socket && socket.updateAuth) {
          socket.updateAuth({
            id: user.id,
            name: user.name,
            user_type: 'provider', // ✅ FORCED
            token: token,
            service: user.service || loginData.service || 'all'
          });
          
          console.log('🔌 WebSocket auth updated for provider:', user.name);
          
          // ✅ CONNECT WEBSOCKET WITH DELAY
          setTimeout(() => {
            console.log('🔌 Connecting WebSocket...');
            socket.connect();
            
            // Verify connection after 1 second
            setTimeout(() => {
              if (socket.isConnected()) {
                console.log('✅ WebSocket connected successfully');
                // Request pending requests
                socket.send('get_pending_requests');
              } else {
                console.warn('⚠️ WebSocket connection failed');
              }
            }, 1000);
          }, 500);
        }
  
        setLoginSuccess('Login successful! Redirecting to dashboard...');
        
        // Redirect to provider dashboard
        setTimeout(() => {
          navigate('/provider-dashboard');
        }, 1500);
        
      } else {
        setLoginError(data.error || 'Invalid phone number or password');
        setIsLoggingIn(false);
      }
      
    } catch (error) {
      console.error('❌ Login error:', error);
      setLoginError('Network error. Please check if server is running.');
      setIsLoggingIn(false);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // ========== REGISTER HANDLER ==========
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    setIsRegistering(true);

    if (!regData.fullName || !regData.email || !regData.phone || !regData.serviceType || !regData.cnic || !regData.city) {
      setRegisterError('Please fill all required fields');
      setIsRegistering(false);
      return;
    }

    const phoneDigits = regData.phone.replace(/\D/g, '');
    if (!/^03\d{9}$/.test(phoneDigits)) {
      setRegisterError('Please enter a valid Pakistani phone number (03XXXXXXXXX)');
      setIsRegistering(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regData.email)) {
      setRegisterError('Please enter a valid email address');
      setIsRegistering(false);
      return;
    }

    const cnicRegex = /^\d{5}-\d{7}-\d$/;
    if (!cnicRegex.test(regData.cnic)) {
      setRegisterError('CNIC must be in format: 12345-1234567-1');
      setIsRegistering(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regData.fullName,
          email: regData.email,
          phone: phoneDigits,
          password: '123456',
          user_type: 'provider',
          service: regData.serviceType,
          city: regData.city,
          cnic: regData.cnic,
          address: regData.address || ''
        })
      });

      const data = await response.json();

      if (data.success) {
        const { user, token } = data.data;

        localStorage.clear();

        const providerData = {
          id: user.id,
          name: user.name,
          user_type: 'provider',
          phone: user.phone,
          email: user.email || '',
          service: user.service || regData.serviceType,
          verified: true,
          created_at: user.created_at || new Date().toISOString()
        };

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(providerData));
        localStorage.setItem('provider_service', regData.serviceType);

        hasConnected.current = false;
        connectionInProgress.current = false;

        if (socket && socket.updateAuth) {
          socket.updateAuth({
            id: user.id,
            name: user.name,
            user_type: 'provider',
            token: token,
            service: regData.serviceType
          });
          console.log('✅ WebSocket auth updated for new provider:', user.name);
          
          setTimeout(() => {
            if (!connectionInProgress.current && !hasConnected.current) {
              connectionInProgress.current = true;
              socket.connect();
              
              setTimeout(() => {
                connectionInProgress.current = false;
                if (socket.isConnected()) {
                  hasConnected.current = true;
                  console.log('✅ WebSocket connected successfully');
                }
              }, 1500);
            }
          }, 500);
        }

        setRegisterSuccess('Registration successful! Redirecting to dashboard...');
        
        setRegData({
          fullName: '',
          email: '',
          phone: '',
          serviceType: '',
          cnic: '',
          city: '',
          address: ''
        });
        setPhotoPreview(null);
        setCnicPreview(null);
        
        setTimeout(() => {
          navigate('/provider-dashboard');
        }, 1500);
      } else {
        setRegisterError(data.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setRegisterError('Network error. Please check if server is running.');
    } finally {
      setIsRegistering(false);
    }
  };

  // ========== INPUT HANDLERS ==========
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
    setLoginError('');
    setLoginSuccess('');
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegData({ ...regData, [name]: value });
    setRegisterError('');
    setRegisterSuccess('');
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setRegisterError('Please upload a valid image file for profile photo.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleCnicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setRegisterError('Please upload a valid image file for CNIC.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setCnicPreview(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="provider-portal-wrapper">
      {/* Hero Section with Stats */}
      <div className="portal-hero">
        <div className="hero-particles"></div>
        <div className="container">
          <div className={`hero-content ${animateIn ? 'animate-in' : ''}`}>
            <div className="hero-badge">
              <span className="badge-icon">🚀</span>
              <span className="badge-text">Join Pakistan's Fastest Growing Service Network</span>
            </div>
            
            <h1 className="hero-title">
              <span className="title-dastak">DASTAK</span>
              <span className="title-urdu">دستک</span>
              <span className="title-registered">®</span>
            </h1>
            
            <p className="hero-subtitle">
              <span className="subtitle-highlight">10,000+ Providers</span> are already earning on our platform
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

      {/* Main Portal Content */}
      <div className="portal-main">
        <div className="container">
          <div className="portal-grid">
            {/* Left Column - Features */}
            <div className="portal-features-section">
              <div className="features-header">
                <h2>Why Join DASTAK?</h2>
                <p>Start earning today with Pakistan's most trusted service platform</p>
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
                <div className="testimonial-avatar">👨‍🔧</div>
                <div className="testimonial-content">
                  <p className="testimonial-text">
                    "I've earned over ₨ 85,000 in just 2 months. The best decision I made was joining DASTAK!"
                  </p>
                  <p className="testimonial-author">— Ali Hassan, Plumber</p>
                  <div className="testimonial-rating">
                    <FaStar /> <FaStar /> <FaStar /> <FaStar /> <FaStar />
                  </div>
                </div>
              </div>

              <div className="social-proof">
                <p>Trusted by providers across Pakistan</p>
                <div className="social-icons">
                  <FaFacebook />
                  <FaWhatsapp />
                  <FaTwitter />
                  <FaLinkedin />
                  <FaInstagram />
                </div>
              </div>
            </div>

            {/* Right Column - Auth Forms */}
            <div className="portal-auth-section">
              <div className="auth-card">
                {/* Tabs */}
                <div className="auth-tabs">
                  <button 
                    className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                    onClick={() => setActiveTab('login')}
                  >
                    <FaUserShield /> Login
                  </button>
                  <button 
                    className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
                    onClick={() => setActiveTab('register')}
                  >
                    <FaChartLine /> Register
                  </button>
                </div>

                {/* Login Form */}
                {activeTab === 'login' && (
                  <div className="auth-form login-form">
                    <h2>Welcome Back!</h2>
                    <p className="form-subtitle">Login to access your provider dashboard</p>
                    
                    {loginError && (
                      <div className="error-message">
                        <span>⚠️</span> {loginError}
                      </div>
                    )}
                    
                    {loginSuccess && (
                      <div className="success-message">
                        <FaCheckCircle /> {loginSuccess}
                      </div>
                    )}
                    
                    <form onSubmit={handleLoginSubmit}>
                      <div className="input-group">
                        <label>
                          <FaPhone className="input-icon" />
                          <span>Phone Number</span>
                        </label>
                        <div className="input-wrapper">
                          <input
                            type="tel"
                            name="phone"
                            value={loginData.phone}
                            onChange={handleLoginChange}
                            placeholder="03XX-XXXXXXX"
                            required
                          />
                        </div>
                        <small className="input-hint">Enter your registered phone number</small>
                      </div>

                      <div className="input-group">
                        <label>
                          <FaLock className="input-icon" />
                          <span>Password</span>
                        </label>
                        <div className="input-wrapper password-wrapper">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={loginData.password}
                            onChange={handleLoginChange}
                            placeholder="Enter your password"
                            required
                          />
                          <button 
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      </div>

                      <div className="form-options">
                        <label className="checkbox-label">
                          <input type="checkbox" /> Remember me
                        </label>
                        <a href="/forgot-password" className="forgot-link">Forgot Password?</a>
                      </div>

                      <button 
                        type="submit" 
                        className="submit-btn"
                        disabled={isLoggingIn}
                      >
                        {isLoggingIn ? (
                          <>
                            <FaSpinner className="spin" /> Logging in...
                          </>
                        ) : (
                          <>
                            Login to Dashboard <FaArrowRight />
                          </>
                        )}
                      </button>
                    </form>

                    <div className="auth-footer">
                      <p>Don't have an account? <button onClick={() => setActiveTab('register')}>Register here</button></p>
                    </div>
                  </div>
                )}

                {/* Register Form */}
                {activeTab === 'register' && (
                  <div className="auth-form register-form">
                    <h2>Become a Provider</h2>
                    <p className="form-subtitle">Start earning by joining our network</p>
                    
                    {registerError && (
                      <div className="error-message">
                        <span>⚠️</span> {registerError}
                      </div>
                    )}
                    
                    {registerSuccess && (
                      <div className="success-message">
                        <FaCheckCircle /> {registerSuccess}
                      </div>
                    )}
                    
                    <form onSubmit={handleRegisterSubmit}>
                      <div className="form-row">
                        <div className="input-group">
                          <label>
                            <FaUser className="input-icon" />
                            <span>Full Name</span>
                          </label>
                          <input
                            type="text"
                            name="fullName"
                            value={regData.fullName}
                            onChange={handleRegisterChange}
                            placeholder="Your full name"
                            required
                          />
                        </div>

                        <div className="input-group">
                          <label>
                            <FaEnvelope className="input-icon" />
                            <span>Email</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={regData.email}
                            onChange={handleRegisterChange}
                            placeholder="your@email.com"
                            required
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="input-group">
                          <label>
                            <FaPhone className="input-icon" />
                            <span>Phone</span>
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={regData.phone}
                            onChange={handleRegisterChange}
                            placeholder="03XX-XXXXXXX"
                            required
                          />
                        </div>

                        <div className="input-group">
                          <label>
                            <FaIdCard className="input-icon" />
                            <span>CNIC</span>
                          </label>
                          <input
                            type="text"
                            name="cnic"
                            value={regData.cnic}
                            onChange={handleRegisterChange}
                            placeholder="12345-1234567-1"
                            required
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="input-group">
                          <label>
                            <FaTools className="input-icon" />
                            <span>Service Type</span>
                          </label>
                          <select
  name="serviceType"
  value={regData.serviceType}
  onChange={handleRegisterChange}
  required
>
  <option value="">Select Service</option>
  {SERVICE_TYPES.map(service => (
    <option key={service.value} value={service.value}>
      {service.name}
    </option>
  ))}
</select>
                        </div>

                        <div className="input-group">
                          <label>
                            <FaMapMarkerAlt className="input-icon" />
                            <span>City</span>
                          </label>
                          <select
                            name="city"
                            value={regData.city}
                            onChange={handleRegisterChange}
                            required
                          >
                            <option value="">Select City</option>
                            {cities.map(c => (
                              <option key={c} value={c.toLowerCase()}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="input-group">
                        <label>
                          <FaMapMarkerAlt className="input-icon" />
                          <span>Address (Optional)</span>
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={regData.address}
                          onChange={handleRegisterChange}
                          placeholder="Area, street, or landmark"
                        />
                      </div>

                      <div className="form-row">
                        <div className="input-group file-input">
                          <label>
                            <FaCamera className="input-icon" />
                            <span>Profile Photo</span>
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                          />
                          {photoPreview && (
                            <div className="image-preview">
                              <img src={photoPreview} alt="Preview" />
                            </div>
                          )}
                        </div>

                        <div className="input-group file-input">
                          <label>
                            <FaIdCard className="input-icon" />
                            <span>CNIC Front</span>
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCnicChange}
                          />
                          {cnicPreview && (
                            <div className="image-preview">
                              <img src={cnicPreview} alt="CNIC Preview" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="terms-checkbox">
                        <input type="checkbox" id="provider-terms" required />
                        <label htmlFor="provider-terms">
                          I confirm that the above information is accurate and I agree to the 
                          <a href="/terms"> Terms of Service</a>
                        </label>
                      </div>

                      <button 
                        type="submit" 
                        className="submit-btn register-btn"
                        disabled={isRegistering}
                      >
                        {isRegistering ? (
                          <>
                            <FaSpinner className="spin" /> Processing...
                          </>
                        ) : (
                          <>
                            Register & Start Earning <FaArrowRight />
                          </>
                        )}
                      </button>
                    </form>

                    <div className="auth-footer">
                      <p>Already have an account? <button onClick={() => setActiveTab('login')}>Login here</button></p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        /* All your existing styles remain exactly the same */
        .provider-portal-wrapper {
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

        /* Social Proof */
        .social-proof {
          text-align: center;
          padding: 20px;
          border-top: 1px solid #e2e8f0;
        }

        .social-proof p {
          color: #64748b;
          font-size: 14px;
          margin: 0 0 16px;
        }

        .social-icons {
          display: flex;
          justify-content: center;
          gap: 20px;
          color: #94a3b8;
          font-size: 20px;
        }

        .social-icons svg {
          transition: all 0.3s;
          cursor: pointer;
        }

        .social-icons svg:hover {
          color: #3498db;
          transform: translateY(-2px);
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
          margin-bottom: 24px;
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

        .file-input {
          position: relative;
        }

        .file-input input[type="file"] {
          padding: 8px;
          background: #f8fafc;
          border: 2px dashed #e2e8f0;
          cursor: pointer;
        }

        .image-preview {
          margin-top: 10px;
          border-radius: 8px;
          overflow: hidden;
          max-width: 100px;
        }

        .image-preview img {
          width: 100%;
          height: auto;
          border-radius: 8px;
        }

        .terms-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 20px 0;
          font-size: 14px;
          color: #475569;
        }

        .terms-checkbox a {
          color: #3498db;
          text-decoration: none;
          margin-left: 4px;
        }

        .terms-checkbox a:hover {
          text-decoration: underline;
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

          .stat-card {
            padding: 16px;
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
        }
      `}</style>
    </div>
  );
};

export default ProviderPortal;