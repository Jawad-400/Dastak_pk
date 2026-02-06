import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaClock, FaCheckCircle, FaTimesCircle, FaRupeeSign } from 'react-icons/fa';

const MyOrders = () => {
  const navigate = useNavigate();
  
  const orders = [
    { id: 1, job: 'Kitchen Plumbing', customer: 'Ahmed Raza', amount: '₹2,500', status: 'Pending', date: '2024-01-15' },
    { id: 2, job: 'AC Installation', customer: 'Sara Khan', amount: '₹5,000', status: 'Accepted', date: '2024-01-14' },
    { id: 3, job: 'Electrical Repair', customer: 'Ali Hassan', amount: '₹1,800', status: 'Rejected', date: '2024-01-13' },
    { id: 4, job: 'Bathroom Tiles', customer: 'Raza Ahmed', amount: '₹3,200', status: 'Pending', date: '2024-01-12' },
  ];

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

      {/* Stats Summary */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
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
          <h3 style={{ color: '#007bff', fontSize: '24px', margin: '0 0 10px 0' }}>5</h3>
          <p style={{ margin: 0, color: '#666' }}>Total Orders</p>
        </div>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '10px',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#ffc107', fontSize: '24px', margin: '0 0 10px 0' }}>2</h3>
          <p style={{ margin: 0, color: '#666' }}>Pending</p>
        </div>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '10px',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#28a745', fontSize: '24px', margin: '0 0 10px 0' }}>1</h3>
          <p style={{ margin: 0, color: '#666' }}>Accepted</p>
        </div>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '10px',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#dc3545', fontSize: '24px', margin: '0 0 10px 0' }}>1</h3>
          <p style={{ margin: 0, color: '#666' }}>Rejected</p>
        </div>
      </div>

      {/* Orders Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>Your Orders</h2>
        
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
              {orders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '15px' }}>{order.job}</td>
                  <td style={{ padding: '15px' }}>{order.customer}</td>
                  <td style={{ padding: '15px', fontWeight: 'bold', color: '#28a745' }}>{order.amount}</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{
                      padding: '5px 10px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      backgroundColor: 
                        order.status === 'Accepted' ? '#d4edda' :
                        order.status === 'Rejected' ? '#f8d7da' : '#fff3cd',
                      color: 
                        order.status === 'Accepted' ? '#155724' :
                        order.status === 'Rejected' ? '#721c24' : '#856404',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      {order.status === 'Pending' && <FaClock />}
                      {order.status === 'Accepted' && <FaCheckCircle />}
                      {order.status === 'Rejected' && <FaTimesCircle />}
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '15px', color: '#666' }}>{order.date}</td>
                  <td style={{ padding: '15px' }}>
                    <button style={{
                      padding: '8px 15px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}>
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyOrders;

