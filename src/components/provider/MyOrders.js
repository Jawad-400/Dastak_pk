import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaClock, FaCheckCircle, FaTimesCircle, 
  FaRupeeSign, FaSpinner, FaExclamationTriangle 
} from 'react-icons/fa';
import { socket } from '../../Services/socket';  // Go up TWO levels!

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    completed: 0,
    rejected: 0
  });

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
    
    // Listen for real-time updates
    socket.on('request_accepted_confirmation', handleOrderAccepted);
    socket.on('request_completed', handleOrderCompleted);
    socket.on('request_taken', handleOrderTaken);

    return () => {
      socket.off('request_accepted_confirmation', handleOrderAccepted);
      socket.off('request_completed', handleOrderCompleted);
      socket.off('request_taken', handleOrderTaken);
    };
  }, []);

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (!token || !user.id) {
        setError('Please login first');
        setTimeout(() => navigate('/provider-portal'), 2000);
        return;
      }

      // Fetch provider's accepted jobs from MongoDB via your API
      const response = await fetch(`http://localhost:4000/api/auth/users/${user.id}/requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        // Filter only accepted jobs
        const acceptedOrders = data.data.requests.filter(req => 
          req.status === 'accepted' || req.status === 'completed'
        );
        
        setOrders(acceptedOrders);
        calculateStats(acceptedOrders);
      } else {
        setError(data.error || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (ordersList) => {
    const stats = {
      total: ordersList.length,
      pending: ordersList.filter(o => o.status === 'pending').length,
      accepted: ordersList.filter(o => o.status === 'accepted').length,
      completed: ordersList.filter(o => o.status === 'completed').length,
      rejected: ordersList.filter(o => o.status === 'rejected').length
    };
    setStats(stats);
  };

  // Handle order acceptance confirmation
  const handleOrderAccepted = (data) => {
    console.log('✅ Order accepted:', data);
    // Refresh orders list
    fetchOrders();
  };

  // Handle order completion
  const handleOrderCompleted = (data) => {
    console.log('✅ Order completed:', data);
    // Update order status in real-time
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === data.requestId 
          ? { ...order, status: 'completed' }
          : order
      )
    );
    calculateStats(orders);
  };

  // Handle order taken by another provider (remove from list)
  const handleOrderTaken = (data) => {
    console.log('⚠️ Order taken by another provider:', data);
    setOrders(prevOrders => 
      prevOrders.filter(order => order.id !== data.requestId)
    );
    calculateStats(orders);
  };

  // Mark order as completed
  const handleComplete = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:4000/api/requests/${orderId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, status: 'completed' }
              : order
          )
        );
        calculateStats(orders);
        
        // Broadcast via WebSocket
        socket.send('request_completed', {
          request_id: orderId
        });
      }
    } catch (err) {
      console.error('Error completing order:', err);
      alert('Failed to mark order as completed');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format budget
  const formatBudget = (budget) => {
    if (!budget) return 'N/A';
    const amount = budget.toString().replace(/[^0-9]/g, '');
    return `Rs. ${parseInt(amount || 0).toLocaleString()}`;
  };

  // Get status color and icon
  const getStatusConfig = (status) => {
    switch(status) {
      case 'accepted':
        return {
          color: '#155724',
          bg: '#d4edda',
          icon: <FaCheckCircle />,
          text: 'Accepted'
        };
      case 'completed':
        return {
          color: '#004085',
          bg: '#cce5ff',
          icon: <FaCheckCircle />,
          text: 'Completed'
        };
      case 'rejected':
        return {
          color: '#721c24',
          bg: '#f8d7da',
          icon: <FaTimesCircle />,
          text: 'Rejected'
        };
      case 'pending':
      default:
        return {
          color: '#856404',
          bg: '#fff3cd',
          icon: <FaClock />,
          text: 'Pending'
        };
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <FaSpinner className="spin" style={{ fontSize: '40px', color: '#007bff' }} />
        <p style={{ marginTop: '20px', color: '#666' }}>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header with Back Button */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '30px',
        paddingBottom: '15px',
        borderBottom: '1px solid #ddd'
      }}>
        <button
          onClick={() => navigate('/provider-dashboard')}
          style={{
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
            marginRight: '20px'
          }}
        >
          <FaArrowLeft /> Back to Dashboard
        </button>
        
        <h1 style={{ margin: 0, fontSize: '28px', color: '#333' }}>My Orders</h1>
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

      {/* Stats Summary */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(5, 1fr)', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '10px',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#007bff', fontSize: '24px', margin: '0 0 10px 0' }}>{stats.total}</h3>
          <p style={{ margin: 0, color: '#666' }}>Total Orders</p>
        </div>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '10px',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#ffc107', fontSize: '24px', margin: '0 0 10px 0' }}>{stats.pending}</h3>
          <p style={{ margin: 0, color: '#666' }}>Pending</p>
        </div>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '10px',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#28a745', fontSize: '24px', margin: '0 0 10px 0' }}>{stats.accepted}</h3>
          <p style={{ margin: 0, color: '#666' }}>Accepted</p>
        </div>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '10px',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#17a2b8', fontSize: '24px', margin: '0 0 10px 0' }}>{stats.completed}</h3>
          <p style={{ margin: 0, color: '#666' }}>Completed</p>
        </div>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '10px',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#dc3545', fontSize: '24px', margin: '0 0 10px 0' }}>{stats.rejected}</h3>
          <p style={{ margin: 0, color: '#666' }}>Rejected</p>
        </div>
      </div>

      {/* Orders Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>Your Orders</h2>
        
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
            <FaClock style={{ fontSize: '48px', marginBottom: '15px', opacity: 0.5 }} />
            <h3>No orders yet</h3>
            <p>When you accept jobs, they will appear here</p>
            <button 
              onClick={() => navigate('/provider-dashboard')}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Find Jobs
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6', color: '#666' }}>Job</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6', color: '#666' }}>Customer</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6', color: '#666' }}>Amount</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6', color: '#666' }}>Status</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6', color: '#666' }}>Date</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6', color: '#666' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const statusConfig = getStatusConfig(order.status);
                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '15px', fontWeight: '500' }}>{order.title || order.service}</td>
                      <td style={{ padding: '15px' }}>{order.customerName || order.customer}</td>
                      <td style={{ padding: '15px', fontWeight: 'bold', color: '#28a745' }}>
                        {formatBudget(order.budget)}
                      </td>
                      <td style={{ padding: '15px' }}>
                        <span style={{
                          padding: '5px 10px',
                          borderRadius: '20px',
                          fontSize: '14px',
                          backgroundColor: statusConfig.bg,
                          color: statusConfig.color,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          {statusConfig.icon}
                          {statusConfig.text}
                        </span>
                      </td>
                      <td style={{ padding: '15px', color: '#666' }}>
                        {formatDate(order.acceptedAt || order.createdAt)}
                      </td>
                      <td style={{ padding: '15px' }}>
                        {order.status === 'accepted' && (
                          <button
                            onClick={() => handleComplete(order.id)}
                            style={{
                              padding: '8px 15px',
                              backgroundColor: '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: '5px',
                              cursor: 'pointer',
                              marginRight: '10px'
                            }}
                          >
                            Mark Complete
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/order-details/${order.id}`)}
                          style={{
                            padding: '8px 15px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;