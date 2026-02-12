import React, { useState, useEffect, useRef } from 'react';
import '../styles.css';
import { 
  FaBell, FaWallet, FaStar, FaMapMarkerAlt, FaCalendarAlt, 
  FaUser, FaCheckCircle, FaSearch, FaExclamationCircle
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { socket } from '../Services/socket';

const ProviderDashboard = () => {
  const [connected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [realTimeRequests, setRealTimeRequests] = useState([]);
  const [acceptedJobs, setAcceptedJobs] = useState([]);
  const [activeRequests, setActiveRequests] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(68500);
  
  // Get provider info from localStorage
  const [providerInfo, setProviderInfo] = useState({
    id: '',
    name: '',
    service: '',
    serviceType: '',
    phone: ''
  });

  const hasConnected = useRef(false);
  const socketInitialized = useRef(false);

  // Load provider info from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const providerService = localStorage.getItem('provider_service');
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setProviderInfo({
          id: user.id || '',
          name: user.name || '',
          service: providerService || user.service || 'plumbing',
          serviceType: providerService || user.service || 'plumbing',
          phone: user.phone || ''
        });
        console.log('✅ Provider info loaded:', user.name, 'Service:', providerService || user.service);
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
  }, []);

  // WebSocket setup with correct service type
  useEffect(() => {
    console.log('🚀 ProviderDashboard MOUNTED with service:', providerInfo.serviceType);
    
    const token = localStorage.getItem('token');
    
    if (!token || !providerInfo.id) {
      console.log('❌ No token or provider info, waiting...');
      return;
    }

    if (!socketInitialized.current) {
      socketInitialized.current = true;
      
      console.log('🔌 Initializing WebSocket for provider:', providerInfo.name, providerInfo.serviceType);
      
      // Update query params with CORRECT service
      socket.updateQueryParams({
        type: 'provider',
        user_id: providerInfo.id,
        name: providerInfo.name,
        service: providerInfo.serviceType
      });

      // Update auth
      socket.updateAuth({
        id: providerInfo.id,
        name: providerInfo.name,
        user_type: 'provider',
        token: token,
        service: providerInfo.serviceType
      });

      // Connect if not already connected
      if (!socket.isConnected() && !hasConnected.current) {
        hasConnected.current = true;
        setTimeout(() => socket.connect(), 500);
      }
    }

    // ============ EVENT HANDLERS ============
    const handleConnected = () => {
      console.log('✅ Provider WebSocket connected');
      setConnected(true);
      setConnectionStatus('LIVE CONNECTED');
      
      // Announce provider online with CORRECT service
      socket.send('provider_online', {
        provider_id: providerInfo.id,
        name: providerInfo.name,
        service: providerInfo.serviceType
      });
      
      // Request pending requests
      setTimeout(() => {
        socket.send('get_pending_requests');
      }, 500);
    };
    
    const handleDisconnected = () => {
      console.log('❌ Provider WebSocket disconnected');
      setConnected(false);
      setConnectionStatus('OFFLINE');
      hasConnected.current = false;
      socketInitialized.current = false;
    };
    
    const handlePendingRequests = (data) => {
      console.log('📦 Pending requests received:', data);
      
      const requests = data.requests || data.data?.requests || [];
      
      if (Array.isArray(requests)) {
        console.log(`✅ Received ${requests.length} pending requests for ${providerInfo.serviceType}`);
        
        const formattedRequests = requests.map(req => ({
          id: req.id,
          service: req.title || req.serviceType || req.service_type || 'Service',
          customer: req.customerName || req.customer || 'Customer',
          location: req.location || 'Not specified',
          budget: req.budget || 'Negotiable',
          time: req.createdAt ? new Date(req.createdAt).toLocaleString() : 'Recently',
          description: req.description || '',
          schedule: req.schedule || 'ASAP',
          contact: req.contact || '',
          service_type: req.serviceType || req.service_type
        }));
        
        setRealTimeRequests(formattedRequests);
        setActiveRequests(formattedRequests.length);
      }
    };
    
    // ✅ FIXED: handleNewRequest - NO MORE UNDEFINED VARIABLE ERRORS!
    const handleNewRequest = (data) => {
      console.log('🎯 NEW REQUEST received:', data);
      
      const jobData = data.data || data;
      console.log('📦 Job data:', jobData);
      console.log('🔧 Provider service:', providerInfo.serviceType);
      console.log('🔧 Request service:', jobData.serviceType || jobData.service_type);
      
      // Get the request service type
      const requestService = jobData.serviceType || jobData.service_type;
      
      // Only show requests that match provider's service
      if (requestService && requestService !== providerInfo.serviceType) {
        console.log(`⏭️ Skipping ${requestService} request (I'm a ${providerInfo.serviceType})`);
        return;
      }
      
      console.log(`✅ Accepting ${requestService} request - matches my service!`);
      
      // Create new request object
      const newRequest = {
        id: jobData.id || `job_${Date.now()}`,
        service: jobData.title || jobData.service_type || 'Service',
        customer: jobData.customerName || jobData.customer || 'Customer',
        location: jobData.location || 'Not specified',
        budget: jobData.budget || 'Negotiable',
        time: 'Just now',
        description: jobData.description || '',
        schedule: jobData.schedule || 'ASAP',
        contact: jobData.contact || jobData.contact_number || '',
        service_type: jobData.serviceType || jobData.service_type
      };

      setRealTimeRequests(prev => [newRequest, ...prev]);
      setActiveRequests(prev => prev + 1);
      
      // Browser notification
      if (Notification.permission === 'granted') {
        new Notification('🎯 New Job!', {
          body: `${newRequest.service} - ${newRequest.location} - ${newRequest.budget}`,
          icon: '/logo.png'
        });
      } else if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    };
    
    const handleRequestAccepted = (data) => {
      console.log('✅ Request accepted:', data);
      setActiveRequests(prev => Math.max(0, prev - 1));
    };
    
    const handleRequestTaken = (data) => {
      console.log('⚠️ Request taken:', data);
      setRealTimeRequests(prev => 
        prev.filter(req => req.id !== (data.request_id || data.id))
      );
      setActiveRequests(prev => Math.max(0, prev - 1));
    };

    // Register event listeners
    socket.on('connected', handleConnected);
    socket.on('disconnected', handleDisconnected);
    socket.on('pending_requests', handlePendingRequests);
    socket.on('new_request', handleNewRequest);
    socket.on('request_accepted', handleRequestAccepted);
    socket.on('request_taken', handleRequestTaken);

    // Check initial connection
    if (socket.isConnected()) {
      setConnected(true);
      setConnectionStatus('LIVE CONNECTED');
      setTimeout(() => socket.send('get_pending_requests'), 500);
    }

    // Cleanup
    return () => {
      console.log('📊 ProviderDashboard UNMOUNTED');
      socket.off('connected', handleConnected);
      socket.off('disconnected', handleDisconnected);
      socket.off('pending_requests', handlePendingRequests);
      socket.off('new_request', handleNewRequest);
      socket.off('request_accepted', handleRequestAccepted);
      socket.off('request_taken', handleRequestTaken);
    };
  }, [providerInfo.id, providerInfo.name, providerInfo.serviceType]);

  // Manual reconnect
  const reconnectWebSocket = () => {
    hasConnected.current = false;
    socketInitialized.current = false;
    socket.connect();
  };

  // Accept job
  const acceptJob = (jobId, jobData) => {
    if (!connected || !socket.isConnected()) {
      alert('⚠️ Please wait for connection to establish');
      reconnectWebSocket();
      return;
    }

    setRealTimeRequests(prev => prev.filter(req => req.id !== jobId));
    setAcceptedJobs(prev => [...prev, { ...jobData, acceptedAt: new Date() }]);
    setActiveRequests(prev => Math.max(0, prev - 1));
    
    const budgetValue = parseInt(jobData.budget.replace(/[^0-9]/g, '')) || 0;
    setTotalEarnings(prev => prev + budgetValue);

    socket.send('accept_request', {
      request_id: jobId,
      provider_id: providerInfo.id,
      provider_name: providerInfo.name,
      provider_service: providerInfo.serviceType
    });

    alert(`✅ Accepted: ${jobData.service} job from ${jobData.customer}`);
  };

  // Refresh requests
  const refreshRequests = () => {
    if (socket.isConnected()) {
      socket.send('get_pending_requests');
    } else {
      reconnectWebSocket();
    }
  };

  // Filter requests by service type
  const filteredRequests = realTimeRequests.filter(req => 
    !req.service_type || req.service_type === providerInfo.serviceType
  );

  const staticRequests = [
    { id: 1, service: 'Plumbing', customer: 'Ahmed Raza', location: 'Gulshan', budget: '2,500', time: '2 hours ago' },
    { id: 2, service: 'AC Repair', customer: 'Sara Khan', location: 'DHA', budget: '3,000', time: '5 hours ago' },
  ];

  const allRequests = [...filteredRequests, ...staticRequests];

  if (!providerInfo.id) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading provider information...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Connection Status */}
      <div style={{
        backgroundColor: connected ? '#d4edda' : '#f8d7da',
        color: connected ? '#155724' : '#721c24',
        padding: '10px 15px',
        borderRadius: '5px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: `2px solid ${connected ? '#28a745' : '#dc3545'}`,
        fontWeight: 'bold'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {connected ? '✅' : '❌'}
          <span>
            {connectionStatus} | {providerInfo.service} | {filteredRequests.length} Available Jobs
          </span>
        </div>
        {!connected && (
          <button 
            onClick={reconnectWebSocket}
            style={{
              padding: '5px 15px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Reconnect
          </button>
        )}
      </div>

      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '1px solid #ddd'
      }}>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '5px', color: '#333' }}>Provider Dashboard</h1>
          <p style={{ fontSize: '16px', color: '#666' }}>
            Welcome, <strong>{providerInfo.name}</strong> ({providerInfo.service})
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <Link 
            to="/find-jobs" 
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FaSearch /> Find Jobs
          </Link>
          
          <Link 
            to="/my-orders" 
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            📋 My Orders ({acceptedJobs.length})
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <FaWallet style={{ color: '#007bff', fontSize: '24px' }} />
          <div>
            <h3 style={{ margin: 0, color: '#333' }}>{totalEarnings.toLocaleString()} PKR</h3>
            <p style={{ margin: '5px 0 0 0', color: '#666' }}>Total Earnings</p>
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <FaCheckCircle style={{ color: '#28a745', fontSize: '24px' }} />
          <div>
            <h3 style={{ margin: 0, color: '#333' }}>{acceptedJobs.length}</h3>
            <p style={{ margin: '5px 0 0 0', color: '#666' }}>Accepted Jobs</p>
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <FaStar style={{ color: '#ffc107', fontSize: '24px' }} />
          <div>
            <h3 style={{ margin: 0, color: '#333' }}>4.8/5</h3>
            <p style={{ margin: '5px 0 0 0', color: '#666' }}>Rating</p>
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          border: connected ? '2px solid #28a745' : '2px solid #dc3545'
        }}>
          <FaBell style={{ color: connected ? '#28a745' : '#dc3545', fontSize: '24px' }} />
          <div>
            <h3 style={{ margin: 0, color: '#333' }}>{activeRequests}</h3>
            <p style={{ margin: '5px 0 0 0', color: '#666' }}>
              {connected ? 'Live Requests' : 'Active Requests'}
              {filteredRequests.length > 0 && (
                <span style={{ color: '#dc3545', marginLeft: '5px', fontSize: '12px' }}>
                  ({filteredRequests.length} new)
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        {/* Left - Requests */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          padding: '25px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaBell /> 
              {filteredRequests.length > 0 ? '🔥 LIVE Service Requests' : 'Service Requests'}
              {filteredRequests.length > 0 && (
                <span style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  marginLeft: '10px'
                }}>
                  {filteredRequests.length} NEW
                </span>
              )}
            </h2>
            <button 
              onClick={refreshRequests}
              style={{
                padding: '5px 15px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Refresh
            </button>
          </div>
          
          {allRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
              <FaExclamationCircle style={{ fontSize: '48px', marginBottom: '15px', opacity: 0.5 }} />
              <h3>No job requests available</h3>
              <p>New requests will appear here when customers post them</p>
            </div>
          ) : (
            <div>
              {allRequests.map((req, index) => (
                <div key={req.id} style={{
                  padding: '15px',
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  backgroundColor: index < filteredRequests.length ? '#fff8e1' : '#f9f9f9',
                  borderLeft: index < filteredRequests.length ? '5px solid #ffc107' : '5px solid #007bff'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ marginBottom: '10px', color: '#444' }}>
                      {req.service}
                      {index < filteredRequests.length && (
                        <span style={{
                          backgroundColor: '#ffc107',
                          color: '#000',
                          padding: '2px 8px',
                          borderRadius: '3px',
                          fontSize: '10px',
                          marginLeft: '10px'
                        }}>
                          LIVE
                        </span>
                      )}
                    </h3>
                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
                      {req.budget} PKR
                    </span>
                  </div>
                  
                  <p><strong>Customer:</strong> {req.customer}</p>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaMapMarkerAlt /> {req.location}
                  </p>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaCalendarAlt /> {req.time}
                    {req.schedule && <span> • 📅 {req.schedule}</span>}
                  </p>
                  
                  {req.description && (
                    <div style={{
                      marginTop: '10px',
                      padding: '10px',
                      backgroundColor: '#f1f3f4',
                      borderRadius: '5px',
                      fontSize: '14px'
                    }}>
                      <strong>Description:</strong> {req.description}
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                    <div>
                      {req.contact && (
                        <small>📞 {req.contact}</small>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => acceptJob(req.id, req)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        ✅ Accept Job
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right - Profile & Status */}
        <div>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '25px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            marginBottom: '20px'
          }}>
            <h2 style={{ marginBottom: '20px', color: '#333' }}>
              <FaUser /> Your Profile
            </h2>
            <div style={{
              padding: '20px',
              border: '1px solid #eee',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }}>
              <p><strong>Name:</strong> {providerInfo.name}</p>
              <p><strong>Service:</strong> {providerInfo.service}</p>
              <p><strong>Phone:</strong> {providerInfo.phone}</p>
              <p><strong>ID:</strong> {providerInfo.id}</p>
              <p><strong>Rating:</strong> 4.8/5</p>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '25px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ marginBottom: '20px', color: '#333' }}>
              {connected ? '✅' : '❌'} Connection
            </h2>
            <div style={{
              padding: '20px',
              border: '1px solid #eee',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }}>
              <p><strong>Status:</strong> 
                <span style={{ 
                  color: connected ? '#28a745' : '#dc3545',
                  fontWeight: 'bold',
                  marginLeft: '10px'
                }}>
                  {connectionStatus}
                </span>
              </p>
              <p><strong>Service Type:</strong> {providerInfo.serviceType}</p>
              <p><strong>Live Jobs:</strong> {filteredRequests.length}</p>
              <p><strong>Accepted Today:</strong> {acceptedJobs.length}</p>
              
              <button 
                onClick={reconnectWebSocket}
                style={{
                  marginTop: '15px',
                  padding: '10px',
                  backgroundColor: connected ? '#6c757d' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                {connected ? 'Disconnect' : 'Connect Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;