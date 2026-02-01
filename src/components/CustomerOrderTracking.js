import React, { useState } from 'react';
import { 
  FaClock, FaCheckCircle, FaUser, FaRupeeSign, 
  FaCalendarAlt, FaMapMarkerAlt, FaPhone, FaStar,
  FaArrowLeft
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const CustomerOrderTracking = () => {
  const navigate = useNavigate();
  
  // Sample orders data
  const [activeOrders, setActiveOrders] = useState([
    {
      id: 1,
      service: 'Bathroom Plumbing',
      description: 'Leaking tap and drainage issue',
      date: '2024-01-20',
      budget: '₹2,500',
      location: 'Gulshan, Karachi',
      status: 'Orders Open',
      Orders: [
        { id: 1, provider: 'John Doe', amount: '₹2,800', time: '2 days', rating: 4.8, contact: '0300-1234567' },
        { id: 2, provider: 'Ali Tech', amount: '₹2,500', time: '1 day', rating: 4.5, contact: '0300-7654321' },
      ]
    },
    {
      id: 2,
      service: 'AC Gas Refill',
      description: 'AC not cooling properly',
      date: '2024-01-19',
      budget: '₹3,000',
      location: 'DHA Phase 5',
      status: 'Orders Open',
      Orders: [
        { id: 3, provider: 'Cool Masters', amount: '₹3,200', time: 'Today', rating: 4.9, contact: '0300-9876543' },
      ]
    }
  ]);

  const [completedOrders, setCompletedOrders] = useState([
    {
      id: 3,
      service: 'Electrical Wiring',
      provider: 'Tech Masters',
      date: '2024-01-15',
      amount: '₹3,500',
      rating: 5,
      status: 'Completed'
    },
    {
      id: 4,
      service: 'Painting Work',
      provider: 'Color Pro',
      date: '2024-01-10',
      amount: '₹12,000',
      rating: 4,
      status: 'Completed'
    }
  ]);

  const acceptOrder = (orderId) => {
    alert(`Order accepted! Provider will contact you soon.`);
    // In real app: Update order status, notify provider, etc.
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button 
          onClick={() => navigate(-1)}
          style={styles.backButton}
        >
          <FaArrowLeft /> Back
        </button>
        <h1 style={styles.title}>My Orders & Orders</h1>
        <p style={styles.subtitle}>Track your service requests and provider orders</p>
      </div>

            {/* Call to Action */}
      <div style={styles.ctaSection}>
        <button 
          style={styles.primaryButtonLarge}
          onClick={() => navigate('/post-request')}
        >
          Post New Service Request
        </button>
      </div>

      {/* Stats */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{activeOrders.length}</div>
          <div style={styles.statLabel}>Active Orders</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>
            {activeOrders.reduce((total, order) => total + order.Orders.length, 0)}
          </div>
          <div style={styles.statLabel}>Total Orders</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{completedOrders.length}</div>
          <div style={styles.statLabel}>Completed</div>
        </div>
      </div>

      {/* Active Orders */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <FaClock style={styles.sectionIcon} /> Active Orders
        </h2>
        
        {activeOrders.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No active orders. Post a service request to get started!</p>
            <button 
              style={styles.primaryButton}
              onClick={() => navigate('/post-request')}
            >
              Post New Request
            </button>
          </div>
        ) : (
          <div style={styles.ordersList}>
            {activeOrders.map(order => (
              <div key={order.id} style={styles.orderCard}>
                <div style={styles.orderHeader}>
                  <h3 style={styles.orderTitle}>{order.service}</h3>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: order.status === 'Orders Open' ? '#d4edda' : '#fff3cd',
                    color: order.status === 'Orders Open' ? '#155724' : '#856404'
                  }}>
                    {order.status}
                  </span>
                </div>
                
                <div style={styles.orderDetails}>
                  <p><strong>Description:</strong> {order.description}</p>
                  <div style={styles.detailRow}>
                    <span style={styles.detailItem}>
                      <FaCalendarAlt /> {order.date}
                    </span>
                    <span style={styles.detailItem}>
                      <FaRupeeSign /> {order.budget}
                    </span>
                    <span style={styles.detailItem}>
                      <FaMapMarkerAlt /> {order.location}
                    </span>
                  </div>
                </div>

                {/* Orders Section */}
                <div style={styles.OrdersSection}>
                  <h4 style={styles.OrdersTitle}>
                    Orders Received ({order.Orders.length})
                  </h4>
                  
                  {order.Orders.length === 0 ? (
                    <p style={styles.noOrders}>No orders yet. Providers will place orders soon.</p>
                  ) : (
                    <div style={styles.OrdersList}>
                      {order.Orders.map(order => (
                        <div key={order.id} style={styles.orderCard}>
                          <div style={styles.orderHeader}>
                            <div style={styles.providerInfo}>
                              <div style={styles.avatar}>
                                <FaUser />
                              </div>
                              <div>
                                <h5 style={styles.providerName}>{order.provider}</h5>
                                <div style={styles.rating}>
                                  <FaStar style={{ color: '#ffc107' }} /> {order.rating}
                                </div>
                              </div>
                            </div>
                            <div style={styles.orderAmount}>
                              <FaRupeeSign /> {order.amount}
                            </div>
                          </div>
                          
                          <div style={styles.orderDetails}>
                            <span style={styles.orderDetail}>
                              <FaCalendarAlt /> Time: {order.time}
                            </span>
                            <span style={styles.orderDetail}>
                              <FaPhone /> {order.contact}
                            </span>
                          </div>
                          
                          <div style={styles.orderActions}>
                            <button 
                              style={styles.acceptBtn}
                              onClick={() => acceptOrder(order.id)}
                            >
                              Accept Order
                            </button>
                            <button style={styles.messageBtn}>
                              Message
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Orders */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <FaCheckCircle style={styles.sectionIcon} /> Completed Orders
        </h2>
        
        {completedOrders.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No completed orders yet.</p>
          </div>
        ) : (
          <div style={styles.completedList}>
            {completedOrders.map(order => (
              <div key={order.id} style={styles.completedCard}>
                <div style={styles.completedHeader}>
                  <h4>{order.service}</h4>
                  <span style={styles.completedStatus}>Completed</span>
                </div>
                <div style={styles.completedDetails}>
                  <p><strong>Provider:</strong> {order.provider}</p>
                  <p><strong>Date:</strong> {order.date}</p>
                  <p><strong>Amount:</strong> {order.amount}</p>
                  <div style={styles.ratingStars}>
                    Rating: {'★'.repeat(order.rating)}{'☆'.repeat(5 - order.rating)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    marginBottom: '30px',
    textAlign: 'center'
  },
  backButton: {
    position: 'absolute',
    left: '20px',
    top: '20px',
    padding: '8px 15px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  title: {
    fontSize: '32px',
    color: '#333',
    marginBottom: '10px'
  },
  subtitle: {
    fontSize: '18px',
    color: '#666',
    marginBottom: '20px'
  },
  statsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '40px',
    flexWrap: 'wrap'
  },
  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    textAlign: 'center',
    minWidth: '150px'
  },
  statNumber: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: '5px'
  },
  statLabel: {
    color: '#666',
    fontSize: '14px'
  },
  section: {
    marginBottom: '40px'
  },
  sectionTitle: {
    fontSize: '24px',
    color: '#333',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center'
  },
  sectionIcon: {
    marginRight: '10px',
    color: '#007bff'
  },
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '25px',
    boxShadow: '0 2px 15px rgba(0,0,0,0.1)',
    border: '1px solid #e9ecef'
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  orderTitle: {
    margin: 0,
    color: '#333',
    fontSize: '20px'
  },
  statusBadge: {
    padding: '5px 15px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  orderDetails: {
    marginBottom: '20px'
  },
  detailRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '15px',
    marginTop: '10px'
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    color: '#666',
    fontSize: '14px'
  },
  OrdersSection: {
    borderTop: '1px solid #eee',
    paddingTop: '20px'
  },
  OrdersTitle: {
    marginBottom: '15px',
    color: '#555'
  },
  noOrders: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '20px'
  },
  OrdersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  orderCard: {
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    padding: '15px',
    backgroundColor: '#f8f9fa'
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  providerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  avatar: {
    width: '40px',
    height: '40px',
    backgroundColor: '#007bff',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  providerName: {
    margin: 0,
    fontSize: '16px'
  },
  rating: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '14px',
    color: '#666'
  },
  orderAmount: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#28a745',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  orderDetails: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '15px',
    marginBottom: '15px',
    fontSize: '14px',
    color: '#666'
  },
  orderDetail: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  orderActions: {
    display: 'flex',
    gap: '10px'
  },
  acceptBtn: {
    padding: '8px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  messageBtn: {
    padding: '8px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  completedList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px'
  },
  completedCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    border: '1px solid #dee2e6'
  },
  completedHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  completedStatus: {
    color: '#28a745',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  completedDetails: {
    color: '#666'
  },
  ratingStars: {
    color: '#ffc107',
    marginTop: '10px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px'
  },
  ctaSection: {
    textAlign: 'center',
    marginTop: '40px',
    padding: '30px',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px'
  },
  primaryButton: {
    padding: '12px 25px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '15px'
  },
  primaryButtonLarge: {
    padding: '15px 40px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: 'bold'
  }
};

export default CustomerOrderTracking;