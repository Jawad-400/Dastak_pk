import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaWrench, FaMapMarkerAlt, FaCalendarAlt, 
  FaPhone, FaArrowLeft, FaCheckCircle, 
  FaUser, FaBullhorn, FaSpinner, 
  FaExclamationTriangle, FaPen, FaMoneyBillWave,
  FaBox, FaBolt, FaSnowflake, FaHammer,
  FaPaintBrush, FaBroom, FaTv, FaBug,
  FaTools, FaHome, FaSignInAlt, FaCrosshairs,
  FaStar, FaRegStar
} from 'react-icons/fa';
import { socket } from '../Services/socket';
import { LocationProvider, useLocation } from '../context/LocationContext';
import LeafletMap from '../components/LeafletMap';
import { SERVICE_TYPES } from '../components/serviceTypes';


// Main component wrapped with LocationProvider
const PostRequestWithLocation = () => {
  return (
    <LocationProvider>
      <PostRequest />
    </LocationProvider>
  );
};

const PostRequest = () => {
  const navigate = useNavigate();
  const { userLocation, detectLocation, loading: locationLoading } = useLocation();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [requestId, setRequestId] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [locationCoords, setLocationCoords] = useState(null);
  const [locationAddress, setLocationAddress] = useState('');
  const [formData, setFormData] = useState({
    serviceType: '',
    description: '',
    location: '',
    schedule: 'ASAP',
    budget: '',
    contactNumber: '',
    customerName: '',
  });

  const serviceCategories = SERVICE_TYPES.map(service => ({
    id: service.id,
    name: service.name,
    value: service.value,
    icon: <service.icon />,
    color: service.color,
    description: service.description
  }));

  // Load user and token from localStorage
// Load user and token from localStorage - WITH CRITICAL USER TYPE CHECK
useEffect(() => {
  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  
  if (storedToken && storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      
      // ✅ CRITICAL FIX: ONLY customers can post requests!
      if (parsedUser.user_type !== 'customer') {
        console.error('❌ Provider attempted to post request:', parsedUser.name);
        setError('This account is registered as a provider. Please login with a customer account to post requests.');
        setUser(null);
        setToken('');
        
        // Clear the invalid session
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('provider_service');
        
        // Redirect to customer login
        setTimeout(() => navigate('/customer-login'), 3000);
        return;
      }
      
      // ✅ Valid customer
      setToken(storedToken);
      setUser(parsedUser);
      console.log('✅ Customer verified:', parsedUser.name, parsedUser.user_type);
      
    } catch (error) {
      console.error('❌ Error parsing user:', error);
      setError('Session error. Please login again.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('provider_service');
    }
  } else {
    setError('Please login to post a request');
  }
}, [navigate]); // ✅ Add navigate to dependency

  // WebSocket connection
// In PostRequest.js - FIX SOCKET LISTENERS
// WebSocket connection
useEffect(() => {
  socket.connect();
  
  const handleConnect = () => setSocketConnected(true);
  const handleDisconnect = () => setSocketConnected(false);
  
  // Remove ALL existing listeners first
  socket.off('connected', handleConnect);
  socket.off('disconnected', handleDisconnect);
  socket.off('request_created');
  socket.off('request_accepted');
  
  // Add listeners fresh
  socket.on('connected', handleConnect);
  socket.on('disconnected', handleDisconnect);
  
  socket.on('request_created', (data) => {
    console.log('✅ REQUEST CREATED:', data);
    if (data.data?.requestId === requestId || data.requestId === requestId) {
      // Already showing success from HTTP response
    }
  });
  
  socket.on('request_accepted', (data) => {
    console.log('✅ REQUEST ACCEPTED:', data);
    if (data.data?.requestId === requestId || data.requestId === requestId) {
      alert(`🎉 Your request has been accepted by ${data.data?.providerName || data.providerName}!`);
    }
  });
  
  // Cleanup on unmount
  return () => {
    socket.off('connected', handleConnect);
    socket.off('disconnected', handleDisconnect);
    socket.off('request_created');
    socket.off('request_accepted');
  };
}, [requestId]);
  const handleLocationSelect = (location) => {
    console.log('📍 Location selected:', location); // DEBUG
    
    // ✅ ENSURE coordinates are saved with proper structure
    setLocationCoords({
      lat: Number(location.lat),
      lng: Number(location.lng),
      address: location.address || formData.location
    });
    
    setLocationAddress(location.address || formData.location);
    setFormData({ ...formData, location: location.address || formData.location });
    
    // ✅ Save to localStorage for debugging
    localStorage.setItem('lastSelectedLocation', JSON.stringify({
      lat: Number(location.lat),
      lng: Number(location.lng),
      address: location.address
    }));
  };
  

  const handleDetectLocation = async () => {
    try {
      const position = await detectLocation();
      if (position) {
        setLocationCoords({ lat: position.lat, lng: position.lng });
        setLocationAddress(position.address || 'Your current location');
        setFormData({ ...formData, location: position.address || 'Current location' });
      }
    } catch (error) {
      setError('Could not detect your location. Please search manually.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || user.user_type !== 'customer') {
      setError('Invalid session. Please login as customer.');
      setTimeout(() => navigate('/customer-login'), 2000);
      return;
    }
    if (!formData.serviceType || !formData.description || !formData.location || !formData.customerName || !formData.contactNumber) {
      setError('Please fill all required fields');
      return;
    }
    
    if (!token || !user) {
      setError('Please login first');               
      return;
    }
    
    setError('');
    setLoading(true);
    
    const newRequestId = `req_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    setRequestId(newRequestId);
    
    const selectedCategory = serviceCategories.find(c => c.name === formData.serviceType);
    const serviceTypeValue = selectedCategory ? selectedCategory.value : formData.serviceType.toLowerCase().replace(/\s+/g, '_');
    
    const requestData = {
      title: formData.serviceType,
      description: formData.description,
      location: formData.location,
      locationCoords: locationCoords ? {
        lat: Number(locationCoords.lat),
        lng: Number(locationCoords.lng),
        address: locationAddress
      } : null,
      budget: formData.budget || 'Negotiable',
      customerId: user.id.toString(),
      customerName: formData.customerName,
      serviceType: serviceTypeValue,
      schedule: formData.schedule,
      contact: formData.contactNumber
    };
    
    console.log('📦 Sending request with coordinates:', requestData.locationCoords);
    
    try {
      const response = await fetch('http://localhost:4000/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setRequestId(data.data.id || newRequestId);
        setSuccess(true);
        setLoading(false);
        
        // ✅ Auto-reset form after success
        setTimeout(() => {
          setFormData({
            serviceType: '',
            description: '',
            location: '',
            schedule: 'ASAP',
            budget: '',
            contactNumber: '',
            customerName: '',
          });
          setLocationCoords(null);
          setLocationAddress('');
          setStep(1);
          setSuccess(false);
        }, 5000);
        
      } else {
        setError(data.error || 'Failed to post request');
        setLoading(false);
      }
      
    } catch (err) {
      console.error('❌ Error posting request:', err);
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && (!formData.serviceType || !formData.description)) {
      setError('Please select a service and describe your issue');
      return;
    }
    if (step === 2 && !formData.location) {
      setError('Please enter your location');
      return;
    }
    if (step < 3) setStep(step + 1);
  };

  const handlePrev = () => {
    setError('');
    if (step > 1) setStep(step - 1);
  };

  // If not logged in - Show login prompt
  if (!user) {
    return (
      <div style={styles.loginPromptContainer}>
        <div style={styles.loginPromptCard}>
          <div style={styles.loginIcon}>
            <FaUser size={64} color="#3498db" />
          </div>
          <h2 style={styles.loginTitle}>Login Required</h2>
          <p style={styles.loginMessage}>
            You need to be logged in to post a service request.
          </p>
          <div style={styles.loginButtons}>
            <button
              onClick={() => navigate('/customer-login')}
              style={styles.loginButton}
            >
              <FaSignInAlt /> Login Now
            </button>
            <button
              onClick={() => navigate('/')}
              style={styles.homeButton}
            >
              <FaHome /> Go to Home
            </button>
          </div>
          <p style={styles.loginNote}>
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/customer-login')}
              style={styles.signupLink}
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header Navigation */}
      <div style={styles.navBar}>
        <button 
          onClick={() => navigate('/customer-portal')} 
          style={styles.navButton}
        >
          <FaBox /> My Orders
        </button>
        
        {/* Connection Status */}
        <div style={{
          ...styles.connectionBadge,
          backgroundColor: socketConnected ? '#10b981' : '#ef4444',
        }}>
          <span style={styles.connectionDot} />
          {socketConnected ? 'Live' : 'Offline'}
        </div>
      </div>

      {/* Success Modal */}
      {success && (
        <div style={styles.successOverlay}>
          <div style={styles.successCard}>
            <div style={styles.successIcon}>
              <FaCheckCircle />
            </div>
            <h2 style={styles.successTitle}>Request Posted Successfully!</h2>
            <p style={styles.successText}>Your request has been sent to nearby providers</p>
            <div style={styles.requestIdBadge}>
              #{requestId.slice(-8)}
            </div>
            <p style={styles.successNote}>
              You'll be notified when a provider accepts your request
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!success && (
        <>
          {/* Page Header */}
          <div style={styles.pageHeader}>
            <h1 style={styles.pageTitle}>Post a Service Request</h1>
            <p style={styles.pageSubtitle}>
              {step === 1 && "Select the service you need"}
              {step === 2 && "Tell us where and when"}
              {step === 3 && "Almost done! Confirm your details"}
            </p>
          </div>

          {/* Progress Bar */}
          <div style={styles.progressWrapper}>
            <div style={styles.progressBar}>
              <div style={{...styles.progressFill, width: `${(step/3)*100}%`}} />
            </div>
            <div style={styles.progressSteps}>
              <span style={step >= 1 ? styles.stepActive : styles.stepInactive}>1. Service</span>
              <span style={step >= 2 ? styles.stepActive : styles.stepInactive}>2. Location</span>
              <span style={step >= 3 ? styles.stepActive : styles.stepInactive}>3. Contact</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={styles.errorAlert}>
              <FaExclamationTriangle />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Step 1: Service Selection */}
            {step === 1 && (
              <div style={styles.stepContainer}>
                <h2 style={styles.stepTitle}>
                  <FaWrench style={styles.stepIcon} /> What service do you need?
                </h2>
                <div style={styles.servicesGrid}>
                  {serviceCategories.map(category => (
                    <div
                      key={category.id}
                      onClick={() => setFormData({...formData, serviceType: category.name})}
                      style={{
                        ...styles.serviceCard,
                        border: formData.serviceType === category.name 
                          ? `2px solid ${category.color}` 
                          : '2px solid transparent',
                        background: formData.serviceType === category.name 
                          ? `linear-gradient(145deg, ${category.color}10, white)` 
                          : 'white',
                      }}
                    >
                      <div style={{...styles.serviceIcon, color: category.color}}>
                        {category.icon}
                      </div>
                      <h3 style={styles.serviceName}>{category.name}</h3>
                      <p style={styles.serviceDesc}>{category.description}</p>
                    </div>
                  ))}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <FaPen style={styles.labelIcon} /> Describe your issue in detail
                  </label>
                  <textarea
                    style={styles.textarea}
                    placeholder="Example: My kitchen sink is leaking water. The pipe under the sink needs replacement. I need this fixed urgently."
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>

                <div style={styles.buttonGroup}>
                  <button 
                    type="button" 
                    style={styles.primaryButton} 
                    onClick={handleNext}
                  >
                    Continue to Location
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Location & Schedule */}
            {step === 2 && (
              <div style={styles.stepContainer}>
                <h2 style={styles.stepTitle}>
                  <FaMapMarkerAlt style={styles.stepIcon} /> Where do you need service?
                </h2>
                
                {/* Location Picker with Map */}
                <div style={styles.locationSection}>
                <LeafletMap 
                onLocationSelect={handleLocationSelect}
                initialLocation={locationCoords}
                height="400px"
                />
                  
                  {/* Manual Location Input (Fallback) */}
                  <div style={styles.manualLocationDivider}>
                    <span style={styles.dividerText}>OR</span>
                  </div>
                  
                  <div style={styles.manualLocation}>
                    <input
                      type="text"
                      style={styles.locationInput}
                      placeholder="Enter your complete address manually"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                    <button 
                      type="button"
                      style={styles.detectLocationBtn}
                      onClick={handleDetectLocation}
                      disabled={locationLoading}
                    >
                      <FaCrosshairs /> {locationLoading ? 'Detecting...' : 'Detect'}
                    </button>
                  </div>
                </div>

                <div style={styles.row}>
                  <div style={styles.formGroupHalf}>
                    <label style={styles.label}>
                      <FaCalendarAlt style={styles.labelIcon} /> Preferred Schedule
                    </label>
                    <select
                      style={styles.select}
                      value={formData.schedule}
                      onChange={(e) => setFormData({...formData, schedule: e.target.value})}
                      required
                    >
                      <option value="ASAP">As soon as possible</option>
                      <option value="today">Today</option>
                      <option value="tomorrow">Tomorrow</option>
                      <option value="this-week">This Week</option>
                      <option value="next-week">Next Week</option>
                      <option value="weekend">This Weekend</option>
                    </select>
                  </div>

                  <div style={styles.formGroupHalf}>
                    <label style={styles.label}>
                      <FaMoneyBillWave style={styles.labelIcon} /> Budget (Optional)
                    </label>
                    <input
                      type="text"
                      style={styles.input}
                      placeholder="e.g., 2000"
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    />
                  </div>
                </div>

                <div style={styles.buttonGroup}>
                  <button type="button" style={styles.secondaryButton} onClick={handlePrev}>
                    ← Back
                  </button>
                  <button type="button" style={styles.primaryButton} onClick={handleNext}>
                    Continue to Contact
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Contact Information */}
            {step === 3 && (
              <div style={styles.stepContainer}>
                <h2 style={styles.stepTitle}>
                  <FaUser style={styles.stepIcon} /> Your Contact Information
                </h2>
                
                <div style={styles.row}>
                  <div style={styles.formGroupHalf}>
                    <label style={styles.label}>
                      <FaUser style={styles.labelIcon} /> Your Full Name
                    </label>
                    <input
                      type="text"
                      style={styles.input}
                      placeholder="Asad Khan"
                      value={formData.customerName}
                      onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                      required
                    />
                  </div>

                  <div style={styles.formGroupHalf}>
                    <label style={styles.label}>
                      <FaPhone style={styles.labelIcon} /> Contact Number
                    </label>
                    <input
                      type="tel"
                      style={styles.input}
                      placeholder="03XX-XXXXXXX"
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                      required
                    />
                  </div>
                </div>

                {/* Order Summary Card */}
                <div style={styles.summaryCard}>
                  <h3 style={styles.summaryTitle}>Order Summary</h3>
                  <div style={styles.summaryRow}>
                    <span style={styles.summaryLabel}>Service</span>
                    <span style={styles.summaryValue}>{formData.serviceType}</span>
                  </div>
                  <div style={styles.summaryRow}>
                    <span style={styles.summaryLabel}>Location</span>
                    <span style={styles.summaryValue}>{formData.location}</span>
                  </div>
                  {locationCoords && (
                    <div style={styles.summaryRow}>
                      <span style={styles.summaryLabel}>Coordinates</span>
                      <span style={styles.summaryValue}>
                        {locationCoords.lat.toFixed(6)}, {locationCoords.lng.toFixed(6)}
                      </span>
                    </div>
                  )}
                  <div style={styles.summaryRow}>
                    <span style={styles.summaryLabel}>Schedule</span>
                    <span style={styles.summaryValue}>{formData.schedule}</span>
                  </div>
                  {formData.budget && (
                    <div style={styles.summaryRow}>
                      <span style={styles.summaryLabel}>Budget</span>
                      <span style={styles.summaryValue}>Rs. {formData.budget}</span>
                    </div>
                  )}
                </div>

                <div style={styles.buttonGroup}>
                  <button type="button" style={styles.secondaryButton} onClick={handlePrev}>
                    ← Back
                  </button>
                  <button 
                    type="submit" 
                    style={{
                      ...styles.primaryButton,
                      ...styles.submitButton,
                      opacity: loading ? 0.7 : 1,
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="spin" style={{ marginRight: '8px' }} />
                        Posting...
                      </>
                    ) : (
                      <>
                        <FaBullhorn style={{ marginRight: '8px' }} />
                        Post Request
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
  },
  loginPromptContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '20px',
  },
  loginPromptCard: {
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: '48px',
    textAlign: 'center',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
  },
  loginIcon: {
    marginBottom: '24px',
  },
  loginTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '12px',
  },
  loginMessage: {
    fontSize: '16px',
    color: '#64748b',
    marginBottom: '32px',
    lineHeight: '1.6',
  },
  loginButtons: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
  },
  loginButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 24px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(52,152,219,0.3)',
  },
  homeButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 24px',
    backgroundColor: 'white',
    color: '#475569',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  loginNote: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },
  signupLink: {
    background: 'none',
    border: 'none',
    color: '#3498db',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: '14px',
  },
  navBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: 'white',
    color: '#1e293b',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  },
  connectionBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '30px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  connectionDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'white',
    animation: 'pulse 2s infinite',
  },
  pageHeader: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  pageTitle: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '8px',
  },
  pageSubtitle: {
    fontSize: '18px',
    color: '#64748b',
  },
  progressWrapper: {
    marginBottom: '40px',
    maxWidth: '600px',
    margin: '0 auto 40px',
  },
  progressBar: {
    height: '6px',
    backgroundColor: '#e2e8f0',
    borderRadius: '3px',
    marginBottom: '12px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3498db',
    transition: 'width 0.3s ease',
    borderRadius: '3px',
  },
  progressSteps: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    fontWeight: '500',
  },
  stepActive: {
    color: '#3498db',
    fontWeight: '600',
  },
  stepInactive: {
    color: '#94a3b8',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '30px',
    border: '1px solid #fee2e2',
    fontSize: '15px',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: '40px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.02)',
    border: '1px solid #f1f5f9',
  },
  stepContainer: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  stepTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '30px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  stepIcon: {
    color: '#3498db',
    fontSize: '28px',
  },
  servicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  serviceCard: {
    padding: '24px',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: 'white',
    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
    border: '2px solid transparent',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 24px rgba(0,0,0,0.06)',
    },
  },
  serviceIcon: {
    fontSize: '32px',
    marginBottom: '16px',
  },
  serviceName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '8px',
  },
  serviceDesc: {
    fontSize: '13px',
    color: '#64748b',
    lineHeight: '1.5',
    margin: 0,
  },
  locationSection: {
    marginBottom: '30px',
  },
  manualLocationDivider: {
    position: 'relative',
    textAlign: 'center',
    margin: '20px 0',
  },
  dividerText: {
    background: 'white',
    padding: '0 16px',
    color: '#94a3b8',
    fontSize: '14px',
    fontWeight: '500',
  },
  manualLocation: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  locationInput: {
    flex: 1,
    padding: '14px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '15px',
    transition: 'all 0.2s',
    backgroundColor: '#f8fafc',
  },
  detectLocationBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '0 24px',
    background: 'white',
    color: '#3498db',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  formGroup: {
    marginBottom: '25px',
  },
  formGroupHalf: {
    flex: 1,
  },
  row: {
    display: 'flex',
    gap: '20px',
    marginBottom: '25px',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px',
    fontWeight: '600',
    color: '#334155',
    fontSize: '15px',
  },
  labelIcon: {
    color: '#3498db',
    fontSize: '16px',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '15px',
    transition: 'all 0.2s',
    backgroundColor: '#f8fafc',
    '&:focus': {
      borderColor: '#3498db',
      outline: 'none',
      backgroundColor: 'white',
    },
  },
  textarea: {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '15px',
    fontFamily: 'inherit',
    resize: 'vertical',
    backgroundColor: '#f8fafc',
    transition: 'all 0.2s',
    '&:focus': {
      borderColor: '#3498db',
      outline: 'none',
      backgroundColor: 'white',
    },
  },
  select: {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '15px',
    backgroundColor: '#f8fafc',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:focus': {
      borderColor: '#3498db',
      outline: 'none',
    },
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '16px',
    marginTop: '30px',
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '14px 32px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(52,152,219,0.3)',
    '&:hover': {
      backgroundColor: '#2980b9',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 20px rgba(52,152,219,0.4)',
    },
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '14px 32px',
    backgroundColor: 'white',
    color: '#475569',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#f8fafc',
      borderColor: '#3498db',
    },
  },
  submitButton: {
    backgroundColor: '#10b981',
    boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
    '&:hover': {
      backgroundColor: '#059669',
    },
  },
  summaryCard: {
    backgroundColor: '#f8fafc',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '25px',
    border: '1px solid #e2e8f0',
  },
  summaryTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 16px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #e2e8f0',
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  summaryLabel: {
    color: '#64748b',
    fontSize: '14px',
  },
  summaryValue: {
    color: '#0f172a',
    fontWeight: '600',
    fontSize: '14px',
  },
  successOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  successCard: {
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: '48px',
    textAlign: 'center',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
  },
  successIcon: {
    fontSize: '64px',
    color: '#10b981',
    marginBottom: '24px',
  },
  successTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '12px',
  },
  successText: {
    fontSize: '16px',
    color: '#64748b',
    marginBottom: '20px',
  },
  requestIdBadge: {
    display: 'inline-block',
    padding: '8px 20px',
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    borderRadius: '30px',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '20px',
    fontFamily: 'monospace',
  },
  successNote: {
    fontSize: '14px',
    color: '#94a3b8',
    marginTop: '20px',
  },
};

// Add global pulse animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .spin {
      animation: spin 1s linear infinite;
      display: inline-block;
    }
  `;
  document.head.appendChild(style);
}

export default PostRequestWithLocation;