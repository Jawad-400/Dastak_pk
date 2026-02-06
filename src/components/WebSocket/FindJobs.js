import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaTools, FaMapMarkerAlt, FaCalendarAlt, 
  FaRupeeSign, FaPhone, FaClipboard, FaArrowLeft,
  FaCheckCircle, FaClock, FaUser, FaBullhorn,
  FaSpinner, FaExclamationTriangle,
  FaPen,
  FaMoneyBill
} from 'react-icons/fa';
import { socket } from '../Services/socket';

const FindJobs = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [requestId, setRequestId] = useState('');
  const [debugLogs, setDebugLogs] = useState([]);
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
    { id: 1, name: 'Plumbing', icon: '🚰', description: 'Pipes, Taps, Toilets, Drainage, Kit, Kitchen Drainage Issues, Other...' },
    { id: 2, name: 'Electrical', icon: '🔌', description: 'Wiring, Switches, Fixtures, Board Issues, Light Breakage, Other...' },
    { id: 3, name: 'AC Repair', icon: '❄️', description: 'AC Servicing, Gas Filling, AC Not Working, Cooling Issues, Other ... ' },
    { id: 4, name: 'Carpentry', icon: '🔨', description: 'Furniture, Doors, Cabinets, Repairing, Polishing, New, Other ...' },
    { id: 5, name: 'Painting', icon: '🎨', description: 'Home Painting, Wall Repair, Wall Paneling, Wall Papers, Other ...' },
    { id: 6, name: 'Cleaning', icon: '🧹', description: 'Home, Office, Deep Cleaning, Garden Cleaning, Dusting, Other ...' },
    { id: 7, name: 'Appliance Repair', icon: '🔧', description: 'Washing Machine, Fridge, AC, LCD, Oven, Heater, Stove, Other ...' },
    { id: 8, name: 'Pest Control', icon: '🐜', description: 'Termite, Cockroach, Mosquito, Sprays, Other ...' },
  ];

  // Add debug log
  const addDebug = (msg) => {
    console.log('🔧', msg);
    setDebugLogs(prev => [...prev.slice(-9), {
      time: new Date().toLocaleTimeString(),
      msg
    }]);
  };

  // Connect WebSocket
  useEffect(() => {
    addDebug('Component mounted, connecting WebSocket...');
    socket.connect();
    
    // Listen for WebSocket events
    const onConnect = () => addDebug('✅ WebSocket connected');
    const onDisconnect = () => addDebug('❌ WebSocket disconnected');
    
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    addDebug('=== FORM SUBMIT STARTED ===');
    
    // 1. Validate
    if (!formData.serviceType || !formData.description || !formData.location || !formData.customerName || !formData.contactNumber) {
      setError('Please fill all required fields (*)');
      addDebug('Validation failed: Missing fields');
      return;
    }
    
    setError('');
    setLoading(true);
    
    // 2. Prepare data
    const requestData = {
      title: formData.serviceType,
      description: formData.description,
      location: formData.location,
      schedule: formData.schedule,
      budget: formData.budget || 'Negotiable',
      contact_number: formData.contactNumber,
      customer_name: formData.customerName,
      service_type: formData.serviceType.toLowerCase().replace(/\s+/g, '_'),
      timestamp: Date.now()
    };
    
    addDebug(`Form data: ${JSON.stringify(requestData)}`);
    addDebug(`WebSocket connected: ${socket.connected}`); // FIXED: changed from isConnected() to connected
    
    try {
      // 3. Send via WebSocket
      addDebug('Sending via WebSocket...');
      
      // Create unique request ID
      const newRequestId = `req_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      setRequestId(newRequestId);
      
      // Send the request - FIXED: changed from send to emit
      socket.emit('create_request', { // FIXED: changed from socket.send to socket.emit
        id: newRequestId,
        data: requestData
      });
      
      addDebug(`✅ Request sent! ID: ${newRequestId}`);
      
      // 4. Show success
      setSuccess(true);
      
      // 5. Clear form after 3 seconds
      setTimeout(() => {
        setFormData({
          serviceType: '',
          description: '',
          location: '',
          schedule: 'asap',
          budget: '',
          contactNumber: '',
          customerName: '',
        });
        setStep(1);
        setSuccess(false);
      }, 3000);
      
    } catch (err) {
      addDebug(`❌ Error: ${err.message}`);
      setError('Failed to post request. Please try again.');
    } finally {
      setLoading(false);
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

  // Test WebSocket manually
  const testWebSocket = () => {
    const testId = `test_${Date.now()}`;
    addDebug(`Testing WebSocket with ID: ${testId}`);
    
    // FIXED: changed from socket.send to socket.emit
    socket.emit('create_request', {
      id: testId,
      data: {
        title: 'TEST Plumbing Service',
        description: 'This is a test request',
        location: 'Test Street, Lahore',
        amount: 1000,
        customer: 'Test User',
        schedule: 'ASAP',
        timestamp: Date.now()
      }
    });
    
    alert(`Test request sent! Check console. ID: ${testId}`);
  };

  // Quick test button
  const quickTest = () => {
    setFormData({
      serviceType: 'Plumbing',
      description: 'Fix leaking kitchen sink pipe',
      location: 'Gulberg, Lahore',
      schedule: 'today',
      budget: '2000',
      contactNumber: '+92 300 1234567',
      customerName: 'Test Customer',
    });
    setStep(3);
    addDebug('Form filled with test data');
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

      {/* Connection Status - FIXED: changed from socket.isConnected() to socket.connected */}
      <div style={{
        ...styles.connectionStatus,
        backgroundColor: socket.connected ? '#d4edda' : '#f8d7da',
        color: socket.connected ? '#155724' : '#721c24',
        border: socket.connected ? '2px solid #28a745' : '2px solid #dc3545'
      }}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
          {socket.connected ? '✅ LIVE CONNECTED' : '❌ OFFLINE'}
          <button 
            onClick={() => socket.connect()} 
            style={{padding: '3px 10px', fontSize: '12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '3px'}}
          >
            Reconnect
          </button>
        </div>
        <small style={{display: 'block', marginTop: '5px'}}>
          {socket.connected 
            ? 'Providers will see your request instantly' 
            : 'Connect to WebSocket server for live updates'}
        </small>
      </div>

      {/* Success Message */}
      {success && (
        <div style={styles.successBox}>
          <FaCheckCircle style={{fontSize: '50px', color: '#28a745', marginBottom: '15px'}} />
          <h2>Request Posted Successfully!</h2>
          <p>Request ID: <strong>{requestId}</strong></p>
          <p>Providers are now being notified about your request.</p>
          <p style={{fontSize: '12px', color: '#666', marginTop: '15px'}}>
            This page will reset in 3 seconds...
          </p>
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
          <strong>WebSocket Debug</strong>
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
            <div style={{color: '#999', fontStyle: 'italic'}}>No debug logs yet. Submit form to see logs.</div>
          ) : (
            debugLogs.map((log, idx) => (
              <div key={idx} style={styles.logLine}>
                <span style={{color: '#666'}}>[{log.time}]</span> {log.msg}
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
                    placeholder="Describe what you need in detail..."
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
                    placeholder="Enter complete address"
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
                      <option value="asap">As soon as possible</option>
                      <option value="today">Today</option>
                      <option value="tomorrow">Tomorrow</option>
                      <option value="this-week">This Week</option>
                      <option value="next-week">Next Week</option>
                      <option value="weekend">Weekend</option>
                    </select>
                  </div>

                  <div style={styles.formGroupHalf}>
                    <label style={styles.label}>
                      <FaMoneyBill /> Budget *
                    </label>
                    <input
                      type="text"
                      style={styles.input}
                      placeholder="e.g., 2,000 PKR"
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
                  <FaUser style={styles.stepIcon} /> Contact Information:
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
                    <strong>Location:</strong> {formData.location}
                  </div>
                  <div style={styles.summaryItem}>
                    <strong>Schedule:</strong> {formData.schedule === 'asap' ? 'ASAP' : formData.schedule}
                  </div>
                  <div style={styles.summaryItem}>
                    <strong>Budget:</strong> {formData.budget || 'Negotiable'}
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
    fontFamily: 'Arial, sans-serif'
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
    fontSize: '16px'
  },
  connectionStatus: {
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  title: {
    fontSize: '36px',
    color: '#333',
    marginBottom: '10px'
  },
  subtitle: {
    fontSize: '18px',
    color: '#666'
  },
  successBox: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '30px',
    borderRadius: '10px',
    textAlign: 'center',
    marginBottom: '30px',
    border: '2px solid #c3e6cb'
  },
  errorBox: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '15px',
    borderRadius: '5px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center'
  },
  debugPanel: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px'
  },
  logsBox: {
    maxHeight: '150px',
    overflowY: 'auto',
    backgroundColor: '#fff',
    padding: '10px',
    borderRadius: '5px',
    fontSize: '12px',
    fontFamily: 'monospace'
  },
  logLine: {
    marginBottom: '3px',
    paddingBottom: '3px',
    borderBottom: '1px solid #eee'
  },
  smallBtn: {
    padding: '5px 10px',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '12px'
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
    transition: 'width 0.3s ease'
  },
  progressSteps: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px'
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
    boxShadow: '0 2px 15px rgba(0,0,0,0.1)',
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
    color: '#333'
  },
  categoryDesc: {
    fontSize: '11px',
    color: '#666',
    margin: 0
  },
  formGroup: {
    marginBottom: '20px'
  },
  formGroupHalf: {
    flex: 1
  },
  formRow: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#495057',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ced4da',
    borderRadius: '5px',
    fontSize: '16px',
    '&:focus': {
      outline: 'none',
      borderColor: '#80bdff',
      boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)'
    }
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ced4da',
    borderRadius: '5px',
    fontSize: '16px',
    fontFamily: 'Arial, sans-serif',
    resize: 'vertical',
    minHeight: '100px',
    '&:focus': {
      outline: 'none',
      borderColor: '#80bdff',
      boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)'
    }
  },
  select: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ced4da',
    borderRadius: '5px',
    fontSize: '16px',
    backgroundColor: 'white',
    '&:focus': {
      outline: 'none',
      borderColor: '#80bdff'
    }
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '30px'
  },
  prevBtn: {
    padding: '12px 25px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  nextBtn: {
    padding: '12px 25px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  submitBtn: {
    padding: '15px 40px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    '&:hover:not(:disabled)': {
      backgroundColor: '#218838'
    },
    '&:disabled': {
      backgroundColor: '#6c757d',
      cursor: 'not-allowed'
    }
  },
  summaryBox: {
    backgroundColor: '#e9ecef',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '25px'
  },
  summaryTitle: {
    marginTop: 0,
    marginBottom: '15px',
    color: '#495057'
  },
  summaryItem: {
    marginBottom: '8px',
    color: '#6c757d'
  }
};

// Add spin animation
const styleTag = document.createElement('style');
styleTag.innerHTML = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.spin {
  animation: spin 1s linear infinite;
}
`;
document.head.appendChild(styleTag);

export default FindJobs;