import React, { useState } from 'react';
import { FaTools, FaUserTie, FaIdCard, FaPhone, FaMapMarkerAlt, FaBriefcase, FaLock } from 'react-icons/fa';
import CITIES from '../data/pakistanCities';

const cities = CITIES;

const WorkerAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    fullName: '',
    cnic: '',
    serviceType: 'plumber',
    city: '',
    experience: '',
    areas: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      alert('Worker login successful!');
    } else {
      alert('Worker registration submitted! Verification in 24 hours.');
      setIsLogin(true); // Switch to login after registration
    }
  };

  return (
    <section className="worker-auth">
      <div className="container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">
              <FaTools />
            </div>
            <h1>Provider Portal</h1>
            <p>For Service Professionals: Plumbers, Painters, Mechanics, Electricians, etc.</p>
          </div>
          
          <div className="auth-tabs">
            <button 
              className={`auth-tab ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              Provider Login
            </button>
            <button 
              className={`auth-tab ${!isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              Register as Provider
            </button>
          </div>
          
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label><FaPhone /> Phone Number</label>
                <input 
                  type="tel" 
                  name="phone"
                  placeholder="03XX-XXXXXXX"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label><FaLock /> Password</label>
                <input 
                  type="password" 
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
              </div>
            </div>
            
            {!isLogin && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label><FaUserTie /> Full Name</label>
                    <input 
                      type="text" 
                      name="fullName"
                      placeholder="Your full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label><FaIdCard /> CNIC Number</label>
                    <input 
                      type="text" 
                      name="cnic"
                      placeholder="XXXXX-XXXXXXX-X"
                      value={formData.cnic}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Service Type</label>
                    <select 
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleChange}
                      required
                    >
                      <option value="plumber">Plumber</option>
                      <option value="painter">Painter</option>
                      <option value="car-mechanic">Car Mechanic</option>
                      <option value="bike-mechanic">Bike Mechanic</option>
                      <option value="electrician">Electrician</option>
                      <option value="ac-technician">AC Technician</option>
                      <option value="carpenter">Carpenter</option>
                      <option value="cleaner">Cleaner</option>
                      <option value="mason">Mason</option>
                      <option value="appliance-repair">Appliance Repair</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label><FaMapMarkerAlt /> City</label>
                    <select 
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select City</option>
                      {cities.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label><FaBriefcase /> Experience (Years)</label>
                    <input 
                      type="number" 
                      name="experience"
                      placeholder="Years of experience"
                      value={formData.experience}
                      onChange={handleChange}
                      required
                      min="0"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Service Areas</label>
                    <input 
                      type="text" 
                      name="areas"
                      placeholder="Areas you serve (comma separated)"
                      value={formData.areas}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Upload CNIC (Front)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    required
                  />
                  <small>Upload clear photo of your CNIC front side</small>
                </div>
                
                <div className="form-terms">
                  <input type="checkbox" id="worker-terms" required />
                  <label htmlFor="worker-terms">
                    I agree to Provider Terms & Conditions
                  </label>
                </div>
              </>
            )}
            
            <button type="submit" className="btn btn-worker btn-large btn-full">
              {isLogin ? 'Login to Portal' : 'Register as Provider'}
            </button>
          </form>
          
          <div className="auth-switch">
            {isLogin ? (
              <p>
                New to DASTAK? 
                <button onClick={() => setIsLogin(false)}>Register as Provider</button>
              </p>
            ) : (
              <p>
                Already registered? 
                <button onClick={() => setIsLogin(true)}>Login here</button>
              </p>
            )}
          </div>
          
          <div className="worker-benefits">
            <h4>Benefits for Providers:</h4>
            <ul>
              <li>✅ Get verified service requests</li>
              <li>✅ Set your own pricing</li>
              <li>✅ Build your reputation with reviews</li>
              <li>✅ Secure payments</li>
              <li>✅ Work in your preferred areas</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkerAuth;