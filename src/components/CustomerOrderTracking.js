import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaArrowLeft, FaClock, FaCheckCircle, FaTimesCircle, 
  FaSpinner, FaExclamationTriangle, FaStar, FaPhone, 
  FaMapMarkerAlt, FaUser, FaTools, FaRupeeSign, FaCalendarAlt,
  FaComments, FaCreditCard, FaHistory, FaBell, FaHome,
  FaShoppingCart, FaBox, FaDownload, FaPaperPlane,
  FaCheck, FaCheckDouble, FaImage, FaFile, FaPaperclip,
  FaSmile, FaRegStar, FaStarHalf, FaEllipsisV
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
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  
  // Chat State
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const messageSound = useRef(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatSearchTerm, setChatSearchTerm] = useState('');
  const [newMessageNotification, setNewMessageNotification] = useState(null);

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

  // Load chats from localStorage
  useEffect(() => {
    const savedChats = localStorage.getItem('customer_chats');
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats);
        setChats(parsedChats);
      } catch (e) {
        console.error('Error parsing chats:', e);
      }
    }
    messageSound.current = new Audio('/notification.mp3');
  }, []);

  // Save chats to localStorage
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('customer_chats', JSON.stringify(chats));
    }
  }, [chats]);

  // Load messages from localStorage for each chat
  useEffect(() => {
    const loadAllMessages = () => {
      const storedMessages = {};
      chats.forEach(chat => {
        try {
          const savedMessages = localStorage.getItem(`chat_${chat.id}_messages`);
          if (savedMessages) {
            storedMessages[chat.id] = JSON.parse(savedMessages);
          }
        } catch (e) {
          console.error(`Error loading messages for chat ${chat.id}:`, e);
        }
      });
      if (Object.keys(storedMessages).length > 0) {
        setMessages(prev => ({ ...prev, ...storedMessages }));
      }
    };
    loadAllMessages();
  }, [chats.length]);

  // Save messages to localStorage when they change
  useEffect(() => {
    Object.entries(messages).forEach(([chatId, chatMessages]) => {
      if (chatMessages.length > 0) {
        localStorage.setItem(`chat_${chatId}_messages`, JSON.stringify(chatMessages));
      }
    });
  }, [messages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (activeChat) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, activeChat]);

  // Typing indicator
  useEffect(() => {
    if (!activeChat) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socket.send('typing_indicator', {
      chatId: activeChat.id,
      isTyping,
      receiverId: activeChat.participant.id
    });

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        socket.send('typing_indicator', {
          chatId: activeChat.id,
          isTyping: false,
          receiverId: activeChat.participant.id
        });
      }
    }, 2000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isTyping, activeChat]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (activeChat) {
      markAsRead(activeChat.id);
    }
  }, [activeChat]);

  // Show new message notification
  useEffect(() => {
    if (newMessageNotification) {
      const timer = setTimeout(() => {
        setNewMessageNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [newMessageNotification]);

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
          
          // Create chats for accepted/completed requests
          data.data.requests.forEach(req => {
            if ((req.status === 'accepted' || req.status === 'in_progress' || req.status === 'completed') && req.providerName) {
              const existingChat = chats.find(c => c.jobId === req.id);
              if (!existingChat) {
                const newChat = {
                  id: `chat_${req.id}`,
                  participant: {
                    id: req.providerId,
                    name: req.providerName
                  },
                  jobId: req.id,
                  jobTitle: req.title || req.service,
                  createdAt: req.acceptedAt || new Date().toISOString(),
                  lastMessage: null,
                  lastMessageTime: null,
                  unreadCount: 0
                };
                setChats(prev => {
                  const exists = prev.some(c => c.id === newChat.id);
                  return exists ? prev : [newChat, ...prev];
                });
              }
            }
          });
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
  }, [customerInfo?.id]);

  // WebSocket listeners
  useEffect(() => {
    if (!customerInfo?.id) return;

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

      // Create chat for accepted request
      const request = requests.find(r => r.id === data.requestId);
      if (request) {
        const newChat = {
          id: `chat_${data.requestId}`,
          participant: {
            id: data.providerId,
            name: data.providerName
          },
          jobId: data.requestId,
          jobTitle: request.title || request.service,
          createdAt: new Date().toISOString(),
          lastMessage: null,
          lastMessageTime: null,
          unreadCount: 0
        };
        setChats(prev => {
          const exists = prev.some(c => c.id === newChat.id);
          return exists ? prev : [newChat, ...prev];
        });
      }

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
      console.log('💬 New message received:', data);
      
      const { chatId, message, senderId, senderName } = data;
    
      // First, ensure the chat exists in chats array
      setChats(prevChats => {
        const chatExists = prevChats.some(chat => chat.id === chatId);
        if (!chatExists) {
          // Find the related job/request to create chat
          const relatedRequest = requests.find(r => 
            r.providerId === senderId || r.id === chatId.replace('chat_', '')
          );
          
          if (relatedRequest) {
            const newChat = {
              id: chatId,
              participant: {
                id: senderId,
                name: senderName
              },
              jobId: relatedRequest.id,
              jobTitle: relatedRequest.title || relatedRequest.service,
              createdAt: new Date().toISOString(),
              lastMessage: message.text,
              lastMessageTime: message.timestamp,
              unreadCount: 1
            };
            return [newChat, ...prevChats];
          }
        }
        return prevChats;
      });
    
      // Update messages state
      setMessages(prev => {
        const chatMessages = prev[chatId] || [];
        
        // Check if message already exists to prevent duplicates
        const messageExists = chatMessages.some(m => m.id === message.id);
        if (messageExists) {
          console.log('⚠️ Message already exists, skipping duplicate');
          return prev;
        }
    
        return {
          ...prev,
          [chatId]: [...chatMessages, {
            id: message.id,
            text: message.text,
            senderId,
            senderName,
            timestamp: message.timestamp,
            read: false
          }]
        };
      });
    
      // Update chat list with last message and unread count
      setChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { 
              ...chat, 
              lastMessage: message.text,
              lastMessageTime: message.timestamp,
              unreadCount: senderId !== customerInfo.id 
                ? (chat.unreadCount || 0) + 1 
                : chat.unreadCount
            }
          : chat
      ));
    
      // Update unread count and play sound
      if (senderId !== customerInfo.id) {
        setUnreadCount(prev => prev + 1);
        messageSound.current?.play().catch(e => console.log('Audio play failed:', e));
        
        // Show in-app notification
        setNewMessageNotification({
          chatId,
          senderName,
          message: message.text
        });
        
        // Show browser notification
        showNotification(`💬 New Message from ${senderName}`, message.text);
      }
    
      // If this is the active chat, mark as read
      if (activeChat?.id === chatId && senderId !== customerInfo.id) {
        setTimeout(() => {
          markAsRead(chatId);
        }, 1000);
      }
    };

    const handleMessageRead = (data) => {
      const { chatId } = data;
      
      setMessages(prev => ({
        ...prev,
        [chatId]: prev[chatId]?.map(msg => ({ ...msg, read: true })) || []
      }));

      setChats(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
      ));

      setUnreadCount(prev => {
        const totalUnread = chats.reduce((sum, chat) => 
          chat.id === chatId ? sum : sum + (chat.unreadCount || 0), 0);
        return totalUnread;
      });
    };

    const handleUserTyping = (data) => {
      const { chatId, userId, isTyping } = data;
      setChats(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, typing: isTyping ? userId : null } : chat
      ));
    };

    const handleUserOnline = (data) => {
      console.log('🟢 User online:', data.userId);
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.add(data.userId);
        return newSet;
      });
    };

    const handleUserOffline = (data) => {
      console.log('🔴 User offline:', data.userId);
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    };

    // Register socket listeners
    socket.on('request_accepted', handleRequestAccepted);
    socket.on('order_completed', handleOrderCompleted);
    socket.on('payment_confirmed', handlePaymentConfirmed);
    socket.on('chat_message', handleNewMessage);
    socket.on('messages_read', handleMessageRead);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);
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
      socket.off('chat_message', handleNewMessage);
      socket.off('messages_read', handleMessageRead);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
      socket.off('connected');
      socket.off('disconnected');
    };
  }, [customerInfo?.id, requests, activeChat]);

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

  // Send message
  const sendMessage = () => {
    if (!messageText.trim() || !activeChat) return;
  
    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      text: messageText.trim(),
      senderId: customerInfo.id,
      senderName: customerInfo.name,
      timestamp: new Date().toISOString(),
      read: false
    };
  
    console.log('📤 Customer sending message:', message);
  
    // Optimistically add to messages
    setMessages(prev => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), message]
    }));
  
    // Update chat last message
    setChats(prev => prev.map(c => 
      c.id === activeChat.id 
        ? { ...c, lastMessage: message.text, lastMessageTime: message.timestamp }
        : c
    ));
  
    // Send via WebSocket
    socket.send('chat_message', {
      chatId: activeChat.id,
      message,
      receiverId: activeChat.participant.id,
      jobId: activeChat.jobId
    });
  
    setMessageText('');
    setIsTyping(false);
  };
  // Mark messages as read
  const markAsRead = (chatId) => {
    socket.send('messages_read', {
      chatId,
      userId: customerInfo.id
    });

    setMessages(prev => ({
      ...prev,
      [chatId]: prev[chatId]?.map(msg => ({ ...msg, read: true })) || []
    }));

    setChats(prev => prev.map(c => 
      c.id === chatId ? { ...c, unreadCount: 0 } : c
    ));

    setUnreadCount(prev => {
      const totalUnread = chats.reduce((sum, chat) => 
        chat.id === chatId ? sum : sum + (chat.unreadCount || 0), 0);
      return totalUnread;
    });
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeChat) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('chatId', activeChat.id);

    try {
      const response = await fetch('/api/chat/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        sendMessage(`📎 ${file.name}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

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

  // Format message time
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString();
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

  // Filter chats by search term
  const filteredChats = chats.filter(chat => 
    chat.participant.name.toLowerCase().includes(chatSearchTerm.toLowerCase()) ||
    chat.jobTitle.toLowerCase().includes(chatSearchTerm.toLowerCase())
  );

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
        alert('💰 Redirecting to payment gateway...');
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

  // Open chat
  const openChat = (request) => {
    const chat = chats.find(c => c.jobId === request.id);
    if (chat) {
      setActiveChat(chat);
      setShowChatModal(true);
      markAsRead(chat.id);
    }
  };

  // Download invoice
  const downloadInvoice = (request) => {
    const invoice = {
      invoiceNo: `INV-${request.id}`,
      date: new Date().toLocaleDateString(),
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone || 'N/A',
      providerName: request.providerName || 'N/A',
      service: request.title || request.service,
      description: request.description || 'N/A',
      amount: request.budget || '0',
      status: 'Paid',
      paymentMethod: 'JazzCash'
    };

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
      <div style={styles.loadingContainer}>
        <FaSpinner className="spin" style={{ fontSize: '40px', color: '#007bff' }} />
        <p style={{ marginTop: '20px', color: '#666' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Navigation Bar */}
      <div style={styles.navBar}>
        <div style={styles.navLinks}>
          <Link to="/" style={styles.navLink}><FaHome /> Home</Link>
          <Link to="/customer-portal" style={styles.navLinkPrimary}><FaShoppingCart /> Dashboard</Link>
          <Link to="/customer-orders" style={styles.navLinkInfo}><FaBox /> My Orders</Link>
          <Link to="/post-request" style={styles.navLinkSuccess}><FaTools /> Post Request</Link>
        </div>
        
        {/* Connection Status & Chat Button */}
        <div style={styles.headerRight}>
          {/* Chat Button */}
          <button
            onClick={() => setShowChatModal(true)}
            style={styles.chatButton}
          >
            <FaComments />
            {unreadCount > 0 && (
              <span style={styles.chatBadge}>{unreadCount}</span>
            )}
          </button>

          <span style={{
            ...styles.connectionBadge,
            backgroundColor: socket.isConnected() ? '#d4edda' : '#f8d7da',
            color: socket.isConnected() ? '#155724' : '#721c24'
          }}>
            <span style={{
              ...styles.connectionDot,
              backgroundColor: socket.isConnected() ? '#28a745' : '#dc3545'
            }} />
            {socket.isConnected() ? 'Live' : 'Offline'}
          </span>
          
          <span style={styles.userName}>👤 {customerInfo.name}</span>
        </div>
      </div>

      {/* In-app Notification */}
      {newMessageNotification && (
        <div style={styles.notificationPopup}>
          <div style={styles.notificationContent}>
            <strong>{newMessageNotification.senderName}</strong>
            <p>{newMessageNotification.message}</p>
          </div>
          <button 
            onClick={() => {
              const chat = chats.find(c => c.id === newMessageNotification.chatId);
              if (chat) {
                setActiveChat(chat);
                setShowChatModal(true);
                markAsRead(chat.id);
                setNewMessageNotification(null);
              }
            }}
            style={styles.notificationButton}
          >
            View
          </button>
        </div>
      )}

      {/* Page Header */}
      <div style={styles.pageHeader}>
        <div style={styles.headerLeft}>
          <h1 style={styles.pageTitle}>My Orders</h1>
          <span style={styles.totalBadge}>{requests.length} Total</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabContainer}>
        <button
          onClick={() => setActiveTab('active')}
          style={{
            ...styles.tabButton,
            backgroundColor: activeTab === 'active' ? '#007bff' : 'transparent',
            color: activeTab === 'active' ? 'white' : '#6c757d'
          }}
        >
          Active Orders ({requests.filter(r => ['pending', 'accepted', 'in_progress'].includes(r.status)).length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          style={{
            ...styles.tabButton,
            backgroundColor: activeTab === 'completed' ? '#007bff' : 'transparent',
            color: activeTab === 'completed' ? 'white' : '#6c757d'
          }}
        >
          Completed ({requests.filter(r => r.status === 'completed').length})
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          style={{
            ...styles.tabButton,
            backgroundColor: activeTab === 'cancelled' ? '#007bff' : 'transparent',
            color: activeTab === 'cancelled' ? 'white' : '#6c757d'
          }}
        >
          Cancelled ({requests.filter(r => r.status === 'rejected').length})
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={styles.errorAlert}>
          <FaExclamationTriangle />
          {error}
        </div>
      )}

      {/* Requests List */}
      {loading ? (
        <div style={styles.loadingContainer}>
          <FaSpinner className="spin" style={{ fontSize: '40px', color: '#007bff' }} />
          <p style={{ marginTop: '20px', color: '#666' }}>Loading your orders...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div style={styles.emptyState}>
          <FaBox style={styles.emptyIcon} />
          <h2 style={styles.emptyTitle}>No orders found</h2>
          <p style={styles.emptyText}>
            {activeTab === 'active' ? "You don't have any active orders." :
             activeTab === 'completed' ? "You haven't completed any orders yet." :
             "You don't have any cancelled orders."}
          </p>
          <button
            onClick={() => navigate('/post-request')}
            style={styles.postRequestButton}
          >
            Post a Request
          </button>
        </div>
      ) : (
        <div style={styles.ordersGrid}>
          {filteredRequests.map((request) => {
            const status = getStatusConfig(request.status);
            
            return (
              <div key={request.id} style={{...styles.orderCard, borderLeftColor: status.color}}>
                {/* Status Badge */}
                <span style={{...styles.statusBadge, backgroundColor: status.bg, color: status.color}}>
                  {status.badge}
                </span>

                {/* Request Header */}
                <div style={styles.orderHeader}>
                  <div>
                    <h2 style={styles.orderTitle}>{request.title || request.service}</h2>
                    <div style={styles.orderMeta}>
                      <span style={{...styles.statusText, color: status.color}}>
                        {status.icon} {status.text}
                      </span>
                      <span style={styles.orderDate}>
                        <FaClock style={{ marginRight: '5px' }} />
                        {formatDate(request.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div style={styles.orderBudget}>{formatBudget(request.budget)}</div>
                </div>

                {/* Progress Bar */}
                <div style={styles.progressContainer}>
                  <div style={styles.progressBar}>
                    <div style={{...styles.progressFill, width: `${status.progress}%`, backgroundColor: status.color}} />
                  </div>
                  <div style={styles.progressLabels}>
                    <span>📝 Posted</span>
                    <span>🔧 Assigned</span>
                    <span>⚙️ In Progress</span>
                    <span>✅ Completed</span>
                  </div>
                </div>

                {/* Request Details Grid */}
                <div style={styles.detailsGrid}>
                  <div style={styles.detailItem}>
                    <FaMapMarkerAlt style={{ color: '#dc3545' }} />
                    <div>
                      <small style={styles.detailLabel}>Location</small>
                      <p style={styles.detailValue}>{request.location}</p>
                    </div>
                  </div>
                  <div style={styles.detailItem}>
                    <FaCalendarAlt style={{ color: '#007bff' }} />
                    <div>
                      <small style={styles.detailLabel}>Schedule</small>
                      <p style={styles.detailValue}>{request.schedule || 'ASAP'}</p>
                    </div>
                  </div>
                  <div style={styles.detailItem}>
                    <FaPhone style={{ color: '#28a745' }} />
                    <div>
                      <small style={styles.detailLabel}>Contact</small>
                      <p style={styles.detailValue}>{request.contact || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Provider Info & Actions */}
                {request.status === 'accepted' && request.providerName && (
                  <div style={styles.providerSection}>
                    <div style={styles.providerInfo}>
                      <div style={styles.providerAvatar}>👨‍🔧</div>
                      <div>
                        <h4 style={styles.providerName}>Provider Assigned!</h4>
                        <p style={styles.providerDetails}>
                          <strong>{request.providerName}</strong>
                          {onlineUsers.has(request.providerId) && (
                            <span style={styles.onlineStatus}> ● Online</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div style={styles.actionButtons}>
                      <button
                        onClick={() => openChat(request)}
                        style={styles.chatActionButton}
                      >
                        <FaComments /> Chat
                      </button>
                      <button
                        onClick={() => handlePayment(request)}
                        style={styles.payActionButton}
                      >
                        <FaCreditCard /> Pay Now
                      </button>
                    </div>
                  </div>
                )}

                {/* Completed Order Actions */}
                {request.status === 'completed' && (
                  <div style={styles.completedSection}>
                    <div style={styles.completedInfo}>
                      <div style={styles.completedAvatar}>👨‍🔧</div>
                      <div>
                        <h4 style={styles.completedTitle}>Service Completed</h4>
                        <p style={styles.completedDetails}>
                          Provider: <strong>{request.providerName}</strong>
                        </p>
                      </div>
                    </div>
                    <div style={styles.actionButtons}>
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowRatingModal(true);
                        }}
                        style={styles.rateActionButton}
                      >
                        <FaStar /> Rate Provider
                      </button>
                      <button
                        onClick={() => downloadInvoice(request)}
                        style={styles.invoiceActionButton}
                      >
                        <FaDownload /> Invoice
                      </button>
                    </div>
                  </div>
                )}

                {/* Description */}
                {request.description && (
                  <div style={styles.descriptionSection}>
                    <strong style={styles.descriptionLabel}>Description:</strong>
                    <p style={styles.descriptionText}>{request.description}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedRequest && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>Rate Your Provider</h2>
            <p style={styles.modalSubtitle}>
              How was your experience with {selectedRequest.providerName}?
            </p>
            
            {/* Star Rating */}
            <div style={styles.starContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    ...styles.star,
                    color: star <= (hoverRating || rating) ? '#ffc107' : '#e9ecef'
                  }}
                />
              ))}
            </div>
            
            {/* Review Text */}
            <textarea
              placeholder="Write your review (optional)"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              style={styles.reviewTextarea}
            />
            
            {/* Buttons */}
            <div style={styles.modalButtons}>
              <button onClick={handleSubmitRating} style={styles.submitButton}>
                Submit Rating
              </button>
              <button
                onClick={() => {
                  setShowRatingModal(false);
                  setRating(0);
                  setReview('');
                  setSelectedRequest(null);
                }}
                style={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && (
        <div style={styles.chatModalOverlay}>
          <div style={styles.chatModalContent}>
            {/* Chat Header */}
            <div style={styles.chatHeader}>
              <div style={styles.chatHeaderLeft}>
                <FaComments />
                <span style={styles.chatHeaderTitle}>Messages</span>
                {unreadCount > 0 && (
                  <span style={styles.chatHeaderBadge}>{unreadCount} new</span>
                )}
              </div>
              <button
                onClick={() => {
                  setShowChatModal(false);
                  setActiveChat(null);
                }}
                style={styles.closeButton}
              >
                ×
              </button>
            </div>

            {/* Chat Layout */}
            <div style={styles.chatLayout}>
              {/* Chat List */}
              <div style={styles.chatList}>
                {/* Search Bar */}
                <div style={styles.searchContainer}>
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={chatSearchTerm}
                    onChange={(e) => setChatSearchTerm(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>

                {filteredChats.length === 0 ? (
                  <div style={styles.noChats}>
                    <FaComments size={32} style={{ opacity: 0.5, marginBottom: '10px' }} />
                    <p>No conversations yet</p>
                  </div>
                ) : (
                  filteredChats.map(chat => {
                    const isOnline = onlineUsers.has(chat.participant.id);
                    const chatMsgs = messages[chat.id] || [];
                    const lastMsg = chatMsgs[chatMsgs.length - 1];
                    const unreadCount = chat.unreadCount || 0;
                    
                    return (
                      <div
                        key={chat.id}
                        onClick={() => {
                          setActiveChat(chat);
                          markAsRead(chat.id);
                        }}
                        style={{
                          ...styles.chatListItem,
                          backgroundColor: activeChat?.id === chat.id ? '#e3f2fd' : 'white'
                        }}
                      >
                        <div style={styles.chatListItemInner}>
                          <div style={styles.chatAvatarContainer}>
                            <div style={styles.chatAvatar}>
                              {chat.participant.name.charAt(0)}
                            </div>
                            {isOnline && <span style={styles.onlineDot} />}
                          </div>
                          <div style={styles.chatInfo}>
                            <div style={styles.chatHeader}>
                              <strong style={styles.chatName}>{chat.participant.name}</strong>
                              {lastMsg && (
                                <span style={styles.chatTime}>
                                  {formatMessageTime(lastMsg.timestamp)}
                                </span>
                              )}
                            </div>
                            <div style={styles.chatJobTitle}>{chat.jobTitle}</div>
                            {lastMsg ? (
                              <div style={{
                                ...styles.chatLastMessage,
                                fontWeight: unreadCount > 0 ? '500' : 'normal',
                                color: unreadCount > 0 ? '#333' : '#6c757d'
                              }}>
                                {lastMsg.senderId === customerInfo.id ? 'You: ' : ''}
                                {lastMsg.text}
                              </div>
                            ) : (
                              <div style={styles.noMessages}>No messages yet</div>
                            )}
                            {chat.typing === chat.participant.id && (
                              <div style={styles.typingIndicator}>typing...</div>
                            )}
                          </div>
                        </div>
                        {unreadCount > 0 && (
                          <span style={styles.unreadBadge}>{unreadCount}</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Window */}
              <div style={styles.chatWindow}>
                {!activeChat ? (
                  <div style={styles.noChatSelected}>
                    <FaComments size={48} style={{ opacity: 0.5, marginBottom: '20px' }} />
                    <p>Select a conversation to start messaging</p>
                  </div>
                ) : (
                  <>
                    {/* Chat Header */}
                    <div style={styles.activeChatHeader}>
                      <div style={styles.activeChatUser}>
                        <div style={styles.activeChatAvatarContainer}>
                          <div style={styles.activeChatAvatar}>
                            {activeChat.participant.name.charAt(0)}
                          </div>
                          {onlineUsers.has(activeChat.participant.id) && (
                            <span style={styles.activeChatOnlineDot} />
                          )}
                        </div>
                        <div>
                          <h4 style={styles.activeChatName}>{activeChat.participant.name}</h4>
                          <p style={styles.activeChatStatus}>
                            {onlineUsers.has(activeChat.participant.id) ? 'Online' : 'Offline'} • {activeChat.jobTitle}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div style={styles.messagesContainer}>
                      {(messages[activeChat.id] || []).map((msg, index) => {
                        const isMe = msg.senderId === customerInfo.id;
                        const showDate = index === 0 || 
                          new Date(msg.timestamp).toDateString() !== 
                          new Date((messages[activeChat.id] || [])[index - 1]?.timestamp).toDateString();

                        return (
                          <React.Fragment key={msg.id}>
                            {showDate && (
                              <div style={styles.dateDivider}>
                                <span>{new Date(msg.timestamp).toLocaleDateString()}</span>
                              </div>
                            )}
                            <div style={{
                              ...styles.messageWrapper,
                              justifyContent: isMe ? 'flex-end' : 'flex-start'
                            }}>
                              <div style={{
                                ...styles.messageBubble,
                                backgroundColor: isMe ? '#007bff' : '#e9ecef',
                                color: isMe ? 'white' : '#333'
                              }}>
                                <p style={styles.messageText}>{msg.text}</p>
                                <div style={styles.messageFooter}>
                                  <span style={styles.messageTime}>
                                    {formatMessageTime(msg.timestamp)}
                                  </span>
                                  {isMe && (
                                    <span style={styles.messageStatus}>
                                      {msg.read ? <FaCheckDouble color="#fff" /> : <FaCheck color="#fff" />}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })}
                      {activeChat.typing === activeChat.participant.id && (
                        <div style={styles.typingBubble}>
                          <div style={styles.typingText}>
                            {activeChat.participant.name} is typing...
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div style={styles.messageInputContainer}>
                      <div style={styles.inputWrapper}>
                        <div style={styles.attachContainer}>
                          <button
                            onClick={() => setShowAttachments(!showAttachments)}
                            style={styles.attachButton}
                          >
                            <FaPaperclip />
                          </button>
                          {showAttachments && (
                            <div style={styles.attachMenu}>
                              <button
                                onClick={() => {
                                  fileInputRef.current.click();
                                  setShowAttachments(false);
                                }}
                                style={styles.attachMenuItem}
                              >
                                <FaImage /> Image
                              </button>
                              <button
                                onClick={() => {
                                  fileInputRef.current.click();
                                  setShowAttachments(false);
                                }}
                                style={styles.attachMenuItem}
                              >
                                <FaFile /> File
                              </button>
                            </div>
                          )}
                          <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileUpload}
                          />
                        </div>
                        <input
                          type="text"
                          value={messageText}
                          onChange={(e) => {
                            setMessageText(e.target.value);
                            if (e.target.value.length > 0 && !isTyping) {
                              setIsTyping(true);
                            } else if (e.target.value.length === 0 && isTyping) {
                              setIsTyping(false);
                            }
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              sendMessage();
                            }
                          }}
                          placeholder="Type your message..."
                          style={styles.messageInput}
                        />
                        <button
                          onClick={sendMessage}
                          disabled={!messageText.trim()}
                          style={{
                            ...styles.sendButton,
                            backgroundColor: messageText.trim() ? '#007bff' : '#6c757d',
                            cursor: messageText.trim() ? 'pointer' : 'not-allowed'
                          }}
                        >
                          <FaPaperPlane />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
    position: 'relative'
  },
  navBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '30px',
    padding: '15px 20px',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  navLink: {
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
  },
  navLinkPrimary: {
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
  },
  navLinkInfo: {
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
  },
  navLinkSuccess: {
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
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  chatButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'white',
    color: '#007bff',
    border: '2px solid #dee2e6',
    cursor: 'pointer',
    position: 'relative'
  },
  chatBadge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    backgroundColor: '#dc3545',
    color: 'white',
    fontSize: '11px',
    fontWeight: 'bold',
    minWidth: '18px',
    height: '18px',
    borderRadius: '9px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px'
  },
  notificationPopup: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    padding: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    zIndex: 9999,
    maxWidth: '300px',
    border: '1px solid #007bff',
    animation: 'slideIn 0.3s ease'
  },
  notificationContent: {
    flex: 1,
    '& strong': {
      display: 'block',
      marginBottom: '4px',
      color: '#007bff'
    },
    '& p': {
      margin: 0,
      fontSize: '13px',
      color: '#333'
    }
  },
  notificationButton: {
    padding: '6px 12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    whiteSpace: 'nowrap'
  },
  connectionBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '5px 10px',
    borderRadius: '20px',
    fontSize: '12px'
  },
  connectionDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },
  userName: {
    color: '#666',
    fontSize: '14px'
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '30px'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  pageTitle: {
    margin: 0,
    fontSize: '32px',
    color: '#333'
  },
  totalBadge: {
    padding: '5px 12px',
    backgroundColor: '#e3f2fd',
    color: '#007bff',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  tabContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    borderBottom: '2px solid #e9ecef',
    paddingBottom: '10px'
  },
  tabButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.2s'
  },
  errorAlert: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '15px',
    borderRadius: '5px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '50px'
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '60px 20px',
    textAlign: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  emptyIcon: {
    fontSize: '60px',
    color: '#6c757d',
    marginBottom: '20px',
    opacity: 0.5
  },
  emptyTitle: {
    color: '#333',
    marginBottom: '10px'
  },
  emptyText: {
    color: '#666',
    marginBottom: '30px'
  },
  postRequestButton: {
    padding: '15px 40px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: 'bold'
  },
  ordersGrid: {
    display: 'grid',
    gap: '20px'
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '25px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    borderLeft: '5px solid',
    position: 'relative'
  },
  statusBadge: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    padding: '5px 15px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    paddingRight: '100px'
  },
  orderTitle: {
    margin: '0 0 10px 0',
    color: '#333',
    fontSize: '20px'
  },
  orderMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  statusText: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '14px'
  },
  orderDate: {
    color: '#666',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center'
  },
  orderBudget: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#28a745'
  },
  progressContainer: {
    marginBottom: '20px'
  },
  progressBar: {
    height: '6px',
    backgroundColor: '#e9ecef',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    transition: 'width 0.3s ease'
  },
  progressLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '5px',
    fontSize: '11px',
    color: '#6c757d'
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  detailLabel: {
    color: '#666'
  },
  detailValue: {
    margin: 0,
    fontWeight: '500',
    fontSize: '14px'
  },
  providerSection: {
    padding: '15px',
    backgroundColor: '#d4edda',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '15px'
  },
  providerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  providerAvatar: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    backgroundColor: '#28a745',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '22px'
  },
  providerName: {
    margin: 0,
    color: '#155724',
    fontSize: '16px'
  },
  providerDetails: {
    margin: '5px 0 0 0',
    color: '#155724',
    fontSize: '14px'
  },
  onlineStatus: {
    marginLeft: '10px',
    fontSize: '12px',
    color: '#28a745'
  },
  actionButtons: {
    display: 'flex',
    gap: '10px'
  },
  chatActionButton: {
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
  },
  payActionButton: {
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
  },
  completedSection: {
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '15px'
  },
  completedInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  completedAvatar: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    backgroundColor: '#6c757d',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '22px'
  },
  completedTitle: {
    margin: 0,
    color: '#333',
    fontSize: '16px'
  },
  completedDetails: {
    margin: '5px 0 0 0',
    color: '#666',
    fontSize: '14px'
  },
  rateActionButton: {
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
  },
  invoiceActionButton: {
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
  },
  descriptionSection: {
    marginTop: '10px',
    color: '#666'
  },
  descriptionLabel: {
    fontSize: '14px'
  },
  descriptionText: {
    margin: '8px 0 0 0',
    lineHeight: '1.6',
    fontSize: '14px'
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
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    maxWidth: '400px',
    width: '90%'
  },
  modalTitle: {
    margin: '0 0 20px 0',
    color: '#333'
  },
  modalSubtitle: {
    color: '#666',
    marginBottom: '20px'
  },
  starContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    justifyContent: 'center'
  },
  star: {
    fontSize: '40px',
    cursor: 'pointer',
    transition: 'color 0.2s'
  },
  reviewTextarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ced4da',
    borderRadius: '5px',
    marginBottom: '20px',
    minHeight: '100px',
    fontSize: '14px',
    resize: 'vertical'
  },
  modalButtons: {
    display: 'flex',
    gap: '10px'
  },
  submitButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  chatModalOverlay: {
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
  },
  chatModalContent: {
    width: '90%',
    maxWidth: '900px',
    height: '600px',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 5px 30px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  chatHeader: {
    padding: '15px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  chatHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  chatHeaderTitle: {
    fontWeight: 'bold'
  },
  chatHeaderBadge: {
    backgroundColor: 'white',
    color: '#007bff',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '24px',
    cursor: 'pointer'
  },
  chatLayout: {
    display: 'flex',
    height: 'calc(100% - 60px)'
  },
  chatList: {
    width: '300px',
    borderRight: '1px solid #dee2e6',
    overflowY: 'auto',
    backgroundColor: '#f8f9fa'
  },
  searchContainer: {
    padding: '10px',
    borderBottom: '1px solid #dee2e6'
  },
  searchInput: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ced4da',
    borderRadius: '20px',
    fontSize: '13px'
  },
  noChats: {
    padding: '20px',
    textAlign: 'center',
    color: '#6c757d'
  },
  chatListItem: {
    padding: '15px',
    cursor: 'pointer',
    borderBottom: '1px solid #dee2e6',
    position: 'relative',
    transition: 'background-color 0.2s'
  },
  chatListItemInner: {
    display: 'flex',
    gap: '12px'
  },
  chatAvatarContainer: {
    position: 'relative'
  },
  chatAvatar: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    backgroundColor: '#007bff',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 'bold'
  },
  onlineDot: {
    position: 'absolute',
    bottom: '2px',
    right: '2px',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#28a745',
    border: '2px solid white',
    zIndex: 2
  },
  chatInfo: {
    flex: 1,
    minWidth: 0
  },
  chatName: {
    fontSize: '14px',
    color: '#333'
  },
  chatTime: {
    fontSize: '11px',
    color: '#6c757d'
  },
  chatJobTitle: {
    fontSize: '12px',
    color: '#007bff',
    marginBottom: '4px',
    fontWeight: '500'
  },
  chatLastMessage: {
    fontSize: '13px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  noMessages: {
    fontSize: '12px',
    color: '#999',
    fontStyle: 'italic'
  },
  typingIndicator: {
    fontSize: '12px',
    color: '#007bff',
    marginTop: '4px'
  },
  unreadBadge: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    backgroundColor: '#dc3545',
    color: 'white',
    fontSize: '11px',
    fontWeight: 'bold',
    minWidth: '20px',
    height: '20px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px'
  },
  chatWindow: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white'
  },
  noChatSelected: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6c757d'
  },
  activeChatHeader: {
    padding: '15px 20px',
    borderBottom: '1px solid #dee2e6',
    backgroundColor: '#f8f9fa'
  },
  activeChatUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  activeChatAvatarContainer: {
    position: 'relative'
  },
  activeChatAvatar: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    backgroundColor: '#007bff',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 'bold'
  },
  activeChatOnlineDot: {
    position: 'absolute',
    bottom: '2px',
    right: '2px',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#28a745',
    border: '2px solid white',
    zIndex: 2
  },
  activeChatName: {
    margin: 0,
    fontSize: '16px',
    color: '#333'
  },
  activeChatStatus: {
    margin: '4px 0 0',
    fontSize: '12px',
    color: '#6c757d'
  },
  messagesContainer: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  dateDivider: {
    textAlign: 'center',
    margin: '10px 0',
    '& span': {
      backgroundColor: '#e9ecef',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '11px',
      color: '#6c757d'
    }
  },
  messageWrapper: {
    display: 'flex',
    width: '100%'
  },
  messageBubble: {
    maxWidth: '70%',
    padding: '10px 14px',
    borderRadius: '16px',
    position: 'relative'
  },
  messageText: {
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.5'
  },
  messageFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '4px',
    marginTop: '4px'
  },
  messageTime: {
    fontSize: '10px',
    opacity: 0.7
  },
  messageStatus: {
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center'
  },
  typingBubble: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginTop: '10px'
  },
  typingText: {
    backgroundColor: '#e9ecef',
    padding: '10px 16px',
    borderRadius: '16px',
    color: '#6c757d',
    fontSize: '12px'
  },
  messageInputContainer: {
    padding: '15px 20px',
    borderTop: '1px solid #dee2e6',
    backgroundColor: '#f8f9fa'
  },
  inputWrapper: {
    display: 'flex',
    gap: '10px'
  },
  attachContainer: {
    position: 'relative'
  },
  attachButton: {
    padding: '10px',
    backgroundColor: 'white',
    border: '1px solid #ced4da',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  attachMenu: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    backgroundColor: 'white',
    border: '1px solid #dee2e6',
    borderRadius: '5px',
    padding: '5px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  attachMenuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    background: 'none',
    border: 'none',
    width: '100%',
    cursor: 'pointer'
  },
  messageInput: {
    flex: 1,
    padding: '10px',
    border: '1px solid #ced4da',
    borderRadius: '5px',
    fontSize: '14px'
  },
  sendButton: {
    padding: '10px 20px',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    transition: 'all 0.2s'
  }
};

// Global animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .spin {
      animation: spin 1s linear infinite;
    }
    @keyframes typing {
      0%, 60%, 100% { opacity: 0; }
      30% { opacity: 1; }
    }
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
  `;
  document.head.appendChild(style);
}

export default CustomerOrderTracking;