import React, { useState, useEffect } from 'react';
import '../styles.css';
import { 
  FaBell, FaWallet, FaStar, FaMapMarkerAlt, FaCalendarAlt, 
  FaUser, FaCheckCircle, FaSearch, FaExclamationCircle
} from 'react-icons/fa'; // Removed FaSpinner
import { Link } from 'react-router-dom';
import { socket } from '../Services/socket'; // Now using our GoWebSocket

const ProviderDashboard = () => {
  const [connected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [realTimeRequests, setRealTimeRequests] = useState([]);
  const [acceptedJobs, setAcceptedJobs] = useState([]);
  const [activeRequests, setActiveRequests] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(68500);
  const [providerInfo] = useState({
    id: 'provider_001',
    name: 'John Doe',
    service: 'plumber',
    serviceType: 'plumbing',
    phone: '+923001234567'
  });

  // Mock static data
  const staticRequests = [
    { id: 1, service: 'Plumbing', customer: 'Ahmed Raza', location: 'Gulshan', budget: '₹2,500', time: '2 hours ago' },
    { id: 2, service: 'AC Repair', customer: 'Sara Khan', location: 'DHA', budget: '₹3,000', time: '5 hours ago' },
  ];

  // WebSocket setup - UPDATED FOR NATIVE WEBSOCKET
  useEffect(() => {
    console.log('🚀 ProviderDashboard mounting...');
    
    // Listen for connection events
    const handleConnected = (e) => {
      console.log('✅ Provider WebSocket connected');
      setConnected(true);
      setConnectionStatus('LIVE CONNECTED');
      
      // Update query params for provider
      socket.updateQueryParams({
        type: 'provider',
        user_id: providerInfo.id,
        name: providerInfo.name,
        service: providerInfo.serviceType
      });
      
      // Announce provider online
      socket.send('provider_online', {
        provider_id: providerInfo.id,
        name: providerInfo.name,
        service: providerInfo.serviceType
      });
      
      // Request pending requests
      socket.send('get_pending_requests');
    };
    
    const handleDisconnected = (e) => {
      console.log('❌ Provider WebSocket disconnected');
      setConnected(false);
      setConnectionStatus('OFFLINE');
    };
    
    const handleNewRequest = (e) => {
      const data = e.detail;
      console.log('🎯 NEW REQUEST from event:', data);
      
      const jobData = data.data || data;
      
      // Check if this provider should see this request
      if (providerInfo.serviceType && jobData.service_type && 
          providerInfo.serviceType !== jobData.service_type) {
        console.log(`Skipping ${jobData.service_type} request (I'm a ${providerInfo.serviceType})`);
        return;
      }
      
      // Create new request object
      const newRequest = {
        id: jobData.id || `job_${Date.now()}`,
        service: jobData.title || jobData.service_type || 'Service',
        customer: jobData.customer_name || jobData.customer || 'Customer',
        location: jobData.location || 'Not specified',
        budget: jobData.budget || 'Negotiable',
        time: 'Just now',
        description: jobData.description || '',
        schedule: jobData.schedule || 'ASAP',
        contact: jobData.contact_number || '',
        service_type: jobData.service_type || '',
        rawData: jobData
      };

      // Add to real-time requests
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
    
    const handleRequestAccepted = (e) => {
      const data = e.detail;
      console.log('✅ Request accepted:', data);
      alert(`✅ You accepted job: ${data.request_id}`);
      setActiveRequests(prev => Math.max(0, prev - 1));
    };
    
    const handleRequestTaken = (e) => {
      const data = e.detail;
      console.log('⚠️ Request taken:', data);
      setRealTimeRequests(prev => 
        prev.filter(req => req.id !== data.request_id)
      );
    };
    
    const handleInitialRequests = (e) => {
      const data = e.detail;
      console.log('📦 Initial requests:', data);
      if (Array.isArray(data)) {
        const formattedRequests = data.map(req => ({
          id: req.id,
          service: req.title || req.service_type,
          customer: req.customer_name || req.customer,
          location: req.location,
          budget: req.budget,
          time: 'Recently',
          description: req.description,
          schedule: req.schedule,
          contact: req.contact_number || '',
          service_type: req.service_type
        }));
        setRealTimeRequests(formattedRequests);
        setActiveRequests(formattedRequests.length);
      }
    };
    
    const handleWelcome = (e) => {
      console.log('👋 Welcome:', e.detail);
    };

    // Register event listeners for custom events
    window.addEventListener('socket-connected', handleConnected);
    window.addEventListener('socket-disconnected', handleDisconnected);
    window.addEventListener('ws-new_request', handleNewRequest);
    window.addEventListener('ws-request_accepted', handleRequestAccepted);
    window.addEventListener('ws-request_taken', handleRequestTaken);
    window.addEventListener('ws-initial_requests', handleInitialRequests);
    window.addEventListener('ws-welcome', handleWelcome);

    // Set provider query params and connect
    socket.updateQueryParams({
      type: 'provider',
      user_id: providerInfo.id,
      name: providerInfo.name,
      service: providerInfo.serviceType
    });
    
    // Connect to WebSocket
    socket.connect();
    
    // Check initial connection
    if (socket.isConnected()) {
      setConnected(true);
      setConnectionStatus('LIVE CONNECTED');
      console.log('✅ Socket already connected');
    } else {
      setConnectionStatus('CONNECTING...');
    }

    // Cleanup
    return () => {
      window.removeEventListener('socket-connected', handleConnected);
      window.removeEventListener('socket-disconnected', handleDisconnected);
      window.removeEventListener('ws-new_request', handleNewRequest);
      window.removeEventListener('ws-request_accepted', handleRequestAccepted);
      window.removeEventListener('ws-request_taken', handleRequestTaken);
      window.removeEventListener('ws-initial_requests', handleInitialRequests);
      window.removeEventListener('ws-welcome', handleWelcome);
    };
  }, [providerInfo]);

  // Accept job function - UPDATED
  const acceptJob = (jobId, jobData) => {
    if (!connected || !socket.isConnected()) {
      alert('⚠️ Please connect first');
      return;
    }

    // Update UI
    setRealTimeRequests(prev => prev.filter(req => req.id !== jobId));
    setAcceptedJobs(prev => [...prev, { ...jobData, acceptedAt: new Date() }]);
    setActiveRequests(prev => Math.max(0, prev - 1));
    
    const budgetValue = parseInt(jobData.budget.replace(/[^0-9]/g, '')) || 0;
    setTotalEarnings(prev => prev + budgetValue);

    // Send acceptance to server
    socket.send('request_accepted', {
      request_id: jobId,
      provider_id: providerInfo.id,
      provider_name: providerInfo.name,
      provider_service: providerInfo.service,
      provider_phone: providerInfo.phone,
      message: 'I will complete this job',
      timestamp: Date.now()
    });

    alert(`✅ Accepted: ${jobData.service} job from ${jobData.customer}`);
  };

  // Reconnect function - UPDATED
  const reconnectWebSocket = () => {
    socket.connect();
  };

  // Refresh requests - UPDATED
  const refreshRequests = () => {
    if (socket.isConnected()) {
      socket.send('get_pending_requests');
    } else {
      alert('Please connect to WebSocket first');
    }
  };

  // Combined requests
  const allRequests = [...realTimeRequests, ...staticRequests];

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Connection Status - UPDATED */}
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
            {connectionStatus} | {providerInfo.service} | {allRequests.length} Available Jobs
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
              {realTimeRequests.length > 0 && (
                <span style={{ color: '#dc3545', marginLeft: '5px', fontSize: '12px' }}>
                  ({realTimeRequests.length} new)
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
              {realTimeRequests.length > 0 ? '🔥 LIVE Service Requests' : 'Service Requests'}
              {realTimeRequests.length > 0 && (
                <span style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  marginLeft: '10px'
                }}>
                  {realTimeRequests.length} NEW
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
                  backgroundColor: index < realTimeRequests.length ? '#fff8e1' : '#f9f9f9',
                  borderLeft: index < realTimeRequests.length ? '5px solid #ffc107' : '5px solid #007bff'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ marginBottom: '10px', color: '#444' }}>
                      {req.service}
                      {index < realTimeRequests.length && (
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
                      {req.budget}
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
          {/* Profile */}
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

          {/* Connection Status */}
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
              <p><strong>Live Jobs:</strong> {realTimeRequests.length}</p>
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