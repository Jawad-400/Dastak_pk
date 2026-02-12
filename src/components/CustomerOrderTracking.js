import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaArrowLeft, FaClock, FaCheckCircle, FaTimesCircle, 
  FaSpinner, FaExclamationTriangle, FaStar, FaPhone, 
  FaMapMarkerAlt, FaUser, FaTools, FaRupeeSign, FaCalendarAlt,
  FaComments, FaCreditCard, FaHistory, FaBell, FaHome,
  FaShoppingCart, FaBox, FaDownload
} from 'react-icons/fa';
import { socket } from '../Services/socket';

const CustomerOrderTracking = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [showChat, setShowChat] = useState(false);

  // Load customer info
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      setError('Please login first');
      setTimeout(() => navigate('/customer-login'), 2000);
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      setCustomerInfo(user);
      console.log('✅ Customer loaded:', user.name);
    } catch (e) {
      console.error('Error parsing user:', e);
    }
  }, [navigate]);

  // Fetch customer's requests
  useEffect(() => {
    if (!customerInfo?.id) return;

    const fetchRequests = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(
          `http://localhost:4000/api/auth/users/${customerInfo.id}/requests`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (data.success) {
          setRequests(data.data.requests);
        } else {
          setError(data.error || 'Failed to fetch requests');
        }
      } catch (err) {
        console.error('Error fetching requests:', err);
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();

    // WebSocket listeners for real-time updates
    const handleRequestAccepted = (data) => {
      console.log('✅ Request accepted:', data);
      setRequests(prev => 
        prev.map(req => 
          req.id === data.requestId 
            ? { 
                ...req, 
                status: 'accepted',
                providerName: data.providerName,
                providerId: data.providerId,
                acceptedAt: new Date().toISOString()
              }
            : req
        )
      );
      showNotification('🎯 Request Accepted!', `${data.providerName} will contact you soon.`);
    };

    const handleOrderCompleted = (data) => {
      console.log('✅ Order completed:', data);
      setRequests(prev => 
        prev.map(req => 
          req.id === data.requestId 
            ? { ...req, status: 'completed', completedAt: new Date().toISOString() }
            : req
        )
      );
      showNotification('✅ Order Completed!', 'Your service request has been completed.');
    };

    const handlePaymentConfirmed = (data) => {
      console.log('💰 Payment confirmed:', data);
      setRequests(prev => 
        prev.map(req => 
          req.id === data.requestId 
            ? { ...req, paymentStatus: 'paid', paymentId: data.paymentId }
            : req
        )
      );
      showNotification('💰 Payment Successful!', `Payment of ${formatBudget(data.amount)} has been processed.`);
    };

    const handleNewMessage = (data) => {
      console.log('💬 New message:', data);
      if (data.requestId === selectedRequest?.id) {
        setChatMessages(prev => [...prev, {
          id: data.messageId,
          text: data.message,
          sender: data.sender,
          timestamp: new Date().toISOString()
        }]);
      }
      showNotification('💬 New Message', `You have a new message from ${data.senderName}`);
    };

    // Register socket listeners
    socket.on('request_accepted', handleRequestAccepted);
    socket.on('order_completed', handleOrderCompleted);
    socket.on('payment_confirmed', handlePaymentConfirmed);
    socket.on('new_message', handleNewMessage);
    socket.on('connected', () => setConnected(true));
    socket.on('disconnected', () => setConnected(false));

    // Connect socket if not connected
    if (!socket.isConnected()) {
      socket.connect();
    }

    return () => {
      socket.off('request_accepted', handleRequestAccepted);
      socket.off('order_completed', handleOrderCompleted);
      socket.off('payment_confirmed', handlePaymentConfirmed);
      socket.off('new_message', handleNewMessage);
      socket.off('connected');
      socket.off('disconnected');
    };
  }, [customerInfo?.id, selectedRequest]);

  // Show notification
  const showNotification = (title, body) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/logo.png' });
    }
  };

  // Request notification permission
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format budget
  const formatBudget = (budget) => {
    if (!budget) return 'N/A';
    const amount = budget.toString().replace(/[^0-9]/g, '');
    return `Rs. ${parseInt(amount || 0).toLocaleString()}`;
  };

  // Get status configuration
  const getStatusConfig = (status) => {
    switch(status) {
      case 'pending':
        return {
          color: '#856404',
          bg: '#fff3cd',
          icon: <FaClock />,
          text: 'Looking for providers...',
          progress: 25,
          badge: 'Pending'
        };
      case 'accepted':
        return {
          color: '#155724',
          bg: '#d4edda',
          icon: <FaCheckCircle />,
          text: 'Provider assigned',
          progress: 50,
          badge: 'In Progress'
        };
      case 'in_progress':
        return {
          color: '#004085',
          bg: '#cce5ff',
          icon: <FaTools />,
          text: 'Service in progress',
          progress: 75,
          badge: 'In Progress'
        };
      case 'completed':
        return {
          color: '#004085',
          bg: '#cce5ff',
          icon: <FaCheckCircle />,
          text: 'Completed',
          progress: 100,
          badge: 'Completed'
        };
      case 'rejected':
        return {
          color: '#721c24',
          bg: '#f8d7da',
          icon: <FaTimesCircle />,
          text: 'Cancelled',
          progress: 0,
          badge: 'Cancelled'
        };
      default:
        return {
          color: '#6c757d',
          bg: '#e9ecef',
          icon: <FaClock />,
          text: status,
          progress: 0,
          badge: status
        };
    }
  };

  // Filter requests by status
  const filteredRequests = requests.filter(req => {
    if (activeTab === 'active') return ['pending', 'accepted', 'in_progress'].includes(req.status);
    if (activeTab === 'completed') return req.status === 'completed';
    if (activeTab === 'cancelled') return req.status === 'rejected';
    return true;
  });

  // Handle rating submission
  const handleSubmitRating = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/requests/${selectedRequest.id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating,
          review,
          customerId: customerInfo.id,
          providerId: selectedRequest.providerId
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Thank you for your feedback!');
        setShowRatingModal(false);
        setRating(0);
        setReview('');
        setSelectedRequest(null);
      }
    } catch (err) {
      console.error('Error submitting rating:', err);
      alert('Failed to submit rating. Please try again.');
    }
  };

  // Handle payment
  const handlePayment = async (request) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          requestId: request.id,
          amount: request.budget,
          customerId: customerInfo.id,
          providerId: request.providerId
        })
      });

      const data = await response.json();

      if (data.success) {
        // In production, redirect to payment gateway
        alert('💰 Redirecting to payment gateway...');
        // Simulate payment success
        setTimeout(() => {
          socket.send('payment_confirmed', {
            requestId: request.id,
            amount: request.budget,
            paymentId: data.data.paymentId
          });
        }, 2000);
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      alert('Payment failed. Please try again.');
    }
  };

  // Handle chat
  const openChat = (request) => {
    setSelectedRequest(request);
    setShowChat(true);
    setChatMessages([
      {
        id: 1,
        text: `Hello! I'm ${request.providerName}. I've accepted your request for ${request.title}.`,
        sender: 'provider',
        timestamp: request.acceptedAt,
        senderName: request.providerName
      }
    ]);
  };

  const sendMessage = (message) => {
    if (!message.trim()) return;

    socket.send('send_message', {
      requestId: selectedRequest.id,
      message,
      sender: 'customer',
      senderId: customerInfo.id,
      senderName: customerInfo.name,
      receiverId: selectedRequest.providerId
    });

    setChatMessages(prev => [...prev, {
      id: Date.now(),
      text: message,
      sender: 'customer',
      timestamp: new Date().toISOString(),
      senderName: customerInfo.name
    }]);
  };

  // Download invoice
  const downloadInvoice = (request) => {
    const invoice = {
      invoiceNo: `INV-${request.id}`,
      date: new Date().toLocaleDateString(),
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      providerName: request.providerName,
      service: request.title,
      description: request.description,
      amount: request.budget,
      status: 'Paid',
      paymentMethod: 'JazzCash'
    };

    // Create downloadable content
    const content = `
      ================ DASTAK PK ================
                 INVOICE
      ===========================================
      Invoice No: ${invoice.invoiceNo}
      Date: ${invoice.date}
      
      CUSTOMER DETAILS:
      -----------------
      Name: ${invoice.customerName}
      Phone: ${invoice.customerPhone}
      
      PROVIDER DETAILS:
      -----------------
      Name: ${invoice.providerName}
      Service: ${invoice.service}
      
      SERVICE DETAILS:
      -----------------
      Description: ${invoice.description}
      Amount: ${invoice.amount}
      
      PAYMENT DETAILS:
      -----------------
      Status: ${invoice.status}
      Method: ${invoice.paymentMethod}
      
      ===========================================
      Thank you for using Dastak PK!
      ===========================================
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${request.id}.txt`;
    a.click();
  };

  if (!customerInfo) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <FaSpinner className="spin" style={{ fontSize: '40px', color: '#007bff' }} />
        <p style={{ marginTop: '20px', color: '#666' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Navigation Bar */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '30px',
        padding: '15px 20px',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link 
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              textDecoration: 'none'
            }}
          >
            <FaHome /> Home
          </Link>
          
          <Link 
            to="/customer-portal"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              textDecoration: 'none'
            }}
          >
            <FaShoppingCart /> Dashboard
          </Link>
          
          <Link 
            to="/customer-orders"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              textDecoration: 'none'
            }}
          >
            <FaBox /> My Orders
          </Link>
          
          <Link 
            to="/post-request"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              textDecoration: 'none'
            }}
          >
            <FaTools /> Post Request
          </Link>
        </div>
        
        {/* Connection Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            backgroundColor: socket.isConnected() ? '#d4edda' : '#f8d7da',
            color: socket.isConnected() ? '#155724' : '#721c24',
            borderRadius: '20px',
            fontSize: '12px'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: socket.isConnected() ? '#28a745' : '#dc3545'
            }} />
            {socket.isConnected() ? 'Live' : 'Offline'}
          </span>
          
          <span style={{ color: '#666', fontSize: '14px' }}>
            👤 {customerInfo.name}
          </span>
        </div>
      </div>

      {/* Page Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h1 style={{ margin: 0, fontSize: '32px', color: '#333' }}>My Orders</h1>
          <span style={{
            padding: '5px 12px',
            backgroundColor: '#e3f2fd',
            color: '#007bff',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            {requests.length} Total
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        borderBottom: '2px solid #e9ecef',
        paddingBottom: '10px'
      }}>
        <button
          onClick={() => setActiveTab('active')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'active' ? '#007bff' : 'transparent',
            color: activeTab === 'active' ? 'white' : '#6c757d',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: activeTab === 'active' ? 'bold' : 'normal'
          }}
        >
          Active Orders ({requests.filter(r => ['pending', 'accepted', 'in_progress'].includes(r.status)).length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'completed' ? '#007bff' : 'transparent',
            color: activeTab === 'completed' ? 'white' : '#6c757d',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: activeTab === 'completed' ? 'bold' : 'normal'
          }}
        >
          Completed ({requests.filter(r => r.status === 'completed').length})
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'cancelled' ? '#007bff' : 'transparent',
            color: activeTab === 'cancelled' ? 'white' : '#6c757d',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: activeTab === 'cancelled' ? 'bold' : 'normal'
          }}
        >
          Cancelled ({requests.filter(r => r.status === 'rejected').length})
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '15px',
          borderRadius: '5px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <FaExclamationTriangle />
          {error}
        </div>
      )}

      {/* Requests List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <FaSpinner className="spin" style={{ fontSize: '40px', color: '#007bff' }} />
          <p style={{ marginTop: '20px', color: '#666' }}>Loading your orders...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          padding: '60px 20px',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <FaBox style={{ fontSize: '60px', color: '#6c757d', marginBottom: '20px', opacity: 0.5 }} />
          <h2 style={{ color: '#333', marginBottom: '10px' }}>No orders found</h2>
          <p style={{ color: '#666', marginBottom: '30px' }}>
            {activeTab === 'active' ? "You don't have any active orders." :
             activeTab === 'completed' ? "You haven't completed any orders yet." :
             "You don't have any cancelled orders."}
          </p>
          <button
            onClick={() => navigate('/post-request')}
            style={{
              padding: '15px 40px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          >
            Post a Request
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {filteredRequests.map((request) => {
            const status = getStatusConfig(request.status);
            
            return (
              <div
                key={request.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '10px',
                  padding: '25px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  borderLeft: `5px solid ${status.color}`,
                  position: 'relative'
                }}
              >
                {/* Status Badge */}
                <span style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  padding: '5px 15px',
                  backgroundColor: status.bg,
                  color: status.color,
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {status.badge}
                </span>

                {/* Request Header */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '20px',
                  paddingRight: '100px'
                }}>
                  <div>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '20px' }}>
                      {request.title || request.service}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        color: status.color,
                        fontSize: '14px'
                      }}>
                        {status.icon}
                        {status.text}
                      </span>
                      <span style={{ color: '#666', fontSize: '13px' }}>
                        <FaClock style={{ marginRight: '5px' }} />
                        {formatDate(request.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#28a745' }}>
                    {formatBudget(request.budget)}
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    height: '6px',
                    backgroundColor: '#e9ecef',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${status.progress}%`,
                      height: '100%',
                      backgroundColor: status.color,
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '5px',
                    fontSize: '11px',
                    color: '#6c757d'
                  }}>
                    <span>📝 Posted</span>
                    <span>🔧 Assigned</span>
                    <span>⚙️ In Progress</span>
                    <span>✅ Completed</span>
                  </div>
                </div>

                {/* Request Details Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '15px',
                  marginBottom: '20px',
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaMapMarkerAlt style={{ color: '#dc3545' }} />
                    <div>
                      <small style={{ color: '#666' }}>Location</small>
                      <p style={{ margin: 0, fontWeight: '500', fontSize: '14px' }}>{request.location}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaCalendarAlt style={{ color: '#007bff' }} />
                    <div>
                      <small style={{ color: '#666' }}>Schedule</small>
                      <p style={{ margin: 0, fontWeight: '500', fontSize: '14px' }}>{request.schedule || 'ASAP'}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaPhone style={{ color: '#28a745' }} />
                    <div>
                      <small style={{ color: '#666' }}>Contact</small>
                      <p style={{ margin: 0, fontWeight: '500', fontSize: '14px' }}>{request.contact || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Provider Info & Actions */}
                {request.status === 'accepted' && request.providerName && (
                  <div style={{
                    padding: '15px',
                    backgroundColor: '#d4edda',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '15px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '50%',
                        backgroundColor: '#28a745',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '22px'
                      }}>
                        👨‍🔧
                      </div>
                      <div>
                        <h4 style={{ margin: 0, color: '#155724', fontSize: '16px' }}>Provider Assigned!</h4>
                        <p style={{ margin: '5px 0 0 0', color: '#155724', fontSize: '14px' }}>
                          <strong>{request.providerName}</strong> - ⭐ 4.8 (128 reviews)
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => openChat(request)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '13px'
                        }}
                      >
                        <FaComments /> Chat
                      </button>
                      <button
                        onClick={() => handlePayment(request)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '13px'
                        }}
                      >
                        <FaCreditCard /> Pay Now
                      </button>
                    </div>
                  </div>
                )}

                {/* Completed Order Actions */}
                {request.status === 'completed' && (
                  <div style={{
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '15px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '50%',
                        backgroundColor: '#6c757d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '22px'
                      }}>
                        👨‍🔧
                      </div>
                      <div>
                        <h4 style={{ margin: 0, color: '#333', fontSize: '16px' }}>Service Completed</h4>
                        <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
                          Provider: <strong>{request.providerName}</strong>
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowRatingModal(true);
                        }}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#ffc107',
                          color: '#000',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '13px'
                        }}
                      >
                        <FaStar /> Rate Provider
                      </button>
                      <button
                        onClick={() => downloadInvoice(request)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#17a2b8',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '13px'
                        }}
                      >
                        <FaDownload /> Invoice
                      </button>
                    </div>
                  </div>
                )}

                {/* Description */}
                {request.description && (
                  <div style={{ marginTop: '10px', color: '#666' }}>
                    <strong style={{ fontSize: '14px' }}>Description:</strong>
                    <p style={{ margin: '8px 0 0 0', lineHeight: '1.6', fontSize: '14px' }}>
                      {request.description}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedRequest && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>Rate Your Provider</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              How was your experience with {selectedRequest.providerName}?
            </p>
            
            {/* Star Rating */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  onClick={() => setRating(star)}
                  style={{
                    fontSize: '40px',
                    cursor: 'pointer',
                    color: star <= rating ? '#ffc107' : '#e9ecef',
                    transition: 'color 0.2s'
                  }}
                />
              ))}
            </div>
            
            {/* Review Text */}
            <textarea
              placeholder="Write your review (optional)"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ced4da',
                borderRadius: '5px',
                marginBottom: '20px',
                minHeight: '100px',
                fontSize: '14px'
              }}
            />
            
            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSubmitRating}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Submit Rating
              </button>
              <button
                onClick={() => {
                  setShowRatingModal(false);
                  setRating(0);
                  setReview('');
                  setSelectedRequest(null);
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChat && selectedRequest && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '350px',
          height: '500px',
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000
        }}>
          {/* Chat Header */}
          <div style={{
            padding: '15px',
            backgroundColor: '#007bff',
            color: 'white',
            borderRadius: '10px 10px 0 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaComments />
              <span>Chat with {selectedRequest.providerName}</span>
            </div>
            <button
              onClick={() => setShowChat(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '18px'
              }}
            >
              ×
            </button>
          </div>
          
          {/* Chat Messages */}
          <div style={{
            flex: 1,
            padding: '15px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'customer' ? 'flex-end' : 'flex-start',
                  marginBottom: '10px'
                }}
              >
                <div style={{
                  maxWidth: '70%',
                  padding: '10px',
                  borderRadius: '10px',
                  backgroundColor: msg.sender === 'customer' ? '#007bff' : '#e9ecef',
                  color: msg.sender === 'customer' ? 'white' : '#333'
                }}>
                  <p style={{ margin: 0, fontSize: '14px' }}>{msg.text}</p>
                  <span style={{
                    fontSize: '10px',
                    opacity: 0.7,
                    display: 'block',
                    marginTop: '5px'
                  }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Chat Input */}
          <div style={{
            padding: '15px',
            borderTop: '1px solid #dee2e6',
            display: 'flex',
            gap: '10px'
          }}>
            <input
              type="text"
              placeholder="Type your message..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  sendMessage(e.target.value);
                  e.target.value = '';
                }
              }}
              style={{
                flex: 1,
                padding: '10px',
                border: '1px solid #ced4da',
                borderRadius: '5px',
                fontSize: '14px'
              }}
            />
            <button
              onClick={(e) => {
                const input = e.target.previousSibling;
                sendMessage(input.value);
                input.value = '';
              }}
              style={{
                padding: '10px 15px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerOrderTracking;