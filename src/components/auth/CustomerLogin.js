import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../../Services/socket';

const CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Gujranwala', 'Sialkot',
  'Bahawalpur', 'Sargodha', 'Sukkur', 'Larkana', 'Hyderabad'
];

const CustomerLogin = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
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

  // ========== PHONE-ONLY LOGIN HANDLER ==========
  const handleLogin = async (phone, password) => {
    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: phone.replace(/\D/g, ''),
          password 
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
        
        console.log('✅ Customer logged in with phone:', phone);
        
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

  // ========== STYLES ==========
  const styles = {
    container: {
      maxWidth: "1200px",
      margin: "40px auto",
      padding: "0 20px",
      minHeight: "80vh"
    },
    header: {
      textAlign: "center",
      marginBottom: "40px"
    },
    title: {
      fontSize: "2.5rem",
      color: "#2c3e50",
      marginBottom: "10px",
      fontWeight: "700"
    },
    subtitle: {
      fontSize: "1.1rem",
      color: "#7f8c8d"
    },
    card: {
      background: "white",
      borderRadius: "20px",
      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
      padding: "40px",
      maxWidth: "500px",
      margin: "0 auto"
    },
    tabs: {
      display: "flex",
      marginBottom: "30px",
      borderBottom: "2px solid #ecf0f1"
    },
    tabBtn: {
      flex: 1,
      padding: "15px",
      border: "none",
      background: "none",
      fontSize: "1.1rem",
      fontWeight: "600",
      color: "#7f8c8d",
      cursor: "pointer",
      position: "relative"
    },
    activeTab: {
      color: "#3498db",
      borderBottom: "2px solid #3498db"
    },
    form: {
      marginBottom: "30px"
    },
    formGroup: {
      marginBottom: "25px"
    },
    label: {
      display: "block",
      marginBottom: "8px",
      fontWeight: "600",
      color: "#2c3e50",
      fontSize: "0.95rem"
    },
    input: {
      width: "100%",
      padding: "14px",
      border: "2px solid #e0e6ed",
      borderRadius: "10px",
      fontSize: "1rem",
      transition: "all 0.3s",
      boxSizing: "border-box"
    },
    errorInput: {
      borderColor: "#e74c3c"
    },
    errorText: {
      color: "#e74c3c",
      fontSize: "0.85rem",
      marginTop: "5px",
      display: "block"
    },
    hint: {
      color: "#7f8c8d",
      fontSize: "0.85rem",
      marginTop: "5px",
      display: "block"
    },
    submitBtn: {
      width: "100%",
      padding: "16px",
      background: "linear-gradient(135deg, #3498db, #2980b9)",
      color: "white",
      border: "none",
      borderRadius: "10px",
      fontSize: "1.1rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s",
      marginBottom: "20px"
    },
    disabledBtn: {
      opacity: "0.7",
      cursor: "not-allowed"
    },
    footer: {
      textAlign: "center",
      borderTop: "1px solid #ecf0f1",
      paddingTop: "25px"
    },
    switchBtn: {
      background: "none",
      border: "none",
      color: "#3498db",
      fontWeight: "600",
      cursor: "pointer",
      fontSize: "1rem"
    },
    errorMessage: {
      backgroundColor: "#fde8e8",
      color: "#e74c3c",
      padding: "12px",
      borderRadius: "8px",
      marginBottom: "20px",
      textAlign: "center"
    },
    successMessage: {
      backgroundColor: "#e8f5e9",
      color: "#27ae60",
      padding: "12px",
      borderRadius: "8px",
      marginBottom: "20px",
      textAlign: "center"
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Welcome to Dastak.pk</h2>
        <p style={styles.subtitle}>
          {isLogin ? 'Login with your phone number' : 'Create a new account'}
        </p>
      </div>
      
      <div style={styles.card}>
        <div style={styles.tabs}>
          <button 
            style={{...styles.tabBtn, ...(isLogin ? styles.activeTab : {})}}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            style={{...styles.tabBtn, ...(!isLogin ? styles.activeTab : {})}}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>
        
        {generalError && (
          <div style={styles.errorMessage}>
            {generalError}
          </div>
        )}
        
        {successMessage && (
          <div style={styles.successMessage}>
            {successMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Phone Field - ALWAYS FIRST */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="03XX-XXXXXXX"
              style={{...styles.input, ...(errors.phone ? styles.errorInput : {})}}
              autoFocus={isLogin}
            />
            {errors.phone && <span style={styles.errorText}>{errors.phone}</span>}
            <span style={styles.hint}>Format: 03XX-XXXXXXX</span>
          </div>
          
          {!isLogin && (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your full name"
                  style={{...styles.input, ...(errors.name ? styles.errorInput : {})}}
                />
                {errors.name && <span style={styles.errorText}>{errors.name}</span>}
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>CNIC Number *</label>
                <input
                  type="text"
                  name="cnic"
                  value={formData.cnic}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="12345-1234567-1"
                  style={{...styles.input, ...(errors.cnic ? styles.errorInput : {})}}
                />
                {errors.cnic && <span style={styles.errorText}>{errors.cnic}</span>}
                <span style={styles.hint}>Format: XXXXX-XXXXXXX-X</span>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your email"
                  style={{...styles.input, ...(errors.email ? styles.errorInput : {})}}
                />
                {errors.email && <span style={styles.errorText}>{errors.email}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>City *</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{...styles.input, ...(errors.city ? styles.errorInput : {})}}
                >
                  <option value="">Select your city</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city.toLowerCase()}>{city}</option>
                  ))}
                </select>
                {errors.city && <span style={styles.errorText}>{errors.city}</span>}
              </div>
            </>
          )}
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your password"
              style={{...styles.input, ...(errors.password ? styles.errorInput : {})}}
              minLength={6}
            />
            {errors.password && <span style={styles.errorText}>{errors.password}</span>}
            {!isLogin && (
              <span style={styles.hint}>At least 6 characters</span>
            )}
          </div>
          
          {isLogin && (
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px"}}>
              <label style={{display: "flex", alignItems: "center", gap: "8px", color: "#5d6d7e", cursor: "pointer"}}>
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="/forgot-password" style={{color: "#3498db", fontSize: "0.95rem"}}>
                Forgot Password?
              </a>
            </div>
          )}
          
          <button 
            type="submit" 
            style={{...styles.submitBtn, ...(isSubmitting ? styles.disabledBtn : {})}}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span>Processing...</span>
            ) : (
              isLogin ? 'Login with Phone' : 'Create Account'
            )}
          </button>
        </form>
        
        <div style={styles.footer}>
          <p style={{color: "#5d6d7e", marginBottom: "10px"}}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              style={styles.switchBtn}
              onClick={toggleMode}
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;