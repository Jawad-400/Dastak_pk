import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTools, FaUserShield, FaChartLine } from 'react-icons/fa';
import CITIES from '../data/pakistanCities';

const cities = CITIES;

const ProviderPortal = () => {
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    alert('Login successful! Redirecting to dashboard...');
    navigate('/provider-dashboard');
  };

  const [regData, setRegData] = useState({
    fullName: '',
    phone: '',
    serviceType: '',
    cnic: '',
    city: '',
    address: ''
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

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

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');

    // basic validation
    if (!regData.fullName || !regData.phone || !regData.serviceType || !regData.cnic || !regData.city) {
      setRegisterError('Please fill all required fields (Name, Phone, Service, CNIC, City).');
      return;
    }

    // simulate submission
    console.log('Provider registration payload:', { ...regData, photoPreview });
    setRegisterSuccess('Registration submitted! Verification in 24 hours.');
    setRegData({ fullName: '', phone: '', serviceType: '', cnic: '', city: '', address: '' });
    setPhotoPreview(null);
    setActiveTab('login');
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
                <form onSubmit={handleLoginSubmit}>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" placeholder="03XX-XXXXXXX" required />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input type="password" placeholder="Enter password" required />
                  </div>
                  <button type="submit" className="btn btn-primary btn-large">
                    Login to Dashboard
                  </button>
                </form>
              </div>
            ) : (
              <div className="register-form">
                <h2>Provider Registration</h2>
                {registerError && <div className="form-error">{registerError}</div>}
                {registerSuccess && <div className="form-success">{registerSuccess}</div>}
                <form onSubmit={handleRegisterSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input type="text" name="fullName" value={regData.fullName} onChange={handleRegisterChange} placeholder="Your full name" required />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input type="tel" name="phone" value={regData.phone} onChange={handleRegisterChange} placeholder="03XX-XXXXXXX" required />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>CNIC / ID Card Number</label>
                      <input type="text" name="cnic" value={regData.cnic} onChange={handleRegisterChange} placeholder="XXXXX-XXXXXXX-X" required />
                    </div>

                    <div className="form-group">
                      <label>City</label>
                      <select name="city" value={regData.city} onChange={handleRegisterChange} required>
                        <option value="">Select City</option>
                        {cities.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Service Type</label>
                    <select name="serviceType" value={regData.serviceType} onChange={handleRegisterChange} required>
                      <option value="">Select Service</option>
                      <option value="plumber">Plumber</option>
                      <option value="electrician">Electrician</option>
                      <option value="painter">Painter</option>
                      <option value="mechanic">Mechanic</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Address / Location</label>
                    <input type="text" name="address" value={regData.address} onChange={handleRegisterChange} placeholder="Area, street, or landmark" />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Upload Profile Photo</label>
                      <input type="file" accept="image/*" onChange={handlePhotoChange} />
                      {photoPreview && <div className="image-preview"><img src={photoPreview} alt="Preview" /></div>}
                    </div>
                    <div className="form-group">
                      <label>Upload CNIC (Front)</label>
                      <input type="file" accept="image/*" />
                      <small>Upload clear photo of your CNIC front side</small>
                    </div>
                  </div>

                  <div className="form-terms">
                    <input type="checkbox" id="provider-terms" required />
                    <label htmlFor="provider-terms">I confirm that the above information is accurate</label>
                  </div>

                  <button type="submit" className="btn btn-worker btn-large">Submit Registration</button>
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