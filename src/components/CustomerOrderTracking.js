import React, { useState, useEffect } from 'react';
import '../styles.css';
import { 
  FaClock, FaCheckCircle, FaUser, FaRupeeSign, 
  FaCalendarAlt, FaMapMarkerAlt, FaPhone, FaStar,
  FaArrowLeft, FaComments, FaPaperPlane, FaTimes,
  FaPlus, FaTools, FaInfoCircle, FaEdit, FaTrash
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { socket } from '../Services/socket';

const CustomerOrderTracking = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, post-request, my-orders
  const [chatOpen, setChatOpen] = useState(false);
  const [currentChat, setCurrentChat] = useState({ roomId: null, providerName: '' });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  
  // New Request Form State
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [formData, setFormData] = useState({
    serviceType: '',
    subService: '',
    description: '',
    address: '',
    city: '',
    date: '',
    time: '',
    budget: '',
    urgency: 'normal',
    contactPreference: 'phone'
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Services data for dropdown
  const services = {
    plumbing: ['Pipe Repair', 'Leak Fixing', 'Drain Cleaning', 'Toilet Installation', 'Water Heater'],
    electrical: ['Wiring', 'Switch/Fixing', 'Light Installation', 'Fan Repair', 'Circuit Breaker'],
    cleaning: ['Home Cleaning', 'Office Cleaning', 'Carpet Cleaning', 'Window Cleaning', 'Deep Cleaning'],
    ac_repair: ['AC Installation', 'AC Gas Filling', 'AC Repair', 'AC Maintenance', 'AC Cleaning'],
    painting: ['Wall Painting', 'Furniture Painting', 'Exterior Painting', 'Waterproofing', 'Texture Painting'],
    carpentry: ['Furniture Making', 'Door Repair', 'Window Repair', 'Cupboard Making', 'Wood Polishing'],
    mechanic: ['Car Repair', 'Bike Repair', 'Engine Service', 'Oil Change', 'Tire Replacement'],
    gardening: ['Lawn Mowing', 'Tree Trimming', 'Garden Design', 'Planting', 'Irrigation'],
    construction: ['Renovation', 'Room Addition', 'Kitchen Remodel', 'Bathroom Remodel', 'Tiling']
  };

  const cities = [
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
    'Multan', 'Peshawar', 'Quetta', 'Gujranwala', 'Sialkot',
    'Bahawalpur', 'Sargodha', 'Sukkur', 'Larkana', 'Hyderabad',
    'Abbottabad', 'Mardan', 'Mingora', 'Mirpur', 'Gujrat'
  ];

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
        { 
          id: 1, 
          provider: 'John Doe', 
          providerId: 'provider_001',
          amount: '₹2,800', 
          time: '2 days', 
          rating: 4.8, 
          contact: '0300-1234567',
          chatRoomId: 'order_1_provider_001'
        },
        { 
          id: 2, 
          provider: 'Ali Tech', 
          providerId: 'provider_002',
          amount: '₹2,500', 
          time: '1 day', 
          rating: 4.5, 
          contact: '0300-7654321',
          chatRoomId: 'order_1_provider_002'
        },
      ]
    },
  ]);

  const [completedOrders, setCompletedOrders] = useState([
    {
      id: 3,
      service: 'Electrical Wiring',
      provider: 'Tech Masters',
      date: '2024-01-15',
      amount: '₹3,500',
      rating: 5,
      status: 'Completed',
      chatRoomId: 'completed_3'
    },
  ]);

  // Socket connection
  useEffect(() => {
    socket.connect();
    
    const handleConnect = () => {
      console.log('Connected to chat server');
    };
    
    const handleMessage = (data) => {
      if (currentChat.roomId && data.room === currentChat.roomId) {
        setMessages(prev => [...prev, {
          text: data.text,
          sender: data.sender,
          senderName: data.senderName || data.sender,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    };
    
    socket.on('connect', handleConnect);
    socket.on('message', handleMessage);
    
    return () => {
      socket.off('connect', handleConnect);
      socket.off('message', handleMessage);
    };
  }, [currentChat.roomId]);

  // New Request Form Handlers
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    if (name === 'serviceType') {
      setFormData(prev => ({
        ...prev,
        subService: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.serviceType) errors.serviceType = 'Please select a service type';
    if (!formData.subService) errors.subService = 'Please select a sub-service';
    if (!formData.description.trim()) errors.description = 'Please describe your problem';
    if (formData.description.trim().length < 20) errors.description = 'Description should be at least 20 characters';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.city) errors.city = 'Please select your city';
    if (!formData.date) errors.date = 'Please select a date';
    if (!formData.time) errors.time = 'Please select a time';
    if (!formData.budget) errors.budget = 'Please enter your budget';
    if (formData.budget && parseInt(formData.budget) < 500) errors.budget = 'Minimum budget is 500 PKR';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitRequest = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newOrder = {
        id: Date.now(),
        service: `${formData.serviceType} - ${formData.subService}`,
        description: formData.description,
        date: formData.date,
        budget: `₹${formData.budget}`,
        location: `${formData.address}, ${formData.city}`,
        status: 'Orders Open',
        Orders: [],
        urgency: formData.urgency
      };
      
      setActiveOrders(prev => [newOrder, ...prev]);
      
      // Reset form
      setFormData({
        serviceType: '',
        subService: '',
        description: '',
        address: '',
        city: '',
        date: '',
        time: '',
        budget: '',
        urgency: 'normal',
        contactPreference: 'phone'
      });
      
      setShowRequestForm(false);
      setActiveTab('my-orders');
      
      alert('Service request posted successfully! Providers will start bidding soon.');
      
      // Notify providers via socket
      if (socket.connected) {
        socket.emit('new-request', {
          service: newOrder.service,
          location: newOrder.location,
          budget: newOrder.budget,
          urgency: newOrder.urgency
        });
      }
    } catch (error) {
      console.error('Error posting request:', error);
      alert('Failed to post request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Original functions (keep as is)
  const acceptOrder = (orderId, providerName) => {
    alert(`Order accepted! ${providerName} will contact you soon.`);
    
    setActiveOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          status: 'Order Accepted',
          Orders: order.Orders.map(bid => ({
            ...bid,
            status: bid.id === orderId ? 'accepted' : 'rejected'
          }))
        };
      }
      return order;
    }));
  };

  const openChat = (roomId, providerName, orderId) => {
    setCurrentChat({ roomId, providerName, orderId });
    setChatOpen(true);
    setMessages([]);
    
    if (socket.connected) {
      socket.emit('join-room', roomId);
      
      setTimeout(() => {
        setMessages([
          { text: `Hello! I'm ${providerName}. I'm interested in your service request.`, sender: 'provider', senderName: providerName, timestamp: '10:30 AM' },
          { text: 'When would be a good time for me to come?', sender: 'provider', senderName: providerName, timestamp: '10:31 AM' }
        ]);
      }, 500);
    }
  };

  const closeChat = () => {
    if (currentChat.roomId) {
      socket.emit('leave-room', currentChat.roomId);
    }
    setChatOpen(false);
    setCurrentChat({ roomId: null, providerName: '' });
    setMessages([]);
  };

  const sendMessage = () => {
    if (input.trim() && currentChat.roomId && socket.connected) {
      const messageData = {
        room: currentChat.roomId,
        text: input,
        sender: 'customer',
        senderName: 'You',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, {
        ...messageData,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      
      socket.emit('send-message', messageData);
      setInput('');
    }
  };

  const completeOrder = (orderId) => {
    const orderToComplete = activeOrders.find(order => order.id === orderId);
    if (orderToComplete) {
      const acceptedBid = orderToComplete.Orders.find(bid => bid.status === 'accepted');
      
      setCompletedOrders(prev => [{
        id: orderId,
        service: orderToComplete.service,
        provider: acceptedBid?.provider || 'Unknown Provider',
        date: new Date().toISOString().split('T')[0],
        amount: acceptedBid?.amount || orderToComplete.budget,
        rating: 0,
        status: 'Completed',
        chatRoomId: `completed_${orderId}`
      }, ...prev]);
      
      setActiveOrders(prev => prev.filter(order => order.id !== orderId));
    }
  };

  // Stats calculations
  const totalBids = activeOrders.reduce((total, order) => total + order.Orders.length, 0);
  const acceptedOrders = activeOrders.filter(o => o.status === 'Order Accepted').length;

  return (
    <div style={styles.container}>
      {/* Header with Tabs */}
      <div style={styles.header}>
        <h1 style={styles.title}>Customer Portal</h1>
        <p style={styles.subtitle}>Post service requests and manage your orders</p>
        
        <div style={styles.tabs}>
          <button 
            style={{ ...styles.tab, ...(activeTab === 'dashboard' ? styles.activeTab : {}) }}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            style={{ ...styles.tab, ...(activeTab === 'post-request' ? styles.activeTab : {}) }}
            onClick={() => setActiveTab('post-request')}
          >
            <FaPlus /> Post New Request
          </button>
          <button 
            style={{ ...styles.tab, ...(activeTab === 'my-orders' ? styles.activeTab : {}) }}
            onClick={() => setActiveTab('my-orders')}
          >
            My Orders ({activeOrders.length})
          </button>
        </div>
      </div>

      {/* Dashboard View */}
      {activeTab === 'dashboard' && (
        <>
          {/* Stats */}
          <div style={styles.statsContainer}>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{activeOrders.length}</div>
              <div style={styles.statLabel}>Active Orders</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{totalBids}</div>
              <div style={styles.statLabel}>Total Orders</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{completedOrders.length}</div>
              <div style={styles.statLabel}>Completed</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{acceptedOrders}</div>
              <div style={styles.statLabel}>Accepted</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={styles.quickActions}>
            <h3 style={styles.sectionTitle}>Quick Actions</h3>
            <div style={styles.actionButtons}>
              <button 
                style={styles.primaryButtonLarge}
                onClick={() => setActiveTab('post-request')}
              >
                <FaPlus /> Post New Service Request
              </button>
              <button 
                style={styles.secondaryButton}
                onClick={() => setActiveTab('my-orders')}
              >
                View My Orders
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={styles.recentActivity}>
            <h3 style={styles.sectionTitle}>Recent Activity</h3>
            {activeOrders.slice(0, 3).map(order => (
              <div key={order.id} style={styles.activityCard}>
                <div style={styles.activityHeader}>
                  <h4>{order.service}</h4>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: order.status === 'Orders Open' ? '#d4edda' : '#cce5ff',
                    color: order.status === 'Orders Open' ? '#155724' : '#004085'
                  }}>
                    {order.status}
                  </span>
                </div>
                <p style={styles.activityDesc}>{order.description}</p>
                <div style={styles.activityDetails}>
                  <span><FaCalendarAlt /> {order.date}</span>
                  <span><FaRupeeSign /> {order.budget}</span>
                  <span><FaMapMarkerAlt /> {order.location}</span>
                </div>
                <div style={styles.activityActions}>
                  <button 
                    style={styles.smallButton}
                    onClick={() => {
                      setActiveTab('my-orders');
                      // Scroll to this order
                    }}
                  >
                    View Details
                  </button>
                  {order.Orders.length > 0 && (
                    <button 
                      style={{...styles.smallButton, backgroundColor: '#007bff'}}
                      onClick={() => openChat(order.Orders[0].chatRoomId, order.Orders[0].provider, order.id)}
                    >
                      <FaComments /> Chat ({order.Orders.length})
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Post Request View */}
      {activeTab === 'post-request' && (
        <div style={styles.requestFormContainer}>
          <div style={styles.formHeader}>
            <h2><FaTools /> Post New Service Request</h2>
            <p>Fill in the details below to post your service request</p>
          </div>
          
          <form onSubmit={submitRequest} style={styles.form}>
            {/* Service Selection */}
            <div style={styles.formSection}>
              <h3 style={styles.formSectionTitle}>1. Service Details</h3>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Service Type *</label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleFormChange}
                  style={{...styles.input, ...(formErrors.serviceType ? styles.inputError : {})}}
                >
                  <option value="">Select Service Type</option>
                  {Object.keys(services).map(service => (
                    <option key={service} value={service}>
                      {service.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
                {formErrors.serviceType && (
                  <span style={styles.errorText}>{formErrors.serviceType}</span>
                )}
              </div>
              
              {formData.serviceType && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Sub-Service *</label>
                  <select
                    name="subService"
                    value={formData.subService}
                    onChange={handleFormChange}
                    style={{...styles.input, ...(formErrors.subService ? styles.inputError : {})}}
                  >
                    <option value="">Select Sub-Service</option>
                    {services[formData.serviceType]?.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                  {formErrors.subService && (
                    <span style={styles.errorText}>{formErrors.subService}</span>
                  )}
                </div>
              )}
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Describe your problem in detail..."
                  rows={4}
                  style={{...styles.textarea, ...(formErrors.description ? styles.inputError : {})}}
                />
                {formErrors.description && (
                  <span style={styles.errorText}>{formErrors.description}</span>
                )}
                <small style={styles.helpText}>Minimum 20 characters. Be as detailed as possible.</small>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Urgency Level</label>
                <div style={styles.radioGroup}>
                  {['low', 'normal', 'high', 'emergency'].map(level => (
                    <label key={level} style={styles.radioLabel}>
                      <input
                        type="radio"
                        name="urgency"
                        value={level}
                        checked={formData.urgency === level}
                        onChange={handleFormChange}
                        style={styles.radio}
                      />
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Location Details */}
            <div style={styles.formSection}>
              <h3 style={styles.formSectionTitle}>2. Location Details</h3>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  placeholder="Enter complete address"
                  style={{...styles.input, ...(formErrors.address ? styles.inputError : {})}}
                />
                {formErrors.address && (
                  <span style={styles.errorText}>{formErrors.address}</span>
                )}
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>City *</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleFormChange}
                  style={{...styles.input, ...(formErrors.city ? styles.inputError : {})}}
                >
                  <option value="">Select City</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {formErrors.city && (
                  <span style={styles.errorText}>{formErrors.city}</span>
                )}
              </div>
            </div>
            
            {/* Schedule & Budget */}
            <div style={styles.formSection}>
              <h3 style={styles.formSectionTitle}>3. Schedule & Budget</h3>
              
              <div style={styles.formRow}>
                <div style={styles.formGroupHalf}>
                  <label style={styles.label}>Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleFormChange}
                    min={new Date().toISOString().split('T')[0]}
                    style={{...styles.input, ...(formErrors.date ? styles.inputError : {})}}
                  />
                  {formErrors.date && (
                    <span style={styles.errorText}>{formErrors.date}</span>
                  )}
                </div>
                
                <div style={styles.formGroupHalf}>
                  <label style={styles.label}>Time *</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleFormChange}
                    style={{...styles.input, ...(formErrors.time ? styles.inputError : {})}}
                  />
                  {formErrors.time && (
                    <span style={styles.errorText}>{formErrors.time}</span>
                  )}
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Budget (PKR) *</label>
                <div style={styles.budgetInput}>
                  <span style={styles.currency}>PKR</span>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleFormChange}
                    placeholder="Enter your budget"
                    min="500"
                    style={{...styles.input, ...styles.budgetField, ...(formErrors.budget ? styles.inputError : {})}}
                  />
                </div>
                {formErrors.budget && (
                  <span style={styles.errorText}>{formErrors.budget}</span>
                )}
                <small style={styles.helpText}>Minimum budget: PKR 500</small>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Preferred Contact Method</label>
                <select
                  name="contactPreference"
                  value={formData.contactPreference}
                  onChange={handleFormChange}
                  style={styles.input}
                >
                  <option value="phone">Phone Call</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="message">Message</option>
                  <option value="any">Any Method</option>
                </select>
              </div>
            </div>
            
            {/* Form Actions */}
            <div style={styles.formActions}>
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                style={styles.cancelButton}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span>Posting Request...</span>
                ) : (
                  <span><FaPaperPlane /> Post Service Request</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* My Orders View (Your original tracking interface) */}
      {activeTab === 'my-orders' && (
        <>
          <div style={styles.ordersHeader}>
            <h2 style={styles.sectionTitle}>My Service Orders</h2>
            <button 
              style={styles.primaryButton}
              onClick={() => setActiveTab('post-request')}
            >
              <FaPlus /> Post New Request
            </button>
          </div>
          
          {/* Active Orders */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <FaClock style={styles.sectionIcon} /> Active Orders ({activeOrders.length})
            </h3>
            
            {activeOrders.length === 0 ? (
              <div style={styles.emptyState}>
                <p>No active orders. Post a service request to get started!</p>
                <button 
                  style={styles.primaryButton}
                  onClick={() => setActiveTab('post-request')}
                >
                  Post New Request
                </button>
              </div>
            ) : (
              <div style={styles.ordersList}>
                {activeOrders.map(order => (
                  <div key={order.id} style={styles.orderCard}>
                    {/* ... (Keep your existing order card JSX here) */}
                    {/* Copy the entire order card from your original code */}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Completed Orders */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <FaCheckCircle style={styles.sectionIcon} /> Completed Orders ({completedOrders.length})
            </h3>
            
            {completedOrders.length === 0 ? (
              <div style={styles.emptyState}>
                <p>No completed orders yet.</p>
              </div>
            ) : (
              <div style={styles.completedList}>
                {completedOrders.map(order => (
                  <div key={order.id} style={styles.completedCard}>
                    {/* ... (Keep your existing completed card JSX here) */}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Chat Modal (Keep as is) */}
      {chatOpen && (
        <div style={styles.chatModal}>
          <div style={styles.chatContainer}>
            {/* ... (Keep your existing chat modal JSX here) */}
          </div>
        </div>
      )}

      {/* Socket Status Indicator */}
      <div style={styles.socketIndicator}>
        <div style={{
          ...styles.indicatorDot,
          backgroundColor: socket.connected ? '#4CAF50' : '#f44336'
        }}></div>
        <span>
          {socket.connected ? 'Live chat & updates connected' : 'Connecting to server...'}
        </span>
      </div>
    </div>
  );
};

// Add these new styles to your existing styles object:
const styles = {
  // ... (Keep all your existing styles)
  
  // New styles for the portal
  tabs: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
    borderBottom: '2px solid #eee',
    paddingBottom: '10px'
  },
  tab: {
    padding: '12px 24px',
    backgroundColor: '#f8f9fa',
    border: 'none',
    borderRadius: '8px 8px 0 0',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s'
  },
  activeTab: {
    backgroundColor: '#007bff',
    color: 'white',
    boxShadow: '0 2px 5px rgba(0,123,255,0.3)'
  },
  quickActions: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '25px',
    marginBottom: '30px',
    boxShadow: '0 2px 15px rgba(0,0,0,0.05)'
  },
  actionButtons: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap'
  },
  secondaryButton: {
    padding: '15px 25px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'background-color 0.3s'
  },
  recentActivity: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '25px',
    boxShadow: '0 2px 15px rgba(0,0,0,0.05)'
  },
  activityCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '15px',
    borderLeft: '4px solid #007bff'
  },
  activityHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  activityDesc: {
    color: '#666',
    marginBottom: '15px',
    fontSize: '14px'
  },
  activityDetails: {
    display: 'flex',
    gap: '20px',
    marginBottom: '15px',
    fontSize: '13px',
    color: '#888'
  },
  activityActions: {
    display: 'flex',
    gap: '10px'
  },
  smallButton: {
    padding: '6px 15px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  // Form Styles
  requestFormContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 2px 20px rgba(0,0,0,0.1)'
  },
  formHeader: {
    marginBottom: '30px',
    textAlign: 'center'
  },
  form: {
    maxWidth: '800px',
    margin: '0 auto'
  },
  formSection: {
    marginBottom: '40px',
    paddingBottom: '30px',
    borderBottom: '1px solid #eee'
  },
  formSectionTitle: {
    fontSize: '1.3rem',
    color: '#333',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  formGroup: {
    marginBottom: '25px'
  },
  formRow: {
    display: 'flex',
    gap: '20px',
    marginBottom: '25px'
  },
  formGroupHalf: {
    flex: 1
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#333',
    fontSize: '15px'
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    border: '2px solid #e0e6ed',
    borderRadius: '8px',
    fontSize: '15px',
    transition: 'all 0.3s',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '12px 15px',
    border: '2px solid #e0e6ed',
    borderRadius: '8px',
    fontSize: '15px',
    transition: 'all 0.3s',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  },
  inputError: {
    borderColor: '#e74c3c',
    boxShadow: '0 0 0 3px rgba(231, 76, 60, 0.1)'
  },
  errorText: {
    color: '#e74c3c',
    fontSize: '13px',
    marginTop: '5px',
    display: 'block'
  },
  helpText: {
    color: '#7f8c8d',
    fontSize: '13px',
    marginTop: '5px',
    display: 'block'
  },
  radioGroup: {
    display: 'flex',
    gap: '20px',
    marginTop: '10px'
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    color: '#555'
  },
  radio: {
    margin: 0
  },
  budgetInput: {
    display: 'flex',
    alignItems: 'center'
  },
  currency: {
    backgroundColor: '#f8f9fa',
    padding: '12px 15px',
    border: '2px solid #e0e6ed',
    borderRight: 'none',
    borderRadius: '8px 0 0 8px',
    color: '#666',
    fontWeight: '500'
  },
  budgetField: {
    borderRadius: '0 8px 8px 0'
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '15px',
    marginTop: '40px',
    paddingTop: '30px',
    borderTop: '1px solid #eee'
  },
  cancelButton: {
    padding: '12px 30px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  submitButton: {
    padding: '12px 30px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'background-color 0.3s'
  },
  ordersHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  }
};

export default CustomerOrderTracking;

