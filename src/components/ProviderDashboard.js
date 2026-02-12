import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaBell, FaWallet, FaStar, FaMapMarkerAlt, FaCalendarAlt, 
  FaUser, FaCheckCircle, FaSearch, FaExclamationCircle,
  FaTachometerAlt, FaBriefcase, FaHistory, FaCog,
  FaSignOutAlt, FaPhone, FaEnvelope, FaClock,
  FaCheck, FaTimes, FaInfoCircle, FaSpinner,
  FaChartLine, FaMedal, FaThumbsUp, FaComment,
  FaCreditCard, FaDownload, FaPrint, FaShare
} from 'react-icons/fa';
import { socket } from '../Services/socket';

const ProviderDashboard = () => {
  const navigate = useNavigate();
  
  // ============ STATE MANAGEMENT ============
  const [connected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [realTimeRequests, setRealTimeRequests] = useState([]);
  const [acceptedJobs, setAcceptedJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [activeRequests, setActiveRequests] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [weeklyEarnings, setWeeklyEarnings] = useState(0);
  const [averageRating, setAverageRating] = useState(4.8);
  const [totalReviews, setTotalReviews] = useState(128);
  const [completionRate, setCompletionRate] = useState(98);
  const [responseTime, setResponseTime] = useState('< 2 min');
  
  // Provider info from localStorage
  const [providerInfo, setProviderInfo] = useState({
    id: '',
    name: '',
    service: '',
    serviceType: '',
    phone: '',
    email: '',
    address: '',
    verified: true,
    memberSince: '',
    jobsCompleted: 0
  });

  // UI State
  const [activeTab, setActiveTab] = useState('live');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEarningsModal, setShowEarningsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Refs for connection management
  const hasConnected = useRef(false);
  const socketInitialized = useRef(false);

  // ============ LOAD PROVIDER INFO ============
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
          service: providerService || user.service || 'electrical',
          serviceType: providerService || user.service || 'electrical',
          phone: user.phone || '0300-1234567',
          email: user.email || 'provider@example.com',
          address: user.address || 'Lahore, Pakistan',
          verified: true,
          memberSince: user.created_at || new Date().toISOString(),
          jobsCompleted: user.jobsCompleted || 47
        });
        
        // Load earnings from localStorage or API
        const savedEarnings = localStorage.getItem('provider_earnings');
        if (savedEarnings) {
          setTotalEarnings(parseInt(savedEarnings));
        } else {
          setTotalEarnings(68500);
          localStorage.setItem('provider_earnings', '68500');
        }
        
        // Calculate monthly/weekly earnings
        setMonthlyEarnings(Math.round(totalEarnings * 0.4));
        setWeeklyEarnings(Math.round(totalEarnings * 0.15));
        
        console.log('✅ Provider info loaded:', user.name, 'Service:', providerService || user.service);
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
  }, [totalEarnings]);

  // ============ WEBSOCKET SETUP ============
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
      
      socket.updateQueryParams({
        type: 'provider',
        user_id: providerInfo.id,
        name: providerInfo.name,
        service: providerInfo.serviceType
      });

      socket.updateAuth({
        id: providerInfo.id,
        name: providerInfo.name,
        user_type: 'provider',
        token: token,
        service: providerInfo.serviceType
      });

      if (!socket.isConnected() && !hasConnected.current) {
        hasConnected.current = true;
        setTimeout(() => {
          console.log('🔌 Connecting WebSocket...');
          socket.connect();
        }, 500);
      }
    }

    // ============ EVENT HANDLERS ============
    const handleConnected = () => {
      console.log('✅ Provider WebSocket connected');
      setConnected(true);
      setConnectionStatus('LIVE');
      
      socket.send('provider_online', {
        provider_id: providerInfo.id,
        name: providerInfo.name,
        service: providerInfo.serviceType
      });
      
      setTimeout(() => {
        socket.send('get_pending_requests');
      }, 500);
      
      // Add notification
      addNotification('success', 'Connected to live job feed');
    };
    
    const handleDisconnected = () => {
      console.log('❌ Provider WebSocket disconnected');
      setConnected(false);
      setConnectionStatus('OFFLINE');
      hasConnected.current = false;
      socketInitialized.current = false;
      addNotification('error', 'Disconnected from live feed');
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
          customerId: req.customerId,
          location: req.location || 'Not specified',
          budget: req.budget || 'Negotiable',
          budgetValue: parseInt(req.budget?.replace(/[^0-9]/g, '')) || 0,
          time: req.createdAt ? new Date(req.createdAt).toLocaleString() : 'Recently',
          description: req.description || '',
          schedule: req.schedule || 'ASAP',
          contact: req.contact || '',
          service_type: req.serviceType || req.service_type,
          distance: Math.floor(Math.random() * 5) + 1 + ' km',
          urgent: req.schedule === 'today' || req.schedule === 'ASAP'
        }));
        
        setRealTimeRequests(formattedRequests);
        setActiveRequests(formattedRequests.length);
      }
    };
    
    const handleNewRequest = (data) => {
      console.log('🎯 NEW REQUEST received:', data);
      
      const jobData = data.data || data;
      const requestService = jobData.serviceType || jobData.service_type;
      
      if (requestService && requestService !== providerInfo.serviceType) {
        console.log(`⏭️ Skipping ${requestService} request (I'm a ${providerInfo.serviceType})`);
        return;
      }
      
      const budgetValue = parseInt(jobData.budget?.replace(/[^0-9]/g, '')) || 0;
      
      const newRequest = {
        id: jobData.id || `job_${Date.now()}`,
        service: jobData.title || jobData.service_type || 'Service',
        customer: jobData.customerName || jobData.customer || 'Customer',
        customerId: jobData.customerId,
        location: jobData.location || 'Not specified',
        budget: jobData.budget || 'Negotiable',
        budgetValue: budgetValue,
        time: 'Just now',
        description: jobData.description || '',
        schedule: jobData.schedule || 'ASAP',
        contact: jobData.contact || jobData.contact_number || '',
        service_type: jobData.serviceType || jobData.service_type,
        distance: Math.floor(Math.random() * 3) + 1 + ' km',
        urgent: jobData.schedule === 'today' || jobData.schedule === 'ASAP'
      };

      setRealTimeRequests(prev => [newRequest, ...prev]);
      setActiveRequests(prev => prev + 1);
      
      // Show notification
      addNotification('info', `New ${newRequest.service} job available - ${newRequest.budget}`);
      
      // Browser notification
      if (Notification.permission === 'granted') {
        new Notification('🎯 New Job Available!', {
          body: `${newRequest.service} - ${newRequest.location} - ${newRequest.budget}`,
          icon: '/logo.png',
          tag: newRequest.id
        });
      }
    };
    
    const handleRequestAccepted = (data) => {
      console.log('✅ Request accepted:', data);
      // This is just confirmation, the job is already removed from UI
    };
    
    const handleRequestTaken = (data) => {
      console.log('⚠️ Request taken:', data);
      setRealTimeRequests(prev => 
        prev.filter(req => req.id !== (data.request_id || data.id))
      );
      setActiveRequests(prev => Math.max(0, prev - 1));
    };

    const handleAcceptError = (data) => {
      console.error('❌ Failed to accept request:', data);
      
      const errorMsg = data.data?.message || data.message || 'Failed to accept request';
      
      if (errorMsg.includes('already')) {
        alert('⚠️ This job was already accepted by another provider');
        // Remove from UI
        setRealTimeRequests(prev => 
          prev.filter(req => req.id !== (data.request_id || data.id))
        );
      } else {
        alert(`❌ ${errorMsg}`);
      }
    };

    const handleOrderCompleted = (data) => {
      console.log('✅ Order completed:', data);
      
      // Move from accepted to completed
      const completedJob = acceptedJobs.find(job => job.id === data.request_id);
      if (completedJob) {
        setAcceptedJobs(prev => prev.filter(job => job.id !== data.request_id));
        setCompletedJobs(prev => [...prev, { ...completedJob, completedAt: new Date() }]);
      }
      
      addNotification('success', 'Job marked as completed! Payment will be processed.');
    };

    const handlePaymentConfirmed = (data) => {
      console.log('💰 Payment confirmed:', data);
      setTotalEarnings(prev => prev + (data.amount || 0));
      localStorage.setItem('provider_earnings', (totalEarnings + (data.amount || 0)).toString());
      addNotification('success', `Payment of Rs. ${data.amount} received!`);
    };

    const handleNewMessage = (data) => {
      console.log('💬 New message:', data);
      addNotification('info', `New message from ${data.senderName}`);
    };

    // Register event listeners
    socket.on('connected', handleConnected);
    socket.on('disconnected', handleDisconnected);
    socket.on('pending_requests', handlePendingRequests);
    socket.on('new_request', handleNewRequest);
    socket.on('request_accepted', handleRequestAccepted);
    socket.on('request_taken', handleRequestTaken);
    socket.on('accept_error', handleAcceptError);
    socket.on('order_completed', handleOrderCompleted);
    socket.on('payment_confirmed', handlePaymentConfirmed);
    socket.on('new_message', handleNewMessage);

    // Check initial connection
    if (socket.isConnected()) {
      setConnected(true);
      setConnectionStatus('LIVE');
      setTimeout(() => socket.send('get_pending_requests'), 500);
    }

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
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
      socket.off('accept_error', handleAcceptError);
      socket.off('order_completed', handleOrderCompleted);
      socket.off('payment_confirmed', handlePaymentConfirmed);
      socket.off('new_message', handleNewMessage);
    };
  }, [providerInfo.id, providerInfo.name, providerInfo.serviceType, acceptedJobs]);

  // ============ HELPER FUNCTIONS ============
  const addNotification = (type, message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message, timestamp: new Date() }]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Manual reconnect
  const reconnectWebSocket = () => {
    console.log('🔌 Manual reconnect triggered');
    hasConnected.current = false;
    socketInitialized.current = false;
    
    const token = localStorage.getItem('token');
    socket.updateAuth({
      id: providerInfo.id,
      name: providerInfo.name,
      user_type: 'provider',
      token: token,
      service: providerInfo.serviceType
    });
    
    setTimeout(() => {
      socket.connect();
    }, 500);
  };

  // Accept job
  const acceptJob = (jobId, jobData) => {
    if (!connected || !socket.isConnected()) {
      alert('⚠️ Please wait for connection to establish');
      reconnectWebSocket();
      return;
    }

    // Remove from live requests
    setRealTimeRequests(prev => prev.filter(req => req.id !== jobId));
    
    // Add to accepted jobs
    const acceptedJob = {
      ...jobData,
      acceptedAt: new Date().toISOString(),
      status: 'accepted',
      estimatedCompletion: new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleTimeString()
    };
    
    setAcceptedJobs(prev => [acceptedJob, ...prev]);
    setActiveRequests(prev => Math.max(0, prev - 1));
    
    // Update earnings estimate
    const budgetValue = jobData.budgetValue || parseInt(jobData.budget?.replace(/[^0-9]/g, '')) || 0;
    
    // Send accept request
    socket.send('accept_request', {
      request_id: jobId,
      provider_id: providerInfo.id,
      provider_name: providerInfo.name,
      provider_service: providerInfo.serviceType
    });

    addNotification('success', `Job accepted! You're now working with ${jobData.customer}`);
  };

  // Complete job
  const completeJob = (jobId) => {
    const job = acceptedJobs.find(j => j.id === jobId);
    if (!job) return;
    
    setAcceptedJobs(prev => prev.filter(j => j.id !== jobId));
    setCompletedJobs(prev => [...prev, { ...job, completedAt: new Date().toISOString() }]);
    
    socket.send('complete_request', {
      request_id: jobId,
      provider_id: providerInfo.id
    });
    
    addNotification('success', 'Job marked as completed! Waiting for payment confirmation.');
  };

  // Refresh requests
  const refreshRequests = () => {
    if (socket.isConnected()) {
      socket.send('get_pending_requests');
      addNotification('info', 'Refreshing job feed...');
    } else {
      reconnectWebSocket();
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('provider_service');
    socket.disconnect();
    navigate('/provider-portal');
  };

  // Filter requests by service type
  const filteredRequests = realTimeRequests.filter(req => 
    !req.service_type || req.service_type === providerInfo.serviceType
  );

  // Format currency
  const formatCurrency = (amount) => {
    return `Rs. ${amount.toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-PK', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ============ RENDER ============
  return (
    <div style={styles.container}>
      {/* Notifications Toast */}
      <div style={styles.notificationContainer}>
        {notifications.map(notification => (
          <div key={notification.id} style={{
            ...styles.notification,
            backgroundColor: notification.type === 'success' ? '#10b981' :
                           notification.type === 'error' ? '#ef4444' : '#3b82f6'
          }}>
            <span>{notification.message}</span>
            <button 
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
              style={styles.notificationClose}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Main Dashboard Grid */}
      <div style={styles.dashboardGrid}>
        
        {/* ============ SIDEBAR ============ */}
        <div style={{
          ...styles.sidebar,
          width: sidebarCollapsed ? '80px' : '280px'
        }}>
          <div style={styles.sidebarHeader}>
            <div style={styles.logo}>
              {!sidebarCollapsed ? 'DASTAK PK' : 'DP'}
            </div>
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={styles.collapseBtn}
            >
              {sidebarCollapsed ? '→' : '←'}
            </button>
          </div>

          <div style={styles.profileCard}>
            <div style={styles.profileAvatar}>
              {providerInfo.name.charAt(0)}
            </div>
            {!sidebarCollapsed && (
              <>
                <h3 style={styles.profileName}>{providerInfo.name}</h3>
                <p style={styles.profileService}>{providerInfo.service}</p>
                <div style={styles.profileRating}>
                  <FaStar style={{ color: '#ffc107' }} />
                  <span>{averageRating}</span>
                  <span style={styles.reviewCount}>({totalReviews})</span>
                </div>
                {providerInfo.verified && (
                  <div style={styles.verifiedBadge}>
                    <FaCheckCircle /> Verified
                  </div>
                )}
              </>
            )}
          </div>

          <div style={styles.navMenu}>
            <button 
              style={{
                ...styles.navItem,
                backgroundColor: activeTab === 'live' ? '#3b82f610' : 'transparent',
                color: activeTab === 'live' ? '#3b82f6' : '#64748b'
              }}
              onClick={() => setActiveTab('live')}
            >
              <FaTachometerAlt style={styles.navIcon} />
              {!sidebarCollapsed && <span>Live Jobs</span>}
            </button>

            <button 
              style={{
                ...styles.navItem,
                backgroundColor: activeTab === 'accepted' ? '#3b82f610' : 'transparent',
                color: activeTab === 'accepted' ? '#3b82f6' : '#64748b'
              }}
              onClick={() => setActiveTab('accepted')}
            >
              <FaBriefcase style={styles.navIcon} />
              {!sidebarCollapsed && <span>My Jobs</span>}
              {acceptedJobs.length > 0 && !sidebarCollapsed && (
                <span style={styles.navBadge}>{acceptedJobs.length}</span>
              )}
            </button>

            <button 
              style={{
                ...styles.navItem,
                backgroundColor: activeTab === 'history' ? '#3b82f610' : 'transparent',
                color: activeTab === 'history' ? '#3b82f6' : '#64748b'
              }}
              onClick={() => setActiveTab('history')}
            >
              <FaHistory style={styles.navIcon} />
              {!sidebarCollapsed && <span>History</span>}
            </button>

            <button 
              style={styles.navItem}
              onClick={() => setShowEarningsModal(true)}
            >
              <FaWallet style={styles.navIcon} />
              {!sidebarCollapsed && <span>Earnings</span>}
            </button>

            <button 
              style={styles.navItem}
              onClick={() => setShowSettingsModal(true)}
            >
              <FaCog style={styles.navIcon} />
              {!sidebarCollapsed && <span>Settings</span>}
            </button>
          </div>

          <div style={styles.sidebarFooter}>
            <button 
              style={styles.navItem}
              onClick={handleLogout}
            >
              <FaSignOutAlt style={styles.navIcon} />
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
            
            {!sidebarCollapsed && (
              <div style={styles.connectionStatusSidebar}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: connected ? '#10b981' : '#ef4444',
                  marginRight: '8px'
                }} />
                <span>{connectionStatus}</span>
              </div>
            )}
          </div>
        </div>

        {/* ============ MAIN CONTENT ============ */}
        <div style={styles.mainContent}>
          
          {/* ============ HEADER ============ */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <h1 style={styles.pageTitle}>Provider Dashboard</h1>
              <p style={styles.pageSubtitle}>
                Welcome back, <strong>{providerInfo.name}</strong>
              </p>
            </div>
            
            <div style={styles.headerRight}>
              {/* Notification Bell */}
              <div style={styles.notificationBell}>
                <FaBell />
                {notifications.length > 0 && (
                  <span style={styles.notificationDot} />
                )}
              </div>
              
              {/* Connection Status Badge */}
              <div style={{
                ...styles.connectionBadge,
                backgroundColor: connected ? '#10b981' : '#ef4444'
              }}>
                <div style={styles.connectionDot} />
                {connectionStatus}
              </div>
            </div>
          </div>

          {/* ============ STATS CARDS ============ */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statIconWrapper}>
                <FaWallet style={{ color: '#3b82f6', fontSize: '24px' }} />
              </div>
              <div style={styles.statInfo}>
                <h3 style={styles.statValue}>{formatCurrency(totalEarnings)}</h3>
                <p style={styles.statLabel}>Total Earnings</p>
              </div>
            </div>
            
            <div style={styles.statCard}>
              <div style={styles.statIconWrapper}>
                <FaBriefcase style={{ color: '#10b981', fontSize: '24px' }} />
              </div>
              <div style={styles.statInfo}>
                <h3 style={styles.statValue}>{acceptedJobs.length + completedJobs.length}</h3>
                <p style={styles.statLabel}>Jobs Completed</p>
              </div>
            </div>
            
            <div style={styles.statCard}>
              <div style={styles.statIconWrapper}>
                <FaStar style={{ color: '#ffc107', fontSize: '24px' }} />
              </div>
              <div style={styles.statInfo}>
                <h3 style={styles.statValue}>{averageRating}</h3>
                <p style={styles.statLabel}>Rating</p>
                <span style={styles.statSubtext}>({totalReviews} reviews)</span>
              </div>
            </div>
            
            <div style={styles.statCard}>
              <div style={styles.statIconWrapper}>
                <FaClock style={{ color: '#8b5cf6', fontSize: '24px' }} />
              </div>
              <div style={styles.statInfo}>
                <h3 style={styles.statValue}>{responseTime}</h3>
                <p style={styles.statLabel}>Response Time</p>
              </div>
            </div>
          </div>

          {/* ============ TAB CONTENT ============ */}
          
          {/* TAB 1: LIVE JOBS */}
          {activeTab === 'live' && (
            <div style={styles.tabContent}>
              <div style={styles.tabHeader}>
                <h2 style={styles.tabTitle}>
                  <FaBell style={{ marginRight: '10px', color: '#3b82f6' }} />
                  Live Job Requests
                  {filteredRequests.length > 0 && (
                    <span style={styles.liveBadge}>
                      {filteredRequests.length} NEW
                    </span>
                  )}
                </h2>
                <button 
                  onClick={refreshRequests}
                  style={styles.refreshButton}
                >
                  <FaSpinner className={socket.isConnected() ? '' : 'spin'} />
                  Refresh
                </button>
              </div>

              {filteredRequests.length === 0 ? (
                <div style={styles.emptyState}>
                  <FaExclamationCircle style={styles.emptyIcon} />
                  <h3>No live jobs available</h3>
                  <p>New requests will appear here in real-time</p>
                  {!connected && (
                    <button 
                      onClick={reconnectWebSocket}
                      style={styles.connectButton}
                    >
                      Connect to Live Feed
                    </button>
                  )}
                </div>
              ) : (
                <div style={styles.jobsGrid}>
                  {filteredRequests.map((job) => (
                    <div key={job.id} style={{
                      ...styles.jobCard,
                      borderLeft: job.urgent ? '5px solid #ef4444' : '5px solid #3b82f6'
                    }}>
                      <div style={styles.jobHeader}>
                        <div>
                          <h3 style={styles.jobTitle}>{job.service}</h3>
                          <div style={styles.jobMeta}>
                            <span style={styles.jobCustomer}>
                              <FaUser /> {job.customer}
                            </span>
                            <span style={styles.jobDistance}>
                              <FaMapMarkerAlt /> {job.distance}
                            </span>
                          </div>
                        </div>
                        <div style={styles.jobBudget}>
                          <span style={styles.budgetAmount}>{job.budget}</span>
                          {job.urgent && (
                            <span style={styles.urgentBadge}>URGENT</span>
                          )}
                        </div>
                      </div>

                      <p style={styles.jobDescription}>
                        {job.description?.length > 100 
                          ? `${job.description.substring(0, 100)}...` 
                          : job.description}
                      </p>

                      <div style={styles.jobDetails}>
                        <div style={styles.jobDetailItem}>
                          <FaMapMarkerAlt style={styles.detailIcon} />
                          <span>{job.location}</span>
                        </div>
                        <div style={styles.jobDetailItem}>
                          <FaCalendarAlt style={styles.detailIcon} />
                          <span>{job.schedule}</span>
                        </div>
                        <div style={styles.jobDetailItem}>
                          <FaClock style={styles.detailIcon} />
                          <span>{job.time}</span>
                        </div>
                      </div>

                      <div style={styles.jobActions}>
                        <button 
                          onClick={() => {
                            setSelectedRequest(job);
                            setShowDetailsModal(true);
                          }}
                          style={styles.detailsButton}
                        >
                          <FaInfoCircle /> Details
                        </button>
                        <button 
                          onClick={() => acceptJob(job.id, job)}
                          style={styles.acceptButton}
                        >
                          <FaCheck /> Accept Job
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MY JOBS (Accepted) */}
          {activeTab === 'accepted' && (
            <div style={styles.tabContent}>
              <div style={styles.tabHeader}>
                <h2 style={styles.tabTitle}>
                  <FaBriefcase style={{ marginRight: '10px', color: '#10b981' }} />
                  My Accepted Jobs
                </h2>
              </div>

              {acceptedJobs.length === 0 ? (
                <div style={styles.emptyState}>
                  <FaBriefcase style={styles.emptyIcon} />
                  <h3>No accepted jobs</h3>
                  <p>Jobs you accept will appear here</p>
                </div>
              ) : (
                <div style={styles.acceptedJobsList}>
                  {acceptedJobs.map((job) => (
                    <div key={job.id} style={styles.acceptedJobCard}>
                      <div style={styles.acceptedJobHeader}>
                        <div>
                          <h3 style={styles.jobTitle}>{job.service}</h3>
                          <p style={styles.jobCustomerName}>{job.customer}</p>
                        </div>
                        <div style={styles.jobBudget}>
                          <span style={styles.budgetAmount}>{job.budget}</span>
                        </div>
                      </div>
                      
                      <div style={styles.jobProgress}>
                        <div style={styles.progressBar}>
                          <div style={{...styles.progressFill, width: '50%'}} />
                        </div>
                        <span style={styles.progressText}>In Progress</span>
                      </div>

                      <div style={styles.jobDetails}>
                        <div style={styles.jobDetailItem}>
                          <FaMapMarkerAlt style={styles.detailIcon} />
                          <span>{job.location}</span>
                        </div>
                        <div style={styles.jobDetailItem}>
                          <FaCalendarAlt style={styles.detailIcon} />
                          <span>Accepted: {formatTime(job.acceptedAt)}</span>
                        </div>
                      </div>

                      <div style={styles.jobActions}>
                        <button 
                          onClick={() => {/* Open chat */}}
                          style={styles.chatButton}
                        >
                          <FaComment /> Message
                        </button>
                        <button 
                          onClick={() => completeJob(job.id)}
                          style={styles.completeButton}
                        >
                          <FaCheckCircle /> Mark Complete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: HISTORY */}
          {activeTab === 'history' && (
            <div style={styles.tabContent}>
              <div style={styles.tabHeader}>
                <h2 style={styles.tabTitle}>
                  <FaHistory style={{ marginRight: '10px', color: '#8b5cf6' }} />
                  Job History
                </h2>
              </div>

              {completedJobs.length === 0 ? (
                <div style={styles.emptyState}>
                  <FaHistory style={styles.emptyIcon} />
                  <h3>No job history</h3>
                  <p>Completed jobs will appear here</p>
                </div>
              ) : (
                <div style={styles.historyList}>
                  {completedJobs.map((job) => (
                    <div key={job.id} style={styles.historyCard}>
                      <div style={styles.historyHeader}>
                        <div>
                          <h3 style={styles.jobTitle}>{job.service}</h3>
                          <p style={styles.jobCustomerName}>{job.customer}</p>
                        </div>
                        <div style={styles.historyAmount}>
                          {job.budget}
                        </div>
                      </div>
                      <div style={styles.historyFooter}>
                        <span style={styles.historyDate}>
                          <FaCalendarAlt /> Completed: {formatDate(job.completedAt)}
                        </span>
                        <div style={styles.historyActions}>
                          <button style={styles.reviewButton}>
                            <FaStar /> Review
                          </button>
                          <button style={styles.downloadButton}>
                            <FaDownload /> Invoice
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ============ JOB DETAILS MODAL ============ */}
      {showDetailsModal && selectedRequest && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2>Job Details</h2>
              <button 
                onClick={() => setShowDetailsModal(false)}
                style={styles.modalClose}
              >
                ×
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.modalSection}>
                <h3>{selectedRequest.service}</h3>
                <p>{selectedRequest.description}</p>
              </div>
              
              <div style={styles.modalGrid}>
                <div>
                  <strong>Customer</strong>
                  <p>{selectedRequest.customer}</p>
                </div>
                <div>
                  <strong>Location</strong>
                  <p>{selectedRequest.location}</p>
                </div>
                <div>
                  <strong>Budget</strong>
                  <p style={{ color: '#10b981', fontWeight: 'bold' }}>{selectedRequest.budget}</p>
                </div>
                <div>
                  <strong>Schedule</strong>
                  <p>{selectedRequest.schedule}</p>
                </div>
                <div>
                  <strong>Contact</strong>
                  <p>{selectedRequest.contact || 'N/A'}</p>
                </div>
                <div>
                  <strong>Posted</strong>
                  <p>{selectedRequest.time}</p>
                </div>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button 
                onClick={() => setShowDetailsModal(false)}
                style={styles.modalCancel}
              >
                Close
              </button>
              <button 
                onClick={() => {
                  acceptJob(selectedRequest.id, selectedRequest);
                  setShowDetailsModal(false);
                }}
                style={styles.modalAccept}
              >
                Accept Job
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ EARNINGS MODAL ============ */}
      {showEarningsModal && (
        <div style={styles.modalOverlay}>
          <div style={{...styles.modal, maxWidth: '600px'}}>
            <div style={styles.modalHeader}>
              <h2>Earnings Overview</h2>
              <button 
                onClick={() => setShowEarningsModal(false)}
                style={styles.modalClose}
              >
                ×
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.earningsSummary}>
                <div style={styles.earningsCard}>
                  <span style={styles.earningsLabel}>Total Earnings</span>
                  <span style={styles.earningsValue}>{formatCurrency(totalEarnings)}</span>
                </div>
                <div style={styles.earningsCard}>
                  <span style={styles.earningsLabel}>This Month</span>
                  <span style={styles.earningsValue}>{formatCurrency(monthlyEarnings)}</span>
                </div>
                <div style={styles.earningsCard}>
                  <span style={styles.earningsLabel}>This Week</span>
                  <span style={styles.earningsValue}>{formatCurrency(weeklyEarnings)}</span>
                </div>
              </div>
              
              <div style={styles.earningsChart}>
                <h3>Recent Transactions</h3>
                <div style={styles.transactionList}>
                  {acceptedJobs.slice(0, 3).map((job, index) => (
                    <div key={index} style={styles.transactionItem}>
                      <div>
                        <p style={styles.transactionTitle}>{job.service}</p>
                        <p style={styles.transactionDate}>{formatDate(job.acceptedAt)}</p>
                      </div>
                      <span style={styles.transactionAmount}>{job.budget}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <button style={styles.withdrawButton}>
                <FaCreditCard /> Withdraw Earnings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============ STYLES ============
const styles = {
  container: {
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'relative',
  },
  notificationContainer: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  notification: {
    padding: '12px 20px',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: '300px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    animation: 'slideIn 0.3s ease',
  },
  notificationClose: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '20px',
    cursor: 'pointer',
    marginLeft: '10px',
  },
  dashboardGrid: {
    display: 'flex',
    minHeight: '100vh',
  },
  sidebar: {
    backgroundColor: 'white',
    boxShadow: '2px 0 10px rgba(0,0,0,0.02)',
    transition: 'width 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: 0,
    height: '100vh',
  },
  sidebarHeader: {
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #e2e8f0',
  },
  logo: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#3b82f6',
    letterSpacing: '1px',
  },
  collapseBtn: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    color: '#64748b',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: '#f1f5f9',
    },
  },
  profileCard: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    borderBottom: '1px solid #e2e8f0',
  },
  profileAvatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '12px',
  },
  profileName: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#0f172a',
  },
  profileService: {
    margin: '4px 0',
    fontSize: '14px',
    color: '#64748b',
  },
  profileRating: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '4px',
    fontSize: '14px',
  },
  reviewCount: {
    color: '#94a3b8',
    marginLeft: '2px',
  },
  verifiedBadge: {
    marginTop: '8px',
    padding: '4px 12px',
    backgroundColor: '#10b98110',
    color: '#10b981',
    borderRadius: '20px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  navMenu: {
    flex: 1,
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    border: 'none',
    background: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
    '&:hover': {
      backgroundColor: '#f1f5f9',
    },
  },
  navIcon: {
    fontSize: '18px',
  },
  navBadge: {
    position: 'absolute',
    right: '16px',
    backgroundColor: '#ef4444',
    color: 'white',
    padding: '2px 6px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
  },
  sidebarFooter: {
    padding: '24px 16px',
    borderTop: '1px solid #e2e8f0',
  },
  connectionStatusSidebar: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '16px',
    padding: '8px 12px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#64748b',
  },
  mainContent: {
    flex: 1,
    padding: '30px',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  headerLeft: {},
  pageTitle: {
    margin: 0,
    fontSize: '28px',
    fontWeight: '700',
    color: '#0f172a',
  },
  pageSubtitle: {
    margin: '5px 0 0',
    fontSize: '15px',
    color: '#64748b',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  notificationBell: {
    position: 'relative',
    fontSize: '20px',
    color: '#64748b',
    cursor: 'pointer',
  },
  notificationDot: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    width: '10px',
    height: '10px',
    backgroundColor: '#ef4444',
    borderRadius: '50%',
    border: '2px solid white',
  },
  connectionBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '30px',
    color: 'white',
    fontSize: '12px',
    fontWeight: '600',
  },
  connectionDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'white',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
    border: '1px solid #f1f5f9',
  },
  statIconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    color: '#0f172a',
  },
  statLabel: {
    margin: '4px 0 0',
    fontSize: '13px',
    color: '#64748b',
  },
  statSubtext: {
    fontSize: '11px',
    color: '#94a3b8',
  },
  tabContent: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
    border: '1px solid #f1f5f9',
  },
  tabHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
  },
  tabTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
    color: '#0f172a',
    display: 'flex',
    alignItems: 'center',
  },
  liveBadge: {
    marginLeft: '12px',
    padding: '4px 10px',
    backgroundColor: '#ef4444',
    color: 'white',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: 'white',
    color: '#3b82f6',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#f8fafc',
    },
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#64748b',
  },
  emptyIcon: {
    fontSize: '48px',
    color: '#cbd5e1',
    marginBottom: '16px',
  },
  connectButton: {
    marginTop: '20px',
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  jobsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
  },
  jobCard: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s',
    '&:hover': {
      boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
      transform: 'translateY(-2px)',
    },
  },
  jobHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  jobTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#0f172a',
  },
  jobMeta: {
    display: 'flex',
    gap: '12px',
    marginTop: '6px',
    fontSize: '12px',
    color: '#64748b',
  },
  jobCustomer: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  jobDistance: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  jobBudget: {
    textAlign: 'right',
  },
  budgetAmount: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#10b981',
    display: 'block',
  },
  urgentBadge: {
    display: 'inline-block',
    marginTop: '4px',
    padding: '2px 8px',
    backgroundColor: '#ef444410',
    color: '#ef4444',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: '600',
  },
  jobDescription: {
    fontSize: '14px',
    color: '#475569',
    lineHeight: '1.6',
    marginBottom: '16px',
  },
  jobDetails: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: 'white',
    borderRadius: '8px',
  },
  jobDetailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#64748b',
  },
  detailIcon: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  jobActions: {
    display: 'flex',
    gap: '12px',
  },
  detailsButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px',
    backgroundColor: 'white',
    color: '#3b82f6',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  acceptButton: {
    flex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  acceptedJobsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  acceptedJobCard: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e2e8f0',
  },
  acceptedJobHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  jobCustomerName: {
    margin: '4px 0 0',
    fontSize: '13px',
    color: '#64748b',
  },
  jobProgress: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  progressBar: {
    flex: 1,
    height: '6px',
    backgroundColor: '#e2e8f0',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: '3px',
  },
  progressText: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#10b981',
  },
  chatButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  completeButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px',
    backgroundColor: '#8b5cf6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  historyCard: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e2e8f0',
  },
  historyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  historyAmount: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#10b981',
  },
  historyFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #e2e8f0',
  },
  historyDate: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#64748b',
  },
  historyActions: {
    display: 'flex',
    gap: '8px',
  },
  reviewButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    backgroundColor: '#ffc10710',
    color: '#ffc107',
    border: '1px solid #ffc10730',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  downloadButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    backgroundColor: '#3b82f610',
    color: '#3b82f6',
    border: '1px solid #3b82f630',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '30px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  modalClose: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#64748b',
  },
  modalBody: {
    marginBottom: '20px',
  },
  modalSection: {
    marginBottom: '20px',
  },
  modalGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginTop: '20px',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '20px',
  },
  modalCancel: {
    padding: '10px 20px',
    backgroundColor: 'white',
    color: '#64748b',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  modalAccept: {
    padding: '10px 20px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  earningsSummary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  earningsCard: {
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  earningsLabel: {
    fontSize: '12px',
    color: '#64748b',
  },
  earningsValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#0f172a',
  },
  earningsChart: {
    marginBottom: '24px',
  },
  transactionList: {
    marginTop: '12px',
  },
  transactionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    borderBottom: '1px solid #e2e8f0',
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  transactionTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '500',
    color: '#0f172a',
  },
  transactionDate: {
    margin: '2px 0 0',
    fontSize: '11px',
    color: '#94a3b8',
  },
  transactionAmount: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#10b981',
  },
  withdrawButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
};

// Global animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .spin {
      animation: spin 1s linear infinite;
    }
  `;
  document.head.appendChild(style);
}

export default ProviderDashboard;