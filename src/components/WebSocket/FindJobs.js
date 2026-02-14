import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaTools, FaMapMarkerAlt, FaCalendarAlt, 
  FaPhone, FaArrowLeft,
  FaCheckCircle, FaUser, FaBullhorn,
  FaSpinner, FaExclamationTriangle,
  FaPen, FaMoneyBill
} from 'react-icons/fa';
import { socket } from './services/socket';  // Now using our GoWebSocket
import { SERVICE_TYPES } from '../components/serviceTypes';


const FindJobs = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [requestId, setRequestId] = useState('');
  const [debugLogs, setDebugLogs] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [formData, setFormData] = useState({
    serviceType: '',
    description: '',
    location: '',
    schedule: 'ASAP',
    budget: '',
    contactNumber: '',
    customerName: '',
  });
  
  {SERVICE_TYPES.map(service => (
    <option key={service.value} value={service.value}>
      {service.name}
    </option>
  ))}

  // Debug logging
  const addDebug = (msg) => {
    console.log('🔧 [FindJobs]:', msg);
    setDebugLogs(prev => {
      const newLogs = [...prev, {
        time: new Date().toLocaleTimeString(),
        msg
      }];
      return newLogs.slice(-10);
    });
  };

  // WebSocket setup - UPDATED FOR GO WEBSOCKET
  useEffect(() => {
    addDebug('Component mounted, initializing WebSocket...');

    socket.updateQueryParams({
      type: 'customer',
      user_id: formData.customerName || 'anonymous_customer',
      name: formData.customerName || 'Customer',
      service: '' // Customers don't have service
    });
    
    // Listen for connection events
    const handleConnected = (e) => {
      addDebug(`✅ WebSocket connected to: ${e.detail.url}`);
      setSocketConnected(true);
    };
    
    const handleDisconnected = (e) => {
      addDebug(`❌ WebSocket disconnected: ${e.detail.reason || 'Unknown reason'}`);
      setSocketConnected(false);
    };
    
    // Listen for custom events from our GoWebSocket
    window.addEventListener('socket-connected', handleConnected);
    window.addEventListener('socket-disconnected', handleDisconnected);
    
    // Also listen for specific WebSocket events
    window.addEventListener('ws-request_created', (e) => {
      addDebug(`✅ Server confirmed request: ${JSON.stringify(e.detail)}`);
      setSuccess(true);
    });
    
    window.addEventListener('ws-welcome', (e) => {
      addDebug(`👋 Server welcome: ${JSON.stringify(e.detail)}`);
    });
    
    // Connect to WebSocket
    socket.connect();
    
    // Check initial connection
    if (socket.isConnected()) {
      setSocketConnected(true);
      addDebug('✅ Socket already connected');
    }
    
    // Cleanup
    return () => {
      window.removeEventListener('socket-connected', handleConnected);
      window.removeEventListener('socket-disconnected', handleDisconnected);
      window.removeEventListener('ws-request_created', () => {});
      window.removeEventListener('ws-welcome', () => {});
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    addDebug('=== FORM SUBMIT STARTED ===');
    
    // Validation
    if (!formData.serviceType || !formData.description || !formData.location || !formData.customerName || !formData.contactNumber) {
      setError('Please fill all required fields (*)');
      addDebug('Validation failed: Missing fields');
      return;
    }
    
    setError('');
    setLoading(true);
    
    // Generate request ID
    const newRequestId = `req_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    setRequestId(newRequestId);
    
    // Prepare data for Go server
    const requestData = {
      id: newRequestId,
      title: formData.serviceType,
      description: formData.description,
      location: formData.location,
      budget: formData.budget || 'Negotiable',
      customer_id: `cust_${formData.customerName.replace(/\s+/g, '_')}`,
      customer_name: formData.customerName,
      service_type: formData.serviceType.toLowerCase().replace(/\s+/g, '_'),
      schedule: formData.schedule,
      contact_number: formData.contactNumber,
      timestamp: Date.now()
    };
    
    addDebug(`Prepared data: ${JSON.stringify(requestData)}`);
    addDebug(`Socket connected: ${socketConnected}`);
    
    try {
      // Send via WebSocket
      if (socketConnected && socket.isConnected()) {
        const sent = socket.send('create_request', requestData);
        
        if (sent) {
          addDebug(`✅ Request sent via WebSocket: ${newRequestId}`);
          
          // Show success
          setSuccess(true);
          setLoading(false);
          
          // Clear form after delay
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
            addDebug('Form reset');
          }, 3000);
        } else {
          addDebug('❌ Failed to send request');
          setError('Failed to send request. Please check connection.');
          setLoading(false);
        }
      } else {
        addDebug('❌ Socket not connected');
        setError('Connection lost. Please reconnect and try again.');
        setLoading(false);
      }
    } catch (err) {
      addDebug(`❌ Error: ${err.message}`);
      setError('Failed to post request');
      setLoading(false);
    }
  };

  // Navigation functions
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

  // Quick test button
  const quickTest = () => {
    setFormData({
      serviceType: 'Plumbing',
      description: 'Fix leaking kitchen sink pipe. The pipe under the sink is leaking and needs replacement.',
      location: 'Gulberg, Lahore - House No. 123, Street 5',
      schedule: 'today',
      budget: '2000 PKR',
      contactNumber: '+92 300 1234567',
      customerName: 'Test Customer',
    });
    setStep(3);
    addDebug('Form filled with test data');
    setError('');
  };

  // Manual connect button
  const manualConnect = () => {
    addDebug('Manually connecting WebSocket...');
    
    if (socket.isConnected()) {
      socket.disconnect();
      addDebug('Disconnected existing connection');
    }
    
    socket.connect();
    
    // Check connection status after 2 seconds
    setTimeout(() => {
      if (socket.isConnected()) {
        setSocketConnected(true);
        addDebug('✅ Manual connect successful');
      } else {
        setSocketConnected(false);
        addDebug('❌ Manual connect failed');
      }
    }, 2000);
  };

  // Test WebSocket manually
  const testWebSocket = () => {
    const testData = {
      id: `test_${Date.now()}`,
      title: 'TEST Plumbing',
      description: 'Test request',
      location: 'Test Location',
      budget: '1000 PKR',
      customer_id: 'test_customer',
      customer_name: 'Test User',
      service_type: 'plumbing',
      schedule: 'ASAP',
      contact_number: '+92 300 0000000',
      timestamp: Date.now()
    };
    
    if (socket.isConnected()) {
      socket.send('create_request', testData);
      addDebug('Test request sent');
      alert('Test request sent! Check console.');
    } else {
      addDebug('Socket not connected');
      alert('Socket not connected');
    }
  };

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
            ? 'Connected to Go WebSocket server' 
            : 'Connect to WebSocket server for live updates'}
        </small>
      </div>

      {/* Success Message */}
      {success && (
        <div style={styles.successBox}>
          <FaCheckCircle style={{fontSize: '50px', color: '#28a745', marginBottom: '15px'}} />
          <h2>Request Posted Successfully!</h2>
          <p>Request ID: <strong style={{backgroundColor: '#e9ecef', padding: '5px 10px', borderRadius: '4px'}}>{requestId}</strong></p>
          <p>Providers are now being notified about your request.</p>
          <div style={{marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px'}}>
            <span style={{fontSize: '12px', color: '#666'}}>
              This page will reset in 3 seconds...
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
              onClick={testWebSocket}
              style={{...styles.smallBtn, backgroundColor: '#17a2b8'}}
            >
              Test WebSocket
            </button>
            <button 
              onClick={() => setDebugLogs([])}
              style={{...styles.smallBtn, backgroundColor: '#6c757d', marginLeft: '5px'}}
            >
              Clear Logs
            </button>
          </div>
        </div>
        <div style={styles.logsBox}>
          {debugLogs.length === 0 ? (
            <div style={{color: '#999', fontStyle: 'italic'}}>No debug logs yet.</div>
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
                        addDebug(`Selected service: ${category.name}`);
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
                    placeholder="Describe what you need in detail. Be specific about the problem..."
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
                    placeholder="Enter complete address with street, area, city"
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
                </div>

                <div style={{textAlign: 'center', margin: '20px 0'}}>
                  <div style={{fontSize: '14px', color: '#666', marginBottom: '10px'}}>
                    {socketConnected 
                      ? '✅ Your request will be sent to providers instantly' 
                      : '⚠️ WebSocket offline - request will be saved locally'}
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
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#5a6268'
    }
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
    transition: 'all 0.2s ease',
    '&:hover': {
      opacity: 0.9
    }
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
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
    }
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
    transition: 'all 0.2s ease',
    '&:focus': {
      outline: 'none',
      borderColor: '#80bdff',
      boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)'
    }
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
    transition: 'all 0.2s ease',
    '&:focus': {
      outline: 'none',
      borderColor: '#80bdff',
      boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)'
    }
  },
  select: {
    width: '100%',
    padding: '14px',
    border: '1px solid #ced4da',
    borderRadius: '6px',
    fontSize: '16px',
    backgroundColor: 'white',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    '&:focus': {
      outline: 'none',
      borderColor: '#80bdff',
      boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)'
    }
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
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#5a6268'
    }
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
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#0056b3'
    }
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
    boxShadow: '0 4px 6px rgba(40,167,69,0.3)',
    '&:hover:not(:disabled)': {
      backgroundColor: '#218838',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 8px rgba(40,167,69,0.4)'
    },
    '&:disabled': {
      backgroundColor: '#6c757d',
      cursor: 'not-allowed',
      transform: 'none',
      boxShadow: 'none'
    }
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

export default FindJobs;