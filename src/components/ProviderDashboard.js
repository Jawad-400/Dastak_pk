import React from 'react';
import '../styles.css';
import { FaBell, FaWallet, FaStar, FaMapMarkerAlt, FaCalendarAlt, FaUser, FaCheckCircle, FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ProviderDashboard = () => {
  const requests = [
    { id: 1, service: 'Plumbing', customer: 'Ahmed Raza', location: 'Gulshan', budget: '₹2,500', time: '2 hours ago' },
    { id: 2, service: 'AC Repair', customer: 'Sara Khan', location: 'DHA', budget: '₹3,000', time: '5 hours ago' },
  ];

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Header with both buttons */}
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
          <p style={{ fontSize: '16px', color: '#666' }}>Welcome back, <strong>John Doe</strong> (Plumber)</p>
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
              height: '50px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
          >
            <FaSearch /> Find Jobs
          </Link>
          
          <Link 
            to="/my-Orders" 
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              height: '50px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            📋 My Orders
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
            <h3 style={{ margin: 0, color: '#333' }}>68,500 PKR</h3>
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
            <h3 style={{ margin: 0, color: '#333' }}>24</h3>
            <p style={{ margin: '5px 0 0 0', color: '#666' }}>Completed Jobs</p>
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
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <FaBell style={{ color: '#dc3545', fontSize: '24px' }} />
          <div>
            <h3 style={{ margin: 0, color: '#333' }}>3</h3>
            <p style={{ margin: '5px 0 0 0', color: '#666' }}>Active Requests</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        {/* Left Column - New Service Requests */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          padding: '25px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginBottom: '20px', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaBell /> New Service Requests
          </h2>
          <div>
            {requests.map(req => (
              <div key={req.id} style={{
                padding: '15px',
                border: '1px solid #eee',
                borderRadius: '8px',
                marginBottom: '15px',
                backgroundColor: '#f9f9f9'
              }}>
                <h3 style={{ marginBottom: '10px', color: '#444' }}>{req.service}</h3>
                <p style={{ marginBottom: '5px' }}>
                  <strong>Customer:</strong> {req.customer}
                </p>
                <p style={{ marginBottom: '5px', color: '#666', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaMapMarkerAlt /> {req.location}
                </p>
                <p style={{ color: '#999', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaCalendarAlt /> {req.time}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>{req.budget}</span>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button style={{
                      padding: '8px 16px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}>
                      View
                    </button>
                    <button style={{
                      padding: '8px 16px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}>
                      Accept
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Profile */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          padding: '25px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginBottom: '20px', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaUser /> Your Profile
          </h2>
          <div style={{
            padding: '20px',
            border: '1px solid #eee',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9'
          }}>
            <div style={{ marginBottom: '15px' }}>
              <p><strong>Service:</strong> Plumber</p>
              <p><strong>Experience:</strong> 5 years</p>
              <p><strong>Rating:</strong> 4.8/5 (42 reviews)</p>
            </div>
            <Link to="/provider-portal" style={{
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: 'transparent',
              color: '#007bff',
              border: '2px solid #007bff',
              borderRadius: '5px',
              textDecoration: 'none',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              Edit Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
