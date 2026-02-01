import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import { FaTools, FaUserTie, FaIdCard, FaPhone, FaMapMarkerAlt, FaBriefcase, FaLock } from 'react-icons/fa';
import '../styles.css';

const Workerauthworker = () => {
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
      alert('Worker login successful! Redirecting to dashboard...');
      // Redirect to dashboard
    } else {
      alert('Worker registration submitted! Verification in 24 hours.');
    }
  };

  return (
    <div className="App">
      <Header />
      
      <section className="worker-auth">
        <div className="container">
          <div className="auth-card">
            <div className="auth-header">
              <div className="auth-icon">
                <FaTools />
              </div>
              <h1>Provider Portal</h1>
              <p>For Service Professionals: Plumbers, Painters, Mechanics, Electricians</p>
            </div>
            
            {/* Same WorkerAuth form code here */}
            {/* Copy your existing WorkerAuth.js form code */}
            
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Workerauthworker;