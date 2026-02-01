import React, { useState } from 'react';
import { FaPhone, FaLock, FaUser, FaMapMarkerAlt } from 'react-icons/fa';
import CITIES from '../data/pakistanCities';
import { useNavigate } from 'react-router-dom';


const cities = CITIES;

const CustomerLogin = ({ onSubmit }) => {
    const navigate = useNavigate(); // ADD THIS LINE

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ phone: '', password: '', name: '', city: '' });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Validation helpers
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

    return '';
  };

  const validateAll = () => {
    const nextErrors = {};
    nextErrors.phone = validateField('phone', formData.phone);
    nextErrors.password = validateField('password', formData.password);
    if (!isLogin) {
      nextErrors.name = validateField('name', formData.name);
      nextErrors.city = validateField('city', formData.city);
    }
    // Filter out empty messages
    Object.keys(nextErrors).forEach((k) => { if (!nextErrors[k]) delete nextErrors[k]; });
    setErrors(nextErrors);
    return nextErrors;
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setSuccessMessage('');

    const foundErrors = validateAll();
    if (Object.keys(foundErrors).length > 0) {
      // mark all fields as touched
      const allTouched = { phone: true, password: true };
      if (!isLogin) { allTouched.name = true; allTouched.city = true; }
      setTouched(allTouched);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = isLogin
        ? { type: 'login', phone: formData.phone.replace(/\D/g, ''), password: formData.password }
        : { type: 'signup', phone: formData.phone.replace(/\D/g, ''), name: formData.name, city: formData.city, password: formData.password };

      const result = onSubmit ? onSubmit(payload) : null;
      if (result && result.then) await result; // support async handlers

      setSuccessMessage(isLogin ? 'Logged in successfully.' : 'Account created successfully.');
      // Optionally clear form on signup
      if (!isLogin) setFormData({ phone: '', password: '', name: '', city: '' });

      // Demo front-end behavior: persist a simple user object and redirect to interactive portal
      const demoUser = { name: formData.name || 'Customer', phone: formData.phone.replace(/\D/g, '') };
      localStorage.setItem('dastak_user', JSON.stringify(demoUser));
      // redirect to interactive customer portal (frontend demo)
navigate('/customer-orders');
    } catch (err) {
      console.error(err);
      setGeneralError(err.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="customer-login small-auth">
      <div className="container">
        <div className="auth-card small">
          <div className="auth-header">
            <h2>{isLogin ? 'Customer Sign In' : 'Create Account'}</h2>
            <p>{isLogin ? 'Sign in with your phone number and password' : 'Create your customer account'}</p>
          </div>

          <div className="auth-tabs">
            <button className={`tab-btn ${isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(true); setErrors({}); setTouched({}); setGeneralError(''); setSuccessMessage(''); }}>Sign In</button>
            <button className={`tab-btn ${!isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(false); setErrors({}); setTouched({}); setGeneralError(''); setSuccessMessage(''); }}>Sign Up</button>
          </div>

          {generalError && <div className="form-error">{generalError}</div>}
          {successMessage && <div className="form-success">{successMessage}</div>}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label><FaPhone /> Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="03XX-XXXXXXX"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.phone && errors.phone && <div className="error-msg">{errors.phone}</div>}
            </div>

            {!isLogin && (
              <>
                <div className="form-group">
                  <label><FaUser /> Full Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.name && errors.name && <div className="error-msg">{errors.name}</div>}
                </div>

                <div className="form-group">
                  <label><FaMapMarkerAlt /> City</label>
                  <select name="city" value={formData.city} onChange={handleChange} onBlur={handleBlur}>
                    <option value="">Select your city</option>
                    {cities.map((c) => (
                      <option key={c} value={c.toLowerCase()}>{c}</option>
                    ))}
                  </select>
                  {touched.city && errors.city && <div className="error-msg">{errors.city}</div>}
                </div>
              </>
            )}

            <div className="form-group">
              <label><FaLock /> Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                minLength={6}
              />
              {touched.password && errors.password && <div className="error-msg">{errors.password}</div>}
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>
              {isSubmitting ? (isLogin ? 'Signing in...' : 'Creating account...') : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="auth-switch">
            {isLogin ? (
              <p>New to DASTAK? <button className="link-btn" onClick={() => setIsLogin(false)}>Create account</button></p>
            ) : (
              <p>Already have an account? <button className="link-btn" onClick={() => setIsLogin(true)}>Sign in here</button></p>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default CustomerLogin;
