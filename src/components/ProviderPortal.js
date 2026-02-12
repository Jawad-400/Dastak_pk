import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTools, FaUserShield, FaChartLine } from 'react-icons/fa';
import { socket } from '../Services/socket';
import CITIES from '../data/pakistanCities';

const cities = CITIES;

const SERVICE_TYPES = [
  'plumbing', 'electrical', 'painting', 'appliance_repair',  // ← CHANGED
  'carpentry', 'ac_repair', 'cleaning', 'mover',
  'gardener', 'security', 'teacher', 'chef',
  'photographer', 'event_planner', 'driver', 'beautician'
];

const ProviderPortal = () => {
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();

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

  // ========== LOGIN HANDLER - PHONE ONLY ==========
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

        // ✅ Verify user is a provider
        if (user.user_type !== 'provider') {
          setLoginError('This account is not registered as a service provider');
          setIsLoggingIn(false);
          return;
        }

        // ✅ STORE USER DATA
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Store provider service
        if (user.service) {
          localStorage.setItem('provider_service', user.service);
        }

        // ✅ UPDATE WEBSOCKET AUTHENTICATION
        if (socket && socket.updateAuth) {
          socket.updateAuth({
            id: user.id,
            name: user.name,
            user_type: 'provider',
            token: token,
            service: user.service || 'all'
          });
          console.log('✅ WebSocket authentication updated for provider:', user.name);
          
          // ✅ CONNECT WEBSOCKET WITH DELAY
          setTimeout(() => socket.connect(), 500);
        }

        setLoginSuccess('Login successful! Redirecting to dashboard...');
        
        // Redirect to provider dashboard
        setTimeout(() => {
          navigate('/provider-dashboard');
        }, 1500);
      } else {
        setLoginError(data.error || 'Invalid phone number or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Network error. Please check if server is running.');
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

    // Basic validation
    if (!regData.fullName || !regData.email || !regData.phone || !regData.serviceType || !regData.cnic || !regData.city) {
      setRegisterError('Please fill all required fields (Name, Email, Phone, Service, CNIC, City).');
      setIsRegistering(false);
      return;
    }

    // Phone validation
    const phoneDigits = regData.phone.replace(/\D/g, '');
    if (!/^03\d{9}$/.test(phoneDigits)) {
      setRegisterError('Please enter a valid Pakistani phone number (03XXXXXXXXX)');
      setIsRegistering(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regData.email)) {
      setRegisterError('Please enter a valid email address');
      setIsRegistering(false);
      return;
    }

    // CNIC validation
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
          password: '123456', // Default password
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

        // ✅ STORE USER DATA
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('provider_service', regData.serviceType);

        // ✅ UPDATE WEBSOCKET AUTHENTICATION
        if (socket && socket.updateAuth) {
          socket.updateAuth({
            id: user.id,
            name: user.name,
            user_type: 'provider',
            token: token,
            service: regData.serviceType
          });
          console.log('✅ WebSocket authentication updated for new provider:', user.name);
          
          // ✅ CONNECT WEBSOCKET WITH DELAY
          setTimeout(() => socket.connect(), 500);
        }

        setRegisterSuccess('Registration successful! Redirecting to dashboard...');
        
        // Clear form
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
        
        // Redirect to provider dashboard
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

  // ========== LOGIN INPUT HANDLER ==========
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
    setLoginError('');
    setLoginSuccess('');
  };

  // ========== REGISTER INPUT HANDLER ==========
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegData({ ...regData, [name]: value });
    setRegisterError('');
    setRegisterSuccess('');
  };

  // ========== PHOTO UPLOAD HANDLER ==========
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

  // ========== CNIC UPLOAD HANDLER ==========
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
    <section id="provider-portal" className="provider-portal">
      <div className="container">
        <div className="portal-header">
          <div className="portal-icon">
            <FaTools />
          </div>
          <h1 className="section-title">Service Provider Portal</h1>
          <p className="section-subtitle">Exclusive platform for verified service professionals</p>
        </div>

        <div className="portal-content">
          <div className="portal-tabs">
            <button 
              className={`portal-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              <FaUserShield /> Provider Login
            </button>
            <button 
              className={`portal-tab ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => setActiveTab('register')}
            >
              <FaChartLine /> New Registration
            </button>
          </div>

          <div className="portal-form-container">
            {activeTab === 'login' ? (
              <div className="login-form">
                <h2>Provider Login</h2>
                
                {/* Login Error Message */}
                {loginError && <div className="form-error">{loginError}</div>}
                
                {/* Login Success Message */}
                {loginSuccess && <div className="form-success">{loginSuccess}</div>}
                
                <form onSubmit={handleLoginSubmit}>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={loginData.phone}
                      onChange={handleLoginChange}
                      placeholder="03XX-XXXXXXX" 
                      required 
                    />
                    <small style={{ color: '#666', fontSize: '12px' }}>Format: 03XXXXXXXXX</small>
                  </div>
                  <div className="form-group">
                    <label>Password *</label>
                    <input 
                      type="password" 
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      placeholder="Enter password" 
                      required 
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-large"
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? 'Logging in...' : 'Login to Dashboard'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="register-form">
                <h2>Provider Registration</h2>
                
                {/* Register Error Message */}
                {registerError && <div className="form-error">{registerError}</div>}
                
                {/* Register Success Message */}
                {registerSuccess && <div className="form-success">{registerSuccess}</div>}
                
                <form onSubmit={handleRegisterSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input 
                        type="text" 
                        name="fullName" 
                        value={regData.fullName} 
                        onChange={handleRegisterChange} 
                        placeholder="Your full name" 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Email Address *</label>
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
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input 
                        type="tel" 
                        name="phone" 
                        value={regData.phone} 
                        onChange={handleRegisterChange} 
                        placeholder="03XX-XXXXXXX" 
                        required 
                      />
                      <small style={{ color: '#666', fontSize: '12px' }}>Format: 03XXXXXXXXX</small>
                    </div>
                    <div className="form-group">
                      <label>CNIC / ID Card Number *</label>
                      <input 
                        type="text" 
                        name="cnic" 
                        value={regData.cnic} 
                        onChange={handleRegisterChange} 
                        placeholder="XXXXX-XXXXXXX-X" 
                        required 
                      />
                      <small style={{ color: '#666', fontSize: '12px' }}>Format: 12345-1234567-1</small>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Service Type *</label>
                      <select 
                        name="serviceType" 
                        value={regData.serviceType} 
                        onChange={handleRegisterChange} 
                        required
                      >
                        <option value="">Select Service</option>
                        {SERVICE_TYPES.map(service => (
                          <option key={service} value={service}>
                            {service.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>City *</label>
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

                  <div className="form-group">
                    <label>Address / Location</label>
                    <input 
                      type="text" 
                      name="address" 
                      value={regData.address} 
                      onChange={handleRegisterChange} 
                      placeholder="Area, street, or landmark" 
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Upload Profile Photo</label>
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
                    <div className="form-group">
                      <label>Upload CNIC (Front)</label>
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
                      <small>Upload clear photo of your CNIC front side</small>
                    </div>
                  </div>

                  <div className="form-terms">
                    <input type="checkbox" id="provider-terms" required />
                    <label htmlFor="provider-terms">
                      I confirm that the above information is accurate and I agree to the 
                      <a href="/terms"> Terms of Service</a>
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-worker btn-large"
                    disabled={isRegistering}
                  >
                    {isRegistering ? 'Processing...' : 'Submit Registration'}
                  </button>
                </form>
              </div>
            )}
          </div>

          <div className="portal-features">
            <h3>Why Join DASTAK Provider Network?</h3>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">💰</div>
                <h4>Earn More</h4>
                <p>Set your own rates and increase earnings</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📱</div>
                <h4>Get Clients</h4>
                <p>Receive verified service requests daily</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">⭐</div>
                <h4>Build Reputation</h4>
                <p>Get rated and build professional profile</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h4>Quick Payments</h4>
                <p>Secure and fast payments</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProviderPortal;