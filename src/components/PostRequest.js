import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaWrench, FaMapMarkerAlt, FaCalendarAlt, 
  FaPhone, FaArrowLeft, FaCheckCircle, 
  FaUser, FaBullhorn, FaSpinner, 
  FaExclamationTriangle, FaPen, FaMoneyBillWave,
  FaBox, FaBolt, FaSnowflake, FaHammer,
  FaPaintBrush, FaBroom, FaTv, FaBug,
  FaWifi, FaPlug, FaTools, FaHome, FaSignInAlt
} from 'react-icons/fa';
import { socket } from '../Services/socket';

const PostRequest = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [requestId, setRequestId] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [formData, setFormData] = useState({
    serviceType: '',
    description: '',
    location: '',
    schedule: 'ASAP',
    budget: '',
    contactNumber: '',
    customerName: '',
  });

  const serviceCategories = [
    { id: 1, name: 'Plumbing', value: 'plumbing', icon: <FaWrench />, color: '#007bff', description: 'Pipes, Taps, Toilets, Drainage' },
    { id: 2, name: 'Electrical', value: 'electrical', icon: <FaBolt />, color: '#ffc107', description: 'Wiring, Switches, Fixtures, Lights' },
    { id: 3, name: 'AC Repair', value: 'ac_repair', icon: <FaSnowflake />, color: '#17a2b8', description: 'AC Servicing, Gas Filling, Cooling Issues' },
    { id: 4, name: 'Carpentry', value: 'carpentry', icon: <FaHammer />, color: '#6c5ce7', description: 'Furniture, Doors, Cabinets, Repairing' },
    { id: 5, name: 'Painting', value: 'painting', icon: <FaPaintBrush />, color: '#e83e8c', description: 'Home Painting, Wall Repair, Wall Paneling' },
    { id: 6, name: 'Cleaning', value: 'cleaning', icon: <FaBroom />, color: '#20c997', description: 'Home, Office, Deep Cleaning' },
    { id: 7, name: 'Appliance Repair', value: 'appliance_repair', icon: <FaTv />, color: '#fd7e14', description: 'Washing Machine, Fridge, LCD, Oven' },
    { id: 8, name: 'Pest Control', value: 'pest_control', icon: <FaBug />, color: '#dc3545', description: 'Termite, Cockroach, Mosquito, Fumigation' },
  ];

  // ✅ FIXED: Load user and token from localStorage - NO AUTO REDIRECT!
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    } else {
      setError('Please login to post a request');
      // ❌ NO AUTO REDIRECT - Let user click the login button
    }
  }, []); // Empty dependency array - runs once on mount

  // WebSocket connection
  useEffect(() => {
    socket.connect();
    
    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);
    
    socket.on('connected', handleConnect);
    socket.on('disconnected', handleDisconnect);
    
    socket.on('request_created', (data) => {
      if (data.data?.requestId === requestId || data.requestId === requestId) {
        setSuccess(true);
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
          setStep(1);
          setSuccess(false);
        }, 5000);
      }
    });
    
    socket.on('request_accepted', (data) => {
      if (data.data?.requestId === requestId || data.requestId === requestId) {
        alert(`🎉 Your request has been accepted by ${data.data?.providerName || data.providerName}!`);
      }
    });
    
    return () => {
      socket.off('connected', handleConnect);
      socket.off('disconnected', handleDisconnect);
      socket.off('request_created');
      socket.off('request_accepted');
    };
  }, [requestId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
      budget: formData.budget || 'Negotiable',
      customerId: user.id.toString(),
      serviceType: serviceTypeValue,
      schedule: formData.schedule,
      contact: formData.contactNumber
    };
    
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
        
        if (socket && socket.isConnected()) {
          socket.send('create_request', {
            id: data.data.id || newRequestId,
            title: formData.serviceType,
            description: formData.description,
            location: formData.location,
            budget: formData.budget || 'Negotiable',
            customer_id: user.id.toString(),
            customer_name: formData.customerName,
            service_type: serviceTypeValue,
            schedule: formData.schedule,
            contact_number: formData.contactNumber
          });
        }
        
        setSuccess(true);
        setLoading(false);
      } else {
        setError(data.error || 'Failed to post request');
        setLoading(false);
      }
      
    } catch (err) {
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

  // ✅ If not logged in - Show login prompt with buttons, NO AUTO REDIRECT!
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
        
        {/* Single Connection Status Indicator */}
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
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <FaMapMarkerAlt style={styles.labelIcon} /> Service Location
                  </label>
                  <input
                    type="text"
                    style={styles.input}
                    placeholder="House/Street number, Area, City, Landmarks"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                  />
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

      {/* Spin Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
          display: inline-block;
        }
      `}</style>
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
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
  },
  // ✅ NEW STYLES FOR LOGIN PROMPT
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
    backgroundColor: '#3b82f6',
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
    color: '#3b82f6',
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
    color: '#3b82f6',
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
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
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
  },
  submitButton: {
    backgroundColor: '#10b981',
    boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
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
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '16px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #e2e8f0',
  },
  summaryLabel: {
    color: '#64748b',
    fontSize: '15px',
  },
  summaryValue: {
    color: '#0f172a',
    fontWeight: '600',
    fontSize: '15px',
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
  `;
  document.head.appendChild(style);
}

export default PostRequest;