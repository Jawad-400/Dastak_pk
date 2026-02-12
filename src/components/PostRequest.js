import React, { useState, useEffect } from 'react';
import '../styles.css';
import { useNavigate } from 'react-router-dom';
import { 
  FaTools, FaMapMarkerAlt, FaCalendarAlt, 
  FaPhone, FaArrowLeft,
  FaCheckCircle, FaUser, FaBullhorn,
  FaSpinner, FaExclamationTriangle,
  FaPen,
  FaMoneyBill
} from 'react-icons/fa';
import { socket } from '../Services/socket';

const PostRequest = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [requestId, setRequestId] = useState('');
  const [debugLogs, setDebugLogs] = useState([]);
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
    { id: 1, name: 'Plumbing', value: 'plumbing', icon: '🚰', description: 'Pipes, Taps, Toilets, Drainage' },
    { id: 2, name: 'Electrical', value: 'electrical', icon: '🔌', description: 'Wiring, Switches, Fixtures, Lights' },
    { id: 3, name: 'AC Repair', value: 'ac_repair', icon: '❄️', description: 'AC Servicing, Gas Filling, Cooling Issues' },
    { id: 4, name: 'Carpentry', value: 'carpentry', icon: '🔨', description: 'Furniture, Doors, Cabinets, Repairing' },
    { id: 5, name: 'Painting', value: 'painting', icon: '🎨', description: 'Home Painting, Wall Repair, Wall Paneling' },
    { id: 6, name: 'Cleaning', value: 'cleaning', icon: '🧹', description: 'Home, Office, Deep Cleaning' },
    { id: 7, name: 'Appliance Repair', value: 'appliance_repair', icon: '🔧', description: 'Washing Machine, Fridge, LCD, Oven' },
    { id: 8, name: 'Pest Control', value: 'pest_control', icon: '🐜', description: 'Termite, Cockroach, Mosquito' },
  ];

  // Add debug log
  const addDebug = (msg) => {
    console.log('🔧', msg);
    setDebugLogs(prev => {
      const newLogs = [...prev, {
        time: new Date().toLocaleTimeString(),
        msg
      }];
      return newLogs.slice(-10);
    });
  };

  // Load user and token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      addDebug('✅ User loaded from localStorage');
    } else {
      addDebug('❌ No user found - please login first');
      setError('Please login to post a request');
      setTimeout(() => navigate('/customer-login'), 2000);
    }
  }, [navigate]);

  // Connect WebSocket
  useEffect(() => {
    addDebug('Component mounted, connecting WebSocket...');
    
    // Connect socket
    socket.connect();
    
    // Set up event listeners
    const handleConnect = () => {
      addDebug('✅ WebSocket connected');
      setSocketConnected(true);
    };
    
    const handleDisconnect = () => {
      addDebug('❌ WebSocket disconnected');
      setSocketConnected(false);
    };
    
    // Add event listeners
    socket.on('connected', handleConnect);
    socket.on('disconnected', handleDisconnect);
    
    // Listen for request confirmation from server
    socket.on('request_created', (data) => {
      addDebug(`✅ Server confirmed request creation: ${JSON.stringify(data)}`);
      if (data.data?.requestId === requestId || data.requestId === requestId) {
        setSuccess(true);
      }
    });
    
    // Listen for request acceptance by provider
    socket.on('request_accepted', (data) => {
      addDebug(`✅ Provider accepted your request: ${JSON.stringify(data)}`);
      if (data.data?.requestId === requestId || data.requestId === requestId) {
        alert(`🎉 Your request has been accepted by ${data.data?.providerName || data.providerName}! They will contact you soon.`);
      }
    });
    
    return () => {
      // Clean up listeners
      socket.off('connected', handleConnect);
      socket.off('disconnected', handleDisconnect);
      socket.off('request_created');
      socket.off('request_accepted');
    };
  }, [requestId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    addDebug('=== FORM SUBMIT STARTED ===');
    
    // 1. Validate
    if (!formData.serviceType || !formData.description || !formData.location || !formData.customerName || !formData.contactNumber) {
      setError('Please fill all required fields (*)');
      addDebug('Validation failed: Missing fields');
      return;
    }
    
    if (!token || !user) {
      setError('Please login first');
      addDebug('❌ No token or user found');
      setTimeout(() => navigate('/customer-login'), 2000);
      return;
    }
    
    setError('');
    setLoading(true);
    
    // 2. Prepare data - FIXED: Use the value from serviceCategories
    const newRequestId = `req_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    setRequestId(newRequestId);
    
    // ✅ FIX: Get the correct service_type value from the category
    const selectedCategory = serviceCategories.find(c => c.name === formData.serviceType);
    const serviceTypeValue = selectedCategory ? selectedCategory.value : formData.serviceType.toLowerCase().replace(/\s+/g, '_');
    
    addDebug(`✅ Selected service: ${formData.serviceType} -> Mapped to: ${serviceTypeValue}`);
    
    const requestData = {
      title: formData.serviceType,
      description: formData.description,
      location: formData.location,
      budget: formData.budget || 'Negotiable',
      customerId: user.id.toString(),
      serviceType: serviceTypeValue,  // ✅ Using correct value from category
      schedule: formData.schedule,
      contact: formData.contactNumber
    };
    
    addDebug(`📦 Request data: ${JSON.stringify(requestData, null, 2)}`);
    
    try {
      // ✅ PRIMARY: Send via REST API with Authorization header
      addDebug('📤 Sending request to REST API...');
      
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
        addDebug(`✅✅✅ Request created via REST API! ID: ${data.data.id || newRequestId}`);
        addDebug(`🔧 Service type sent: ${serviceTypeValue}`);
        setRequestId(data.data.id || newRequestId);
        
        // ✅ SECONDARY: Also send via WebSocket for real-time updates
        if (socket && socket.isConnected()) {
          socket.send('create_request', {
            id: data.data.id || newRequestId,
            title: formData.serviceType,
            description: formData.description,
            location: formData.location,
            budget: formData.budget || 'Negotiable',
            customer_id: user.id.toString(),
            customer_name: formData.customerName,
            service_type: serviceTypeValue,  // ✅ Using correct value
            schedule: formData.schedule,
            contact_number: formData.contactNumber
          });
          addDebug('✅ Request also sent via WebSocket');
        }
        
        // 4. Show success
        setSuccess(true);
        setLoading(false);
        
        // 5. Clear form after 5 seconds
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
          addDebug('Form reset for new request');
        }, 5000);
        
      } else {
        addDebug(`❌ API Error: ${data.error || 'Unknown error'}`);
        setError(data.error || 'Failed to post request');
        setLoading(false);
      }
      
    } catch (err) {
      addDebug(`❌ Network Error: ${err.message}`);
      setError('Network error. Please try again.');
      setLoading(false);
    } finally {
      addDebug('=== FORM SUBMIT COMPLETED ===');
    }
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && (!formData.serviceType || !formData.description)) {
      setError('Please select service and add description');
      return;
    }
    if (step === 2 && !formData.location) {
      setError('Please enter location');
      return;
    }
    if (step < 3) setStep(step + 1);
  };

  const handlePrev = () => {
    setError('');
    if (step > 1) setStep(step - 1);
  };

  // Quick test button - FIXED
  const quickTest = () => {
    if (!user) {
      alert('Please login first');
      navigate('/customer-login');
      return;
    }
    
    const electricalCategory = serviceCategories.find(c => c.name === 'Electrical');
    addDebug(`🧪 Test mode: Will use service value: ${electricalCategory?.value || 'electrical'}`);
    
    setFormData({
      serviceType: 'Electrical',
      description: 'Fix AC not cooling properly. The AC is running but not cooling. Need immediate repair.',
      location: 'House No. 123, Street 5, Gulberg, Lahore',
      schedule: 'today',
      budget: '2500 PKR',
      contactNumber: '03001234567',
      customerName: user.name || 'Test Customer',
    });
    setStep(3);
    setError('');
  };

  // Manual connect button
  const manualConnect = () => {
    addDebug('Manually connecting WebSocket...');
    socket.connect();
    setTimeout(() => {
      setSocketConnected(socket.isConnected());
      addDebug(socket.isConnected() ? '✅ Manual connect successful' : '❌ Manual connect failed');
    }, 300);
  };

  // If no user, show login required
  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <FaExclamationTriangle style={{marginRight: '10px'}} />
          Please login to post a request. Redirecting...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Back Button */}
      <div style={styles.backButton}>
        <button onClick={() => navigate('/')} style={styles.backBtn}>
          <FaArrowLeft /> Back to Home
        </button>
        <button onClick={quickTest} style={{...styles.backBtn, backgroundColor: '#ffc107', color: '#000', marginLeft: '10px'}}>
          Fill Test Data
        </button>
      </div>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Post a Service Request</h1>
        <p style={styles.subtitle}>Describe your service need and get Orders from local providers</p>
      </div>

      {/* User Info */}
      {user && (
        <div style={{
          backgroundColor: '#e3f2fd',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <strong>👤 Logged in as:</strong> {user.name} ({user.phone})
          </div>
          <div>
            <span style={{
              backgroundColor: token ? '#28a745' : '#dc3545',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              {token ? '✅ Authenticated' : '❌ Not Authenticated'}
            </span>
          </div>
        </div>
      )}

      {/* Connection Status */}
      <div style={{
        ...styles.connectionStatus,
        backgroundColor: socketConnected ? '#d4edda' : '#f8d7da',
        color: socketConnected ? '#155724' : '#721c24',
        border: socketConnected ? '2px solid #28a745' : '2px solid #dc3545'
      }}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
          {socketConnected ? '✅ LIVE CONNECTED' : '❌ OFFLINE'}
          <button 
            onClick={manualConnect}
            style={{padding: '5px 12px', fontSize: '12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '3px'}}
          >
            Connect
          </button>
        </div>
        <small style={{display: 'block', marginTop: '5px'}}>
          {socketConnected 
            ? '✅ Providers will see your request instantly in real-time' 
            : '⚠️ WebSocket offline - request will still be saved but not real-time'}
        </small>
      </div>

      {/* Success Message */}
      {success && (
        <div style={styles.successBox}>
          <FaCheckCircle style={{fontSize: '50px', color: '#28a745', marginBottom: '15px'}} />
          <h2>🎉 Request Posted Successfully!</h2>
          <p>Request ID: <strong style={{backgroundColor: '#e9ecef', padding: '5px 10px', borderRadius: '4px'}}>{requestId}</strong></p>
          <p>✅ Sent to all available providers</p>
          <p>🔔 You will be notified when a provider accepts</p>
          <div style={{marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px'}}>
            <span style={{fontSize: '12px', color: '#666'}}>
              This page will reset in 5 seconds...
            </span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={styles.errorBox}>
          <FaExclamationTriangle style={{marginRight: '10px'}} />
          {error}
        </div>
      )}

      {/* Debug Panel */}
      <div style={styles.debugPanel}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
          <strong>Debug Console</strong>
          <div>
            <button 
              onClick={() => setDebugLogs([])}
              style={{...styles.smallBtn, backgroundColor: '#6c757d'}}
            >
              Clear Logs
            </button>
          </div>
        </div>
        <div style={styles.logsBox}>
          {debugLogs.length === 0 ? (
            <div style={{color: '#999', fontStyle: 'italic'}}>No debug logs yet. Submit form to see logs.</div>
          ) : (
            debugLogs.map((log, idx) => (
              <div key={idx} style={styles.logLine}>
                <span style={{color: '#666', fontFamily: 'monospace', fontSize: '11px'}}>[{log.time}]</span>
                <span style={{marginLeft: '10px', fontFamily: 'monospace', fontSize: '12px'}}>{log.msg}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Form */}
      {!success && (
        <>
          {/* Progress Bar */}
          <div style={styles.progressContainer}>
            <div style={styles.progressBar}>
              <div style={{...styles.progressFill, width: `${(step/3)*100}%`}}></div>
            </div>
            <div style={styles.progressSteps}>
              <div style={step >= 1 ? styles.activeStep : styles.step}>1. Service</div>
              <div style={step >= 2 ? styles.activeStep : styles.step}>2. Location</div>
              <div style={step >= 3 ? styles.activeStep : styles.step}>3. Contact</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Step 1: Service Details */}
            {step === 1 && (
              <div style={styles.stepContainer}>
                <h2 style={styles.stepTitle}>
                  <FaTools style={styles.stepIcon} /> What Service do you need?
                </h2>
                
                <div style={styles.categoriesGrid}>
                  {serviceCategories.map(category => (
                    <div
                      key={category.id}
                      style={{
                        ...styles.categoryCard,
                        border: formData.serviceType === category.name ? '3px solid #007bff' : '2px solid #ddd',
                        backgroundColor: formData.serviceType === category.name ? '#f0f8ff' : 'white'
                      }}
                      onClick={() => {
                        setFormData({...formData, serviceType: category.name});
                        addDebug(`Selected service: ${category.name} -> value: ${category.value}`);
                      }}
                    >
                      <div style={styles.categoryIcon}>{category.icon}</div>
                      <h4 style={styles.categoryName}>{category.name}</h4>
                      <p style={styles.categoryDesc}>{category.description}</p>
                    </div>
                  ))}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <FaPen /> Service Description *
                  </label>
                  <textarea
                    style={styles.textarea}
                    placeholder="Describe what you need in detail. Be specific about the problem, location in your house, and any special requirements..."
                    rows="6"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>

                <div style={styles.buttonGroup}>
                  <button type="button" style={styles.nextBtn} onClick={handleNext}>
                    Next: Location & Schedule →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Location & Schedule */}
            {step === 2 && (
              <div style={styles.stepContainer}>
                <h2 style={styles.stepTitle}>
                  <FaMapMarkerAlt style={styles.stepIcon} /> Where and when ?
                </h2>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <FaMapMarkerAlt /> Service Location *
                  </label>
                  <input
                    type="text"
                    style={styles.input}
                    placeholder="Enter complete address with street, area, city, and landmarks"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                  />
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroupHalf}>
                    <label style={styles.label}>
                      <FaCalendarAlt /> Schedule *
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
                      <option value="weekend">Weekend</option>
                    </select>
                  </div>

                  <div style={styles.formGroupHalf}>
                    <label style={styles.label}>
                      <FaMoneyBill /> Budget
                    </label>
                    <input
                      type="text"
                      style={styles.input}
                      placeholder="e.g., 2,000 PKR (Optional)"
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    />
                  </div>
                </div>

                <div style={styles.buttonGroup}>
                  <button type="button" style={styles.prevBtn} onClick={handlePrev}>
                    ← Back
                  </button>
                  <button type="button" style={styles.nextBtn} onClick={handleNext}>
                    Next: Contact Info →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Contact Information */}
            {step === 3 && (
              <div style={styles.stepContainer}>
                <h2 style={styles.stepTitle}>
                  <FaUser style={styles.stepIcon} /> Contact Information
                </h2>

                <div style={styles.formRow}>
                  <div style={styles.formGroupHalf}>
                    <label style={styles.label}>
                      <FaUser /> Your Name *
                    </label>
                    <input
                      type="text"
                      style={styles.input}
                      placeholder="Your full name"
                      value={formData.customerName}
                      onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                      required
                    />
                  </div>

                  <div style={styles.formGroupHalf}>
                    <label style={styles.label}>
                      <FaPhone /> Contact Number *
                    </label>
                    <input
                      type="tel"
                      style={styles.input}
                      placeholder="03XX XXXXXXX"
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                      required
                    />
                  </div>
                </div>

                {/* Summary */}
                <div style={styles.summaryBox}>
                  <h3 style={styles.summaryTitle}>Request Summary</h3>
                  <div style={styles.summaryItem}>
                    <strong>Service:</strong> {formData.serviceType}
                  </div>
                  <div style={styles.summaryItem}>
                    <strong>Description:</strong> {formData.description.substring(0, 50)}...
                  </div>
                  <div style={styles.summaryItem}>
                    <strong>Location:</strong> {formData.location}
                  </div>
                  <div style={styles.summaryItem}>
                    <strong>Schedule:</strong> {formData.schedule}
                  </div>
                  <div style={styles.summaryItem}>
                    <strong>Budget:</strong> {formData.budget || 'Negotiable'}
                  </div>
                  <div style={styles.summaryItem}>
                    <strong>Customer:</strong> {formData.customerName}
                  </div>
                  <div style={styles.summaryItem}>
                    <strong>Contact:</strong> {formData.contactNumber}
                  </div>
                </div>

                <div style={{textAlign: 'center', margin: '20px 0'}}>
                  <div style={{fontSize: '14px', color: '#666', marginBottom: '10px'}}>
                    {socketConnected 
                      ? '✅ Your request will be sent to providers instantly in real-time' 
                      : '⚠️ WebSocket offline - request will still be saved'}
                  </div>
                </div>

                <div style={styles.buttonGroup}>
                  <button type="button" style={styles.prevBtn} onClick={handlePrev}>
                    ← Back
                  </button>
                  <button 
                    type="submit" 
                    style={styles.submitBtn}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="spin" style={{marginRight: '8px'}} />
                        Posting...
                      </>
                    ) : (
                      <>
                        <FaBullhorn style={{marginRight: '8px'}} />
                        Post Request & Get Orders
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

// ==================== STYLES ====================
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif'
  },
  backButton: {
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center'
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'all 0.2s ease'
  },
  connectionStatus: {
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center',
    fontWeight: 'bold',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  title: {
    fontSize: '36px',
    color: '#333',
    marginBottom: '10px',
    fontWeight: '700'
  },
  subtitle: {
    fontSize: '18px',
    color: '#666',
    maxWidth: '600px',
    margin: '0 auto'
  },
  successBox: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '30px',
    borderRadius: '10px',
    textAlign: 'center',
    marginBottom: '30px',
    border: '2px solid #c3e6cb',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  errorBox: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '15px',
    borderRadius: '5px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    borderLeft: '4px solid #dc3545'
  },
  debugPanel: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  logsBox: {
    maxHeight: '150px',
    overflowY: 'auto',
    backgroundColor: '#fff',
    padding: '10px',
    borderRadius: '5px',
    fontSize: '12px',
    fontFamily: 'monospace',
    border: '1px solid #e9ecef'
  },
  logLine: {
    marginBottom: '5px',
    paddingBottom: '5px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    alignItems: 'flex-start'
  },
  smallBtn: {
    padding: '5px 12px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
    transition: 'all 0.2s ease'
  },
  progressContainer: {
    marginBottom: '30px'
  },
  progressBar: {
    height: '8px',
    backgroundColor: '#e9ecef',
    borderRadius: '4px',
    marginBottom: '10px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007bff',
    transition: 'width 0.3s ease',
    borderRadius: '4px'
  },
  progressSteps: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    fontWeight: '500'
  },
  step: {
    color: '#adb5bd'
  },
  activeStep: {
    color: '#007bff',
    fontWeight: 'bold'
  },
  form: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '30px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    marginBottom: '40px'
  },
  stepContainer: {
    maxWidth: '800px',
    margin: '0 auto'
  },
  stepTitle: {
    fontSize: '24px',
    color: '#333',
    marginBottom: '25px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  stepIcon: {
    color: '#007bff'
  },
  categoriesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '15px',
    marginBottom: '25px'
  },
  categoryCard: {
    borderRadius: '8px',
    padding: '15px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
  },
  categoryIcon: {
    fontSize: '30px',
    marginBottom: '10px'
  },
  categoryName: {
    margin: '0 0 5px 0',
    fontSize: '16px',
    color: '#333',
    fontWeight: '600'
  },
  categoryDesc: {
    fontSize: '11px',
    color: '#666',
    margin: 0,
    lineHeight: '1.4'
  },
  formGroup: {
    marginBottom: '25px'
  },
  formGroupHalf: {
    flex: 1
  },
  formRow: {
    display: 'flex',
    gap: '20px',
    marginBottom: '25px'
  },
  label: {
    marginBottom: '8px',
    fontWeight: '600',
    color: '#495057',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '15px'
  },
  input: {
    width: '100%',
    padding: '14px',
    border: '1px solid #ced4da',
    borderRadius: '6px',
    fontSize: '16px',
    transition: 'all 0.2s ease'
  },
  textarea: {
    width: '100%',
    padding: '14px',
    border: '1px solid #ced4da',
    borderRadius: '6px',
    fontSize: '16px',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: '120px',
    lineHeight: '1.5',
    transition: 'all 0.2s ease'
  },
  select: {
    width: '100%',
    padding: '14px',
    border: '1px solid #ced4da',
    borderRadius: '6px',
    fontSize: '16px',
    backgroundColor: 'white',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '30px'
  },
  prevBtn: {
    padding: '14px 30px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'all 0.2s ease'
  },
  nextBtn: {
    padding: '14px 30px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'all 0.2s ease'
  },
  submitBtn: {
    padding: '16px 45px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 6px rgba(40,167,69,0.3)'
  },
  summaryBox: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '25px',
    borderLeft: '4px solid #007bff'
  },
  summaryTitle: {
    marginTop: 0,
    marginBottom: '15px',
    color: '#495057',
    fontSize: '18px'
  },
  summaryItem: {
    marginBottom: '10px',
    color: '#6c757d',
    lineHeight: '1.5'
  }
};

// Add spin animation globally
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .spin {
      animation: spin 1s linear infinite;
      display: inline-block;
    }
  `;
  document.head.appendChild(styleTag);
}

export default PostRequest;