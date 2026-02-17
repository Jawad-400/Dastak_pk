import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBell, FaWallet, FaStar, FaMapMarkerAlt, FaCalendarAlt, 
  FaUser, FaCheckCircle, FaSearch, FaExclamationCircle,
  FaTachometerAlt, FaBriefcase, FaHistory, FaCog,
  FaSignOutAlt, FaPhone, FaEnvelope, FaClock,
  FaCheck, FaTimes, FaInfoCircle, FaSpinner,
  FaChartLine, FaMedal, FaThumbsUp, FaComment,
  FaCreditCard, FaDownload, FaPrint, FaShare,
  FaCrosshairs, FaGlobe, FaMap, FaFilter,
  FaToggleOn, FaToggleOff, FaBellSlash, FaLanguage,
  FaShieldAlt, FaLock, FaEye, FaEyeSlash,
  FaMoon, FaSun, FaPalette, FaSave,
  FaPaperPlane, FaCheckDouble, FaSmile, FaPaperclip,
  FaImage, FaFile, FaVideo
} from 'react-icons/fa';
import { socket } from '../Services/socket';
import { useLocation } from '../context/LocationContext';
import { calculateDistance } from '../Services/LocationService';
import LeafletMap from '../components/LeafletMap';
import { SERVICE_TYPES } from '../components/serviceTypes';

const ProviderDashboard = () => {
  const navigate = useNavigate();
  
  // ============ LOCATION ============
  const locationContext = useLocation();
  
  const { 
    userLocation = null, 
    detectLocation = () => {},
    loading: locationLoading = false,
    locationError = null,
    userAddress = ''
  } = locationContext || {};
  
  // ============ STATE MANAGEMENT ============
  const [connected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [realTimeRequests, setRealTimeRequests] = useState([]);
  const [nearbyRequests, setNearbyRequests] = useState([]);
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
  
  // ============ CHAT STATE ============
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
  
  // ============ LOCATION FILTERS ============
  const [showNearbyOnly, setShowNearbyOnly] = useState(false);
  const [maxDistance, setMaxDistance] = useState(10);
  const [showMap, setShowMap] = useState(false);
  const [nearbyProviders, setNearbyProviders] = useState([]);
  
  // Provider info from localStorage
  const [providerInfo, setProviderInfo] = useState({
    id: '',
    name: '',
    service: '',
    serviceType: '',
    phone: '',
    email: '',
    address: '',
    location: null,
    verified: true,
    memberSince: '',
    jobsCompleted: 0,
    rating: 4.8,
    reviews: 128
  });

  // UI State
  const [activeTab, setActiveTab] = useState('live');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEarningsModal, setShowEarningsModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    notifications: {
      pushNotifications: true,
      emailNotifications: true,
      smsNotifications: false,
      newJobAlerts: true,
      jobUpdates: true,
      paymentAlerts: true,
      promotionalEmails: false
    },
    privacy: {
      showProfile: true,
      showPhone: false,
      showEmail: false,
      showLocation: true,
      showEarnings: false
    },
    appearance: {
      darkMode: false,
      compactView: false,
      fontSize: 'medium',
      colorScheme: 'blue'
    },
    workPreferences: {
      autoAcceptJobs: false,
      maxJobDistance: 20,
      workingHours: {
        monday: { active: true, start: '09:00', end: '18:00' },
        tuesday: { active: true, start: '09:00', end: '18:00' },
        wednesday: { active: true, start: '09:00', end: '18:00' },
        thursday: { active: true, start: '09:00', end: '18:00' },
        friday: { active: true, start: '09:00', end: '18:00' },
        saturday: { active: false, start: '10:00', end: '16:00' },
        sunday: { active: false, start: '10:00', end: '16:00' }
      },
      serviceRadius: 25,
      instantBooking: false,
      minimumBudget: 500
    },
    payment: {
      bankName: '',
      accountNumber: '',
      accountTitle: '',
      iban: '',
      taxNumber: '',
      paymentMethod: 'bank_transfer',
      autoWithdraw: false,
      withdrawThreshold: 5000
    },
    language: {
      preferred: 'english',
      autoTranslate: false
    }
  });

  // Refs for connection management
  const hasConnected = useRef(false);
  const socketInitialized = useRef(false);
  const hasMounted = useRef(false);
  const reconnectTimeout = useRef(null);
  
  // Track processed job IDs to prevent duplicates
  const processedJobIds = useRef(new Set());

  // Add this function to load messages from server
const loadMessagesFromServer = async () => {
  try {
    if (!providerInfo?.id) return;
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${process.env.REACT_APP_API_URL}/messages/${providerInfo.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('📥 Loaded messages from server');
      setMessages(data.data);
    }
  } catch (error) {
    console.error('Error loading messages:', error);
  }
};

// Add this useEffect


  // ============ LOAD ALL DATA FROM LOCALSTORAGE ============
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
          location: user.location || null,
          verified: true,
          memberSince: user.created_at || new Date().toISOString().split('T')[0],
          jobsCompleted: user.jobsCompleted || 47,
          rating: 4.8,
          reviews: 128
        });
        
        // Load saved settings
        const savedSettings = localStorage.getItem('provider_settings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
        
        // Load saved earnings
        const savedEarnings = localStorage.getItem('provider_earnings');
        if (savedEarnings) {
          setTotalEarnings(parseInt(savedEarnings));
        } else {
          setTotalEarnings(68500);
          localStorage.setItem('provider_earnings', '68500');
        }
        
        // Load accepted jobs (1 month expiry)
        const savedAcceptedJobs = localStorage.getItem('provider_accepted_jobs');
        if (savedAcceptedJobs) {
          const parsed = JSON.parse(savedAcceptedJobs);
          // Filter out jobs older than 30 days
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          const validJobs = parsed.filter(job => 
            new Date(job.acceptedAt) > thirtyDaysAgo
          );
          setAcceptedJobs(validJobs);
          localStorage.setItem('provider_accepted_jobs', JSON.stringify(validJobs));
        }
        
        // Load completed jobs
        const savedCompletedJobs = localStorage.getItem('provider_completed_jobs');
        if (savedCompletedJobs) {
          setCompletedJobs(JSON.parse(savedCompletedJobs));
        }
        
        // Load pending requests
        const savedRequests = localStorage.getItem('provider_pending_requests');
        if (savedRequests) {
          setRealTimeRequests(JSON.parse(savedRequests));
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

  useEffect(() => {
    if (providerInfo?.id) {
      loadMessagesFromServer();
    }
  }, [providerInfo?.id]);

  // ============ SAVE DATA TO LOCALSTORAGE ============
  // Save accepted jobs (with 30-day expiry)
  useEffect(() => {
    if (acceptedJobs.length > 0) {
      localStorage.setItem('provider_accepted_jobs', JSON.stringify(acceptedJobs));
    }
  }, [acceptedJobs]);

  // Add this to your ProviderDashboard.js
useEffect(() => {
  // Load all saved data on mount
  const loadSavedData = () => {
    // Load accepted jobs
    const savedAccepted = localStorage.getItem('provider_accepted_jobs');
    if (savedAccepted) {
      const parsed = JSON.parse(savedAccepted);
      // Filter out jobs older than 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const validJobs = parsed.filter(job => new Date(job.acceptedAt) > thirtyDaysAgo);
      setAcceptedJobs(validJobs);
    }
    
    // Load completed jobs
    const savedCompleted = localStorage.getItem('provider_completed_jobs');
    if (savedCompleted) setCompletedJobs(JSON.parse(savedCompleted));
    
    // Load pending requests (keep for 7 days)
    const savedRequests = localStorage.getItem('provider_pending_requests');
    if (savedRequests) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const validRequests = JSON.parse(savedRequests).filter(
        req => new Date(req.time) > sevenDaysAgo
      );
      setRealTimeRequests(validRequests);
    }
    
    // Load chats
    const savedChats = localStorage.getItem('provider_chats');
    if (savedChats) setChats(JSON.parse(savedChats));
    
    // Load messages for each chat
    const savedMessages = {};
    const chats = JSON.parse(savedChats || '[]');
    chats.forEach(chat => {
      const msgs = localStorage.getItem(`chat_${chat.id}_messages`);
      if (msgs) savedMessages[chat.id] = JSON.parse(msgs);
    });
    if (Object.keys(savedMessages).length > 0) setMessages(savedMessages);
  };
  
  loadSavedData();
}, []);
  // Save completed jobs
  useEffect(() => {
    if (completedJobs.length > 0) {
      localStorage.setItem('provider_completed_jobs', JSON.stringify(completedJobs));
    }
  }, [completedJobs]);

  // Save pending requests
  useEffect(() => {
    if (realTimeRequests.length > 0) {
      localStorage.setItem('provider_pending_requests', JSON.stringify(realTimeRequests));
    }
  }, [realTimeRequests]);

  // ============ LOAD CHATS ============
  useEffect(() => {
    const savedChats = localStorage.getItem('provider_chats');
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

  // ============ SAVE CHATS ============
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('provider_chats', JSON.stringify(chats));
    }
  }, [chats]);




  // ============ CLEAN EXPIRED REQUESTS (30 days) ============
  useEffect(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Clean accepted jobs
    setAcceptedJobs(prev => {
      const valid = prev.filter(job => new Date(job.acceptedAt) > thirtyDaysAgo);
      if (valid.length !== prev.length) {
        localStorage.setItem('provider_accepted_jobs', JSON.stringify(valid));
      }
      return valid;
    });

    // Clean completed jobs (keep for 30 days)
    setCompletedJobs(prev => {
      const valid = prev.filter(job => new Date(job.completedAt) > thirtyDaysAgo);
      if (valid.length !== prev.length) {
        localStorage.setItem('provider_completed_jobs', JSON.stringify(valid));
      }
      return valid;
    });

    // Clean pending requests (keep only those less than 7 days old)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    setRealTimeRequests(prev => {
      const valid = prev.filter(req => new Date(req.time) > sevenDaysAgo);
      if (valid.length !== prev.length) {
        localStorage.setItem('provider_pending_requests', JSON.stringify(valid));
      }
      return valid;
    });
  }, []);

  // ============ SCROLL TO BOTTOM ============
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChat]);

  // ============ TYPING INDICATOR ============
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

  // ============ CALCULATE DISTANCE ============
  useEffect(() => {
    if (!userLocation || !showNearbyOnly) {
      setNearbyRequests(realTimeRequests);
      return;
    }

    console.log('📍 User location:', userLocation);
    console.log('📦 Total requests:', realTimeRequests.length);

    const jobsWithDistance = realTimeRequests
      .map(job => {
        if (job.locationCoords && 
            job.locationCoords.lat && 
            job.locationCoords.lng) {
          
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            job.locationCoords.lat,
            job.locationCoords.lng
          );
          
          return { ...job, distance };
        }
        return { ...job, distance: null };
      })
      .filter(job => {
        if (!job.distance) return false;
        return job.distance <= maxDistance;
      })
      .sort((a, b) => a.distance - b.distance);

    console.log(`✅ Found ${jobsWithDistance.length} jobs within ${maxDistance}km`);
    setNearbyRequests(jobsWithDistance);
    
  }, [realTimeRequests, userLocation, showNearbyOnly, maxDistance]);

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
        console.log('📨 Requesting pending requests...');
        socket.send('get_pending_requests', {
          provider_id: providerInfo.id,
          service: providerInfo.serviceType
        });
      }, 500);
      
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
      
      let requests = [];
      
      if (Array.isArray(data)) {
        requests = data;
      } else if (data?.data && Array.isArray(data.data)) {
        requests = data.data;
      } else if (data?.requests && Array.isArray(data.requests)) {
        requests = data.requests;
      } else {
        console.log('❌ Unknown data structure:', data);
        return;
      }
      
      console.log(`✅ Received ${requests.length} pending requests`);
      
      processedJobIds.current.clear();
      
      requests.forEach(req => {
        if (req.id) {
          processedJobIds.current.add(req.id);
        }
      });
      
      // SAFE STRING EXTRACTION FUNCTION
      const getSafeString = (value, defaultValue = 'Service') => {
        if (!value) return defaultValue;
        if (typeof value === 'string') return value;
        if (typeof value === 'object') {
          // Try to extract name from object
          return value.name || value.service || value.title || defaultValue;
        }
        return String(value);
      };
      
      const formattedRequests = requests.map(req => {
        // Get service string safely
        const serviceValue = req.title || req.serviceType || req.service_type;
        const serviceString = getSafeString(serviceValue, 'Service');
        
        return {
          id: req.id || req._id,
          service: serviceString, // Now guaranteed to be a string
          customer: getSafeString(req.customerName || req.customer, 'Customer'),
          customerId: req.customerId,
          location: req.location || 'Not specified',
          locationCoords: req.locationCoords || null,
          budget: req.budget || 'Negotiable',
          budgetValue: parseInt(req.budget?.replace(/[^0-9]/g, '')) || 0,
          time: req.createdAt ? new Date(req.createdAt).toISOString() : new Date().toISOString(),
          description: req.description || '',
          schedule: req.schedule || 'ASAP',
          contact: req.contact || '',
          service_type: req.serviceType || req.service_type,
          urgent: req.schedule === 'today' || req.schedule === 'ASAP'
        };
      });
      
      console.log(`📊 Setting ${formattedRequests.length} formatted requests to state`);
      console.log('Sample formatted request:', formattedRequests[0]);
      
      setRealTimeRequests(formattedRequests);
      setActiveRequests(formattedRequests.length);
    };
    
    const handleNewRequest = (data) => {
      console.log('🎯 NEW REQUEST received:', data);
      
      const jobData = data.data || data;
      const requestService = jobData.serviceType || jobData.service_type;
      
      if (requestService && requestService !== providerInfo.serviceType) {
        console.log(`⏭️ Skipping ${requestService} request`);
        return;
      }
      
      if (processedJobIds.current.has(jobData.id)) {
        console.log(`⚠️ Job ${jobData.id} already processed, skipping duplicate`);
        return;
      }
      
      processedJobIds.current.add(jobData.id);
      
      // SAFE STRING EXTRACTION FUNCTION
      const getSafeString = (value, defaultValue = 'Service') => {
        if (!value) return defaultValue;
        if (typeof value === 'string') return value;
        if (typeof value === 'object') {
          return value.name || value.service || value.title || defaultValue;
        }
        return String(value);
      };
      
      setRealTimeRequests(prev => {
        const exists = prev.some(job => job.id === jobData.id);
        if (exists) {
          console.log(`⚠️ Job ${jobData.id} already exists in state, skipping`);
          return prev;
        }
        
        const budgetValue = parseInt(jobData.budget?.replace(/[^0-9]/g, '')) || 0;
        
        // Get service string safely
        const serviceValue = jobData.title || jobData.service_type;
        const serviceString = getSafeString(serviceValue, 'Service');
        
        const newRequest = {
          id: jobData.id || `job_${Date.now()}`,
          service: serviceString, // Now guaranteed to be a string
          customer: getSafeString(jobData.customerName || jobData.customer, 'Customer'),
          customerId: jobData.customerId,
          location: jobData.location || 'Not specified',
          locationCoords: jobData.locationCoords || null,
          budget: jobData.budget || 'Negotiable',
          budgetValue: budgetValue,
          time: new Date().toISOString(),
          description: jobData.description || '',
          schedule: jobData.schedule || 'ASAP',
          contact: jobData.contact || jobData.contact_number || '',
          service_type: jobData.serviceType || jobData.service_type,
          urgent: jobData.schedule === 'today' || jobData.schedule === 'ASAP'
        };
    
        console.log('✅ Adding new job to state:', newRequest);
        return [newRequest, ...prev];
      });
      
      setActiveRequests(prev => prev + 1);
      
      // ✅ FIXED: Use serviceString instead of SERVICE_TYPES array
      if (settings.notifications.newJobAlerts) {
        const serviceString = getSafeString(jobData.title || jobData.service_type, 'Service');
        addNotification('info', `New ${serviceString} job available`);
        
        if (Notification.permission === 'granted') {
          new Notification('🎯 New Job Available!', {
            body: `${serviceString} - ${jobData.location || 'Your area'} - ${jobData.budget || 'Negotiable'}`,
            icon: '/logo.png',
            tag: jobData.id
          });
        }
      }
    };
    
    const handleNewMessage = (data) => {
      console.log('💬 New message received in provider dashboard:', data);
      
      const { chatId, message, senderId, senderName } = data;
    
      // First, ensure the chat exists in chats array
      setChats(prevChats => {
        const chatExists = prevChats.some(chat => chat.id === chatId);
        if (!chatExists) {
          // Find the related job/request to create chat
          // First check in acceptedJobs
          let relatedJob = acceptedJobs.find(job => 
            job.customerId === senderId || job.id === chatId.replace('chat_', '')
          );
          
          // If not found in acceptedJobs, check in completedJobs
          if (!relatedJob) {
            relatedJob = completedJobs.find(job => 
              job.customerId === senderId || job.id === chatId.replace('chat_', '')
            );
          }
          
          if (relatedJob) {
            const newChat = {
              id: chatId,
              participant: {
                id: senderId,
                name: senderName
              },
              jobId: relatedJob.id,
              jobTitle: typeof relatedJob.service === 'string' ? relatedJob.service : 'Service',
              createdAt: new Date().toISOString(),
              lastMessage: message.text,
              lastMessageTime: message.timestamp,
              unreadCount: 1
            };
            console.log('🆕 Creating new chat in provider:', newChat);
            return [newChat, ...prevChats];
          } else {
            console.log('❌ No related job found for chat:', chatId);
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
          console.log('⚠️ Message already exists in provider, skipping duplicate');
          return prev;
        }
    
        const newMessage = {
          id: message.id,
          text: message.text,
          senderId,
          senderName,
          timestamp: message.timestamp,
          read: false
        };
    
        console.log('✅ Adding new message to provider state:', newMessage);
    
        return {
          ...prev,
          [chatId]: [...chatMessages, newMessage]
        };
      });
    
      // Update chat list with last message and unread count
      setChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { 
              ...chat, 
              lastMessage: message.text,
              lastMessageTime: message.timestamp,
              unreadCount: senderId !== providerInfo.id 
                ? (chat.unreadCount || 0) + 1 
                : chat.unreadCount
            }
          : chat
      ));
    
      // Update unread count and play sound
      if (senderId !== providerInfo.id) {
        setUnreadCount(prev => prev + 1);
        messageSound.current?.play().catch(e => console.log('Audio play failed:', e));
        
        // Show in-app notification
        addNotification('info', `New message from ${senderName}: ${message.text.substring(0, 50)}${message.text.length > 50 ? '...' : ''}`);
        
        // Show browser notification if enabled
        if (settings.notifications.pushNotifications && Notification.permission === 'granted') {
          new Notification(`💬 Message from ${senderName}`, {
            body: message.text,
            icon: '/logo.png'
          });
        }
      }
    
      // If this is the active chat, mark as read
      if (activeChat?.id === chatId && senderId !== providerInfo.id) {
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
    };

    const handleUserTyping = (data) => {
      const { chatId, userId, isTyping } = data;
      setChats(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, typing: isTyping ? userId : null } : chat
      ));
    };

    const handleUserOnline = (data) => {
      setOnlineUsers(prev => new Set([...prev, data.userId]));
    };

    const handleUserOffline = (data) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
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
        addNotification('error', 'This job was already accepted');
        setRealTimeRequests(prev => 
          prev.filter(req => req.id !== (data.request_id || data.id))
        );
      } else {
        addNotification('error', errorMsg);
      }
    };

    const handleOrderCompleted = (data) => {
      console.log('✅ Order completed:', data);
      const completedJob = acceptedJobs.find(job => job.id === data.request_id);
      if (completedJob) {
        setAcceptedJobs(prev => prev.filter(job => job.id !== data.request_id));
        setCompletedJobs(prev => [{ 
          ...completedJob, 
          completedAt: new Date().toISOString() 
        }, ...prev]);
      }
      addNotification('success', 'Job marked as completed! Payment will be processed.');
    };

    const handlePaymentConfirmed = (data) => {
      console.log('💰 Payment confirmed:', data);
      setTotalEarnings(prev => {
        const newTotal = prev + (data.amount || 0);
        localStorage.setItem('provider_earnings', newTotal.toString());
        return newTotal;
      });
      addNotification('success', `Payment of Rs. ${data.amount} received!`);
    };

    // Remove old listeners
    socket.off('connected', handleConnected);
    socket.off('disconnected', handleDisconnected);
    socket.off('pending_requests', handlePendingRequests);
    socket.off('new_request', handleNewRequest);
    socket.off('chat_message', handleNewMessage);
    socket.off('messages_read', handleMessageRead);
    socket.off('user_typing', handleUserTyping);
    socket.off('user_online', handleUserOnline);
    socket.off('user_offline', handleUserOffline);
    socket.off('request_taken', handleRequestTaken);
    socket.off('accept_error', handleAcceptError);
    socket.off('order_completed', handleOrderCompleted);
    socket.off('payment_confirmed', handlePaymentConfirmed);

    // Register listeners
    socket.on('connected', handleConnected);
    socket.on('disconnected', handleDisconnected);
    socket.on('pending_requests', handlePendingRequests);
    socket.on('new_request', handleNewRequest);
    socket.on('chat_message', handleNewMessage);
    socket.on('messages_read', handleMessageRead);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);
    socket.on('request_taken', handleRequestTaken);
    socket.on('accept_error', handleAcceptError);
    socket.on('order_completed', handleOrderCompleted);
    socket.on('payment_confirmed', handlePaymentConfirmed);

    if (socket.isConnected()) {
      console.log('✅ Socket already connected');
      setConnected(true);
      setConnectionStatus('LIVE');
      setTimeout(() => {
        socket.send('get_pending_requests', {
          provider_id: providerInfo.id,
          service: providerInfo.serviceType
        });
      }, 500);
    }

    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      console.log('📊 ProviderDashboard UNMOUNTED');
      socket.off('connected', handleConnected);
      socket.off('disconnected', handleDisconnected);
      socket.off('pending_requests', handlePendingRequests);
      socket.off('new_request', handleNewRequest);
      socket.off('chat_message', handleNewMessage);
      socket.off('messages_read', handleMessageRead);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
      socket.off('request_taken', handleRequestTaken);
      socket.off('accept_error', handleAcceptError);
      socket.off('order_completed', handleOrderCompleted);
      socket.off('payment_confirmed', handlePaymentConfirmed);
      processedJobIds.current.clear();
    };
  }, [providerInfo.id, providerInfo.name, providerInfo.serviceType, acceptedJobs, settings.notifications]);

  // ============ HELPER FUNCTIONS ============
  const addNotification = (type, message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message, timestamp: new Date() }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const reconnectWebSocket = () => {
    console.log('🔌 Manual reconnect triggered');
    setConnectionStatus('Reconnecting...');
    
    const token = localStorage.getItem('token');
    socket.updateAuth({
      id: providerInfo.id,
      name: providerInfo.name,
      user_type: 'provider',
      token: token,
      service: providerInfo.serviceType,
      location: userLocation
    });
    
    setTimeout(() => {
      socket.connect();
    }, 500);
  };

  const createChat = (participant, jobDetails) => {
    const chatId = `chat_${jobDetails.id}`;
    const newChat = {
      id: chatId,
      participant: {
        id: participant.id,
        name: participant.name
      },
      jobId: jobDetails.id,
      jobTitle: typeof jobDetails.service === 'string' ? jobDetails.service : 'Service',
      createdAt: new Date().toISOString(),
      lastMessage: null,
      lastMessageTime: null,
      unreadCount: 0
    };
    
    setChats(prev => {
      const exists = prev.some(chat => chat.id === chatId);
      if (exists) {
        console.log('⚠️ Chat already exists in provider, skipping creation');
        return prev;
      }
      console.log('🆕 Creating new chat in provider:', newChat);
      return [newChat, ...prev];
    });
    
    return chatId;
  };

  const sendMessage = () => {
    if (!messageText.trim() || !activeChat) return;

    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      text: messageText.trim(),
      senderId: providerInfo.id,
      senderName: providerInfo.name,
      timestamp: new Date().toISOString(),
      read: false
    };

    setMessages(prev => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), message]
    }));

    setChats(prev => prev.map(c => 
      c.id === activeChat.id 
        ? { ...c, lastMessage: message.text, lastMessageTime: message.timestamp }
        : c
    ));

    socket.send('chat_message', {
      chatId: activeChat.id,
      message,
      receiverId: activeChat.participant.id,
      jobId: activeChat.jobId
    });

    setMessageText('');
    setIsTyping(false);
  };

  const markAsRead = (chatId) => {
    socket.send('messages_read', {
      chatId,
      userId: providerInfo.id
    });

    setMessages(prev => ({
      ...prev,
      [chatId]: prev[chatId]?.map(msg => ({ ...msg, read: true })) || []
    }));

    setChats(prev => prev.map(c => 
      c.id === chatId ? { ...c, unreadCount: 0 } : c
    ));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeChat) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('chatId', activeChat.id);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/chat/upload`, {
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

  const acceptJob = (jobId, jobData) => {
    if (!connected || !socket.isConnected()) {
      addNotification('error', '⚠️ Please wait for connection to establish');
      reconnectWebSocket();
      return;
    }

    setRealTimeRequests(prev => prev.filter(req => req.id !== jobId));
    
    const acceptedJob = {
      ...jobData,
      acceptedAt: new Date().toISOString(),
      status: 'accepted',
      estimatedCompletion: new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleTimeString()
    };
    
    setAcceptedJobs(prev => [acceptedJob, ...prev]);
    setActiveRequests(prev => Math.max(0, prev - 1));
    
    socket.send('accept_request', {
      request_id: jobId,
      provider_id: providerInfo.id,
      provider_name: providerInfo.name,
      provider_service: providerInfo.serviceType
    });

    createChat(
      { id: jobData.customerId, name: jobData.customer },
      { id: jobId, service: jobData.service }
    );

    addNotification('success', `✅ Job accepted! Working with ${jobData.customer}`);
  };

  const completeJob = (jobId) => {
    const job = acceptedJobs.find(j => j.id === jobId);
    if (!job) return;
    
    setAcceptedJobs(prev => prev.filter(j => j.id !== jobId));
    setCompletedJobs(prev => [{ ...job, completedAt: new Date().toISOString() }, ...prev]);
    
    socket.send('complete_request', {
      request_id: jobId,
      provider_id: providerInfo.id
    });
    
    addNotification('success', '✅ Job marked as completed!');
  };

  const refreshRequests = () => {
    if (socket.isConnected()) {
      console.log('🔄 Manually refreshing requests...');
      socket.send('get_pending_requests', {
        provider_id: providerInfo.id,
        service: providerInfo.serviceType
      });
      addNotification('info', 'Refreshing job feed...');
    } else {
      reconnectWebSocket();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('provider_service');
    socket.disconnect();
    navigate('/provider-portal');
  };

  const handleSelectProvider = (provider) => {
    console.log('Selected provider:', provider);
    addNotification('info', `Viewing ${provider.name}'s profile`);
  };

  const saveSettings = () => {
    localStorage.setItem('provider_settings', JSON.stringify(settings));
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
    addNotification('success', 'Settings saved successfully!');
  };

  const updateSettings = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const updateWorkingHours = (day, field, value) => {
    setSettings(prev => ({
      ...prev,
      workPreferences: {
        ...prev.workPreferences,
        workingHours: {
          ...prev.workPreferences.workingHours,
          [day]: {
            ...prev.workPreferences.workingHours[day],
            [field]: value
          }
        }
      }
    }));
  };

  const requestsToShow = showNearbyOnly ? nearbyRequests : realTimeRequests;

  const formatCurrency = (amount) => {
    return `Rs. ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-PK', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString();
  };

  // ============ RENDER ============
  return (
    <div style={{
      ...styles.container,
      backgroundColor: settings.appearance.darkMode ? '#1a1a1a' : '#f8fafc',
      color: settings.appearance.darkMode ? '#fff' : 'inherit'
    }}>
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
          width: sidebarCollapsed ? '80px' : '280px',
          backgroundColor: settings.appearance.darkMode ? '#2d2d2d' : 'white'
        }}>
          <div style={styles.sidebarHeader}>
            <div style={styles.logo}>
              {!sidebarCollapsed ? 'DASTAK' : 'DP'}
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
              style={{
                ...styles.navItem,
                backgroundColor: activeTab === 'earnings' ? '#3b82f610' : 'transparent',
                color: activeTab === 'earnings' ? '#3b82f6' : '#64748b'
              }}
              onClick={() => setActiveTab('earnings')}
            >
              <FaWallet style={styles.navIcon} />
              {!sidebarCollapsed && <span>Earnings</span>}
            </button>

            <button 
              style={{
                ...styles.navItem,
                backgroundColor: activeTab === 'chats' ? '#3b82f610' : 'transparent',
                color: activeTab === 'chats' ? '#3b82f6' : '#64748b'
              }}
              onClick={() => setActiveTab('chats')}
            >
              <FaComment style={styles.navIcon} />
              {!sidebarCollapsed && <span>Messages</span>}
              {unreadCount > 0 && !sidebarCollapsed && (
                <span style={styles.navBadge}>{unreadCount}</span>
              )}
            </button>

            <button 
              style={{
                ...styles.navItem,
                backgroundColor: activeTab === 'settings' ? '#3b82f610' : 'transparent',
                color: activeTab === 'settings' ? '#3b82f6' : '#64748b'
              }}
              onClick={() => setActiveTab('settings')}
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
                {userAddress && (
                  <span style={styles.locationBadge}>
                    <FaMapMarkerAlt /> {userAddress.split(',')[0]}
                  </span>
                )}
              </p>
            </div>
            
            <div style={styles.headerRight}>
              {/* Location Button */}
              <button 
                style={styles.locationButton}
                onClick={detectLocation}
                disabled={locationLoading}
              >
                <FaCrosshairs /> 
                {locationLoading ? 'Detecting...' : 'Detect Location'}
              </button>
              
              {/* Notification Bell */}
              <div style={styles.notificationBell}>
                <FaBell />
                {notifications.length > 0 && (
                  <span style={styles.notificationDot} />
                )}
              </div>
              
              {/* Chat Button */}
              <button 
                onClick={() => setActiveTab('chats')}
                style={{
                  ...styles.chatHeaderButton,
                  position: 'relative'
                }}
              >
                <FaComment />
                {unreadCount > 0 && (
                  <span style={styles.chatHeaderBadge}>{unreadCount}</span>
                )}
              </button>
              
              {/* Connection Status Badge */}
              <div style={{
                ...styles.connectionBadge,
                backgroundColor: connected ? '#10b981' : '#ef4444'
              }}>
                <div style={styles.connectionDot} />
                {connected ? 'LIVE' : connectionStatus}
              </div>
            </div>
          </div>

          {/* ============ LOCATION CONTROLS ============ */}
          {userLocation && (
            <div style={styles.locationControls}>
              <div style={styles.locationInfo}>
                <FaMapMarkerAlt style={{ color: '#3498db' }} />
                <span style={styles.locationText}>
                  {userAddress || `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`}
                </span>
              </div>
              
              <div style={styles.filterControls}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={showNearbyOnly}
                    onChange={(e) => setShowNearbyOnly(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <span>Show jobs within</span>
                </label>
                
                <select 
                  value={maxDistance} 
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  style={styles.distanceSelect}
                  disabled={!showNearbyOnly}
                >
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                  <option value="15">15 km</option>
                  <option value="20">20 km</option>
                  <option value="30">30 km</option>
                  <option value="50">50 km</option>
                </select>
                
                <button 
                  style={{
                    ...styles.mapToggleBtn,
                    backgroundColor: showMap ? '#3498db' : 'white',
                    color: showMap ? 'white' : '#64748b',
                    borderColor: showMap ? '#3498db' : '#e2e8f0'
                  }}
                  onClick={() => setShowMap(!showMap)}
                >
                  <FaMap /> {showMap ? 'Hide Map' : 'Show Map'}
                </button>
              </div>
            </div>
          )}

          {/* ============ MAP VIEW ============ */}
          {showMap && userLocation && (
            <div style={styles.mapContainer}>
              <LeafletMap 
                providers={nearbyProviders}
                onProviderSelect={handleSelectProvider}
                initialLocation={userLocation}
                showUserLocation={true}
                height="450px"
              />
            </div>
          )}

          {/* ============ STATS CARDS ============ */}
          {activeTab !== 'settings' && activeTab !== 'earnings' && activeTab !== 'chats' && (
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
          )}

          {/* ============ TAB CONTENT ============ */}
          
          {/* TAB 1: LIVE JOBS */}
          {activeTab === 'live' && (
            <div style={styles.tabContent}>
              <div style={styles.tabHeader}>
                <h2 style={styles.tabTitle}>
                  <FaBell style={{ marginRight: '10px', color: '#3b82f6' }} />
                  {showNearbyOnly ? 'Nearby Jobs' : 'Live Job Requests'}
                  {requestsToShow.length > 0 && (
                    <span style={styles.liveBadge}>
                      {requestsToShow.length} NEW
                    </span>
                  )}
                </h2>
                <button 
                  onClick={refreshRequests}
                  style={styles.refreshButton}
                  disabled={!connected}
                >
                  <FaSpinner className={!connected ? 'spin' : ''} />
                  Refresh
                </button>
              </div>

              {requestsToShow.length === 0 ? (
                <div style={styles.emptyState}>
                  <FaExclamationCircle style={styles.emptyIcon} />
                  <h3>No jobs available</h3>
                  <p>
                    {!connected 
                      ? 'Connecting to server...'
                      : showNearbyOnly 
                        ? `No jobs found within ${maxDistance}km of your location`
                        : 'New requests will appear here in real-time'}
                  </p>
                  {!connected && (
                    <button 
                      onClick={reconnectWebSocket}
                      style={styles.connectButton}
                    >
                      Connect to Live Feed
                    </button>
                  )}
                  {showNearbyOnly && connected && (
                    <button 
                      onClick={() => setShowNearbyOnly(false)}
                      style={styles.viewAllButton}
                    >
                      View All Jobs
                    </button>
                  )}
                </div>
              ) : (
                <div style={styles.jobsGrid}>
                  {requestsToShow.map((job) => (
                    <div key={job.id} style={{
                      ...styles.jobCard,
                      borderLeft: job.urgent ? '5px solid #ef4444' : '5px solid #3b82f6'
                    }}>
                      <div style={styles.jobHeader}>
                        <div>
                          <h3 style={styles.jobTitle}>
                            {typeof job.service === 'string' ? job.service : 'Service'}
                          </h3>
                          <div style={styles.jobMeta}>
                            <span style={styles.jobCustomer}>
                              <FaUser /> {typeof job.customer === 'string' ? job.customer : 'Customer'}
                            </span>
                            {job.distance && (
                              <span style={styles.jobDistance}>
                                <FaMapMarkerAlt /> {job.distance.toFixed(1)} km
                              </span>
                            )}
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
                          <span>{formatTime(job.time)}</span>
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
                          disabled={!connected}
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
                          <h3 style={styles.jobTitle}>
                            {typeof job.service === 'string' ? job.service : 'Service'}
                          </h3>
                          <p style={styles.jobCustomerName}>
                            {typeof job.customer === 'string' ? job.customer : 'Customer'}
                          </p>
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
                          onClick={() => {
                            const chat = chats.find(c => c.jobId === job.id);
                            if (chat) {
                              setActiveChat(chat);
                              setActiveTab('chats');
                              markAsRead(chat.id);
                            }
                          }}
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
                          <h3 style={styles.jobTitle}>
                            {typeof job.service === 'string' ? job.service : 'Service'}
                          </h3>
                          <p style={styles.jobCustomerName}>
                            {typeof job.customer === 'string' ? job.customer : 'Customer'}
                          </p>
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

          {/* TAB 4: EARNINGS */}
          {activeTab === 'earnings' && (
            <div style={styles.tabContent}>
              <div style={styles.tabHeader}>
                <h2 style={styles.tabTitle}>
                  <FaWallet style={{ marginRight: '10px', color: '#10b981' }} />
                  Earnings Overview
                </h2>
              </div>

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
                  {completedJobs.slice(0, 5).map((job, index) => (
                    <div key={index} style={styles.transactionItem}>
                      <div>
                        <p style={styles.transactionTitle}>
                          {typeof job.service === 'string' ? job.service : 'Service'} - {typeof job.customer === 'string' ? job.customer : 'Customer'}
                        </p>
                        <p style={styles.transactionDate}>{formatDate(job.completedAt)}</p>
                      </div>
                      <span style={styles.transactionAmount}>{job.budget}</span>
                    </div>
                  ))}
                  {completedJobs.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
                      No transactions yet
                    </p>
                  )}
                </div>
              </div>

              <button style={styles.withdrawButton}>
                <FaCreditCard /> Withdraw Earnings
              </button>
            </div>
          )}

          {/* TAB 5: CHATS */}
          {activeTab === 'chats' && (
            <div style={styles.tabContent}>
              <div style={styles.tabHeader}>
                <h2 style={styles.tabTitle}>
                  <FaComment style={{ marginRight: '10px', color: '#3b82f6' }} />
                  Messages
                </h2>
              </div>
              
              <div style={styles.chatsLayout}>
                {/* Chats List */}
                <div style={styles.chatsList}>
                  {chats.length === 0 ? (
                    <div style={styles.noChats}>
                      <FaComment size={32} color="#cbd5e1" />
                      <p>No conversations yet</p>
                      <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                        When you accept a job, a chat will appear here
                      </p>
                    </div>
                  ) : (
                    chats.map(chat => {
                      const isOnline = onlineUsers.has(chat.participant.id);
                      const chatMessages = messages[chat.id] || [];
                      const lastMessage = chatMessages[chatMessages.length - 1];
                      
                      return (
                        <div
                          key={chat.id}
                          onClick={() => {
                            setActiveChat(chat);
                            markAsRead(chat.id);
                          }}
                          style={{
                            ...styles.chatListItem,
                            backgroundColor: activeChat?.id === chat.id ? '#f0f9ff' : 'white',
                            borderLeft: activeChat?.id === chat.id ? '4px solid #3b82f6' : '4px solid transparent'
                          }}
                        >
                          <div style={styles.chatListAvatar}>
                            {chat.participant.name.charAt(0)}
                            <span style={{
                              ...styles.chatListOnlineDot,
                              backgroundColor: isOnline ? '#10b981' : '#94a3b8'
                            }} />
                          </div>
                          <div style={styles.chatListInfo}>
                            <div style={styles.chatListHeader}>
                              <h4>{chat.participant.name}</h4>
                              <span style={styles.chatListTime}>
                                {chat.lastMessageTime ? formatMessageTime(chat.lastMessageTime) : ''}
                              </span>
                            </div>
                            <p style={styles.chatListJob}>
                              {typeof chat.jobTitle === 'string' ? chat.jobTitle : 'Service'}
                            </p>
                            {lastMessage && (
                              <p style={styles.chatListMessage}>
                                {lastMessage.senderId === providerInfo.id ? 'You: ' : ''}
                                {lastMessage.text.length > 30 
                                  ? lastMessage.text.substring(0, 30) + '...' 
                                  : lastMessage.text}
                              </p>
                            )}
                          </div>
                          {chat.unreadCount > 0 && (
                            <span style={styles.chatListBadge}>{chat.unreadCount}</span>
                          )}
                          {chat.typing === chat.participant.id && (
                            <span style={styles.typingDot}>...</span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Chat Window */}
                <div style={styles.chatWindow}>
                  {!activeChat ? (
                    <div style={styles.emptyChat}>
                      <FaComment size={48} color="#cbd5e1" />
                      <h3>No chat selected</h3>
                      <p>Select a conversation to start messaging</p>
                    </div>
                  ) : (
                    <div style={styles.chatContainer}>
                      {/* Chat Header */}
                      <div style={styles.chatHeader}>
                        <div style={styles.chatUserInfo}>
                          <div style={styles.chatAvatar}>
                            {activeChat.participant.name.charAt(0)}
                            <span style={{
                              ...styles.onlineDot,
                              backgroundColor: onlineUsers.has(activeChat.participant.id) ? '#10b981' : '#94a3b8'
                            }} />
                          </div>
                          <div>
                            <h3 style={styles.chatUserName}>{activeChat.participant.name}</h3>
                            <p style={styles.chatUserStatus}>
                              {onlineUsers.has(activeChat.participant.id) ? 'Online' : 'Offline'} • {activeChat.jobTitle}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Messages Area */}
                      <div style={styles.messagesContainer}>
                        {(messages[activeChat.id] || []).map((msg, index) => {
                          const isCurrentUser = msg.senderId === providerInfo.id;
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
                                justifyContent: isCurrentUser ? 'flex-end' : 'flex-start'
                              }}>
                                <div style={{
                                  ...styles.messageBubble,
                                  backgroundColor: isCurrentUser ? '#3b82f6' : '#f1f5f9',
                                  color: isCurrentUser ? 'white' : '#0f172a'
                                }}>
                                  <p style={styles.messageText}>{msg.text}</p>
                                  <div style={styles.messageFooter}>
                                    <span style={styles.messageTime}>
                                      {formatMessageTime(msg.timestamp)}
                                    </span>
                                    {isCurrentUser && (
                                      <span style={styles.messageStatus}>
                                        {msg.read ? <FaCheckDouble color="#94a3b8" /> : <FaCheck color="#94a3b8" />}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Typing Indicator */}
                      {activeChat.typing === activeChat.participant.id && (
                        <div style={styles.typingIndicator}>
                          <span>{activeChat.participant.name} is typing</span>
                          <span style={styles.typingDots}>
                            <span>.</span><span>.</span><span>.</span>
                          </span>
                        </div>
                      )}

                      {/* Message Input */}
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          sendMessage();
                        }} 
                        style={styles.messageInputContainer}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          style={{ display: 'none' }}
                          onChange={handleFileUpload}
                        />
                        
                        <div style={styles.attachmentsContainer}>
                          <button 
                            type="button"
                            onClick={() => setShowAttachments(!showAttachments)}
                            style={styles.attachButton}
                          >
                            <FaPaperclip />
                          </button>
                          {showAttachments && (
                            <div style={styles.attachmentsMenu}>
                              <button onClick={() => fileInputRef.current.click()}>
                                <FaImage /> Image
                              </button>
                              <button onClick={() => fileInputRef.current.click()}>
                                <FaFile /> File
                              </button>
                            </div>
                          )}
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
                          placeholder="Type a message..."
                          style={styles.messageInput}
                        />

                        <button 
                          type="submit" 
                          style={{
                            ...styles.sendButton,
                            backgroundColor: messageText.trim() ? '#3b82f6' : '#e2e8f0',
                            cursor: messageText.trim() ? 'pointer' : 'not-allowed'
                          }}
                          disabled={!messageText.trim()}
                        >
                          <FaPaperPlane />
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS */}
          {activeTab === 'settings' && (
            <div style={styles.tabContent}>
              <div style={styles.tabHeader}>
                <h2 style={styles.tabTitle}>
                  <FaCog style={{ marginRight: '10px', color: '#8b5cf6' }} />
                  Settings
                </h2>
                <button 
                  onClick={saveSettings}
                  style={{
                    ...styles.saveButton,
                    backgroundColor: settingsSaved ? '#10b981' : '#3b82f6'
                  }}
                >
                  <FaSave /> {settingsSaved ? 'Saved!' : 'Save Settings'}
                </button>
              </div>

              <div style={styles.settingsContainer}>
                {/* NOTIFICATION SETTINGS */}
                <div style={styles.settingsSection}>
                  <h3 style={styles.settingsTitle}>
                    <FaBell /> Notification Settings
                  </h3>
                  <div style={styles.settingsGrid}>
                    <div style={styles.settingItem}>
                      <label>Push Notifications</label>
                      <button 
                        onClick={() => updateSettings('notifications', 'pushNotifications', !settings.notifications.pushNotifications)}
                        style={styles.toggleButton}
                      >
                        {settings.notifications.pushNotifications ? <FaToggleOn color="#10b981" size={24} /> : <FaToggleOff color="#94a3b8" size={24} />}
                      </button>
                    </div>
                    <div style={styles.settingItem}>
                      <label>Email Notifications</label>
                      <button 
                        onClick={() => updateSettings('notifications', 'emailNotifications', !settings.notifications.emailNotifications)}
                        style={styles.toggleButton}
                      >
                        {settings.notifications.emailNotifications ? <FaToggleOn color="#10b981" size={24} /> : <FaToggleOff color="#94a3b8" size={24} />}
                      </button>
                    </div>
                    <div style={styles.settingItem}>
                      <label>SMS Notifications</label>
                      <button 
                        onClick={() => updateSettings('notifications', 'smsNotifications', !settings.notifications.smsNotifications)}
                        style={styles.toggleButton}
                      >
                        {settings.notifications.smsNotifications ? <FaToggleOn color="#10b981" size={24} /> : <FaToggleOff color="#94a3b8" size={24} />}
                      </button>
                    </div>
                    <div style={styles.settingItem}>
                      <label>New Job Alerts</label>
                      <button 
                        onClick={() => updateSettings('notifications', 'newJobAlerts', !settings.notifications.newJobAlerts)}
                        style={styles.toggleButton}
                      >
                        {settings.notifications.newJobAlerts ? <FaToggleOn color="#10b981" size={24} /> : <FaToggleOff color="#94a3b8" size={24} />}
                      </button>
                    </div>
                    <div style={styles.settingItem}>
                      <label>Job Updates</label>
                      <button 
                        onClick={() => updateSettings('notifications', 'jobUpdates', !settings.notifications.jobUpdates)}
                        style={styles.toggleButton}
                      >
                        {settings.notifications.jobUpdates ? <FaToggleOn color="#10b981" size={24} /> : <FaToggleOff color="#94a3b8" size={24} />}
                      </button>
                    </div>
                    <div style={styles.settingItem}>
                      <label>Payment Alerts</label>
                      <button 
                        onClick={() => updateSettings('notifications', 'paymentAlerts', !settings.notifications.paymentAlerts)}
                        style={styles.toggleButton}
                      >
                        {settings.notifications.paymentAlerts ? <FaToggleOn color="#10b981" size={24} /> : <FaToggleOff color="#94a3b8" size={24} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* PRIVACY SETTINGS */}
                <div style={styles.settingsSection}>
                  <h3 style={styles.settingsTitle}>
                    <FaShieldAlt /> Privacy Settings
                  </h3>
                  <div style={styles.settingsGrid}>
                    <div style={styles.settingItem}>
                      <label>Show Profile to Customers</label>
                      <button 
                        onClick={() => updateSettings('privacy', 'showProfile', !settings.privacy.showProfile)}
                        style={styles.toggleButton}
                      >
                        {settings.privacy.showProfile ? <FaToggleOn color="#10b981" size={24} /> : <FaToggleOff color="#94a3b8" size={24} />}
                      </button>
                    </div>
                    <div style={styles.settingItem}>
                      <label>Show Phone Number</label>
                      <button 
                        onClick={() => updateSettings('privacy', 'showPhone', !settings.privacy.showPhone)}
                        style={styles.toggleButton}
                      >
                        {settings.privacy.showPhone ? <FaToggleOn color="#10b981" size={24} /> : <FaToggleOff color="#94a3b8" size={24} />}
                      </button>
                    </div>
                    <div style={styles.settingItem}>
                      <label>Show Email</label>
                      <button 
                        onClick={() => updateSettings('privacy', 'showEmail', !settings.privacy.showEmail)}
                        style={styles.toggleButton}
                      >
                        {settings.privacy.showEmail ? <FaToggleOn color="#10b981" size={24} /> : <FaToggleOff color="#94a3b8" size={24} />}
                      </button>
                    </div>
                    <div style={styles.settingItem}>
                      <label>Show Location</label>
                      <button 
                        onClick={() => updateSettings('privacy', 'showLocation', !settings.privacy.showLocation)}
                        style={styles.toggleButton}
                      >
                        {settings.privacy.showLocation ? <FaToggleOn color="#10b981" size={24} /> : <FaToggleOff color="#94a3b8" size={24} />}
                      </button>
                    </div>
                    <div style={styles.settingItem}>
                      <label>Show Earnings</label>
                      <button 
                        onClick={() => updateSettings('privacy', 'showEarnings', !settings.privacy.showEarnings)}
                        style={styles.toggleButton}
                      >
                        {settings.privacy.showEarnings ? <FaToggleOn color="#10b981" size={24} /> : <FaToggleOff color="#94a3b8" size={24} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* APPEARANCE SETTINGS */}
                <div style={styles.settingsSection}>
                  <h3 style={styles.settingsTitle}>
                    <FaPalette /> Appearance
                  </h3>
                  <div style={styles.settingsGrid}>
                    <div style={styles.settingItem}>
                      <label>Dark Mode</label>
                      <button 
                        onClick={() => updateSettings('appearance', 'darkMode', !settings.appearance.darkMode)}
                        style={styles.toggleButton}
                      >
                        {settings.appearance.darkMode ? <FaMoon color="#8b5cf6" size={20} /> : <FaSun color="#f59e0b" size={20} />}
                      </button>
                    </div>
                    <div style={styles.settingItem}>
                      <label>Compact View</label>
                      <button 
                        onClick={() => updateSettings('appearance', 'compactView', !settings.appearance.compactView)}
                        style={styles.toggleButton}
                      >
                        {settings.appearance.compactView ? <FaToggleOn color="#10b981" size={24} /> : <FaToggleOff color="#94a3b8" size={24} />}
                      </button>
                    </div>
                    <div style={styles.settingItem}>
                      <label>Font Size</label>
                      <select 
                        value={settings.appearance.fontSize}
                        onChange={(e) => updateSettings('appearance', 'fontSize', e.target.value)}
                        style={styles.select}
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                    <div style={styles.settingItem}>
                      <label>Color Scheme</label>
                      <select 
                        value={settings.appearance.colorScheme}
                        onChange={(e) => updateSettings('appearance', 'colorScheme', e.target.value)}
                        style={styles.select}
                      >
                        <option value="blue">Blue</option>
                        <option value="green">Green</option>
                        <option value="purple">Purple</option>
                        <option value="orange">Orange</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* WORK PREFERENCES */}
                <div style={styles.settingsSection}>
                  <h3 style={styles.settingsTitle}>
                    <FaBriefcase /> Work Preferences
                  </h3>
                  <div style={styles.settingsGrid}>
                    <div style={styles.settingItem}>
                      <label>Auto-accept Jobs</label>
                      <button 
                        onClick={() => updateSettings('workPreferences', 'autoAcceptJobs', !settings.workPreferences.autoAcceptJobs)}
                        style={styles.toggleButton}
                      >
                        {settings.workPreferences.autoAcceptJobs ? <FaToggleOn color="#10b981" size={24} /> : <FaToggleOff color="#94a3b8" size={24} />}
                      </button>
                    </div>
                    <div style={styles.settingItem}>
                      <label>Max Job Distance (km)</label>
                      <input 
                        type="number"
                        value={settings.workPreferences.maxJobDistance}
                        onChange={(e) => updateSettings('workPreferences', 'maxJobDistance', parseInt(e.target.value))}
                        style={styles.input}
                        min="1"
                        max="100"
                      />
                    </div>
                    <div style={styles.settingItem}>
                      <label>Service Radius (km)</label>
                      <input 
                        type="number"
                        value={settings.workPreferences.serviceRadius}
                        onChange={(e) => updateSettings('workPreferences', 'serviceRadius', parseInt(e.target.value))}
                        style={styles.input}
                        min="1"
                        max="100"
                      />
                    </div>
                    <div style={styles.settingItem}>
                      <label>Minimum Budget (Rs.)</label>
                      <input 
                        type="number"
                        value={settings.workPreferences.minimumBudget}
                        onChange={(e) => updateSettings('workPreferences', 'minimumBudget', parseInt(e.target.value))}
                        style={styles.input}
                        min="0"
                        step="100"
                      />
                    </div>
                    <div style={styles.settingItem}>
                      <label>Instant Booking</label>
                      <button 
                        onClick={() => updateSettings('workPreferences', 'instantBooking', !settings.workPreferences.instantBooking)}
                        style={styles.toggleButton}
                      >
                        {settings.workPreferences.instantBooking ? <FaToggleOn color="#10b981" size={24} /> : <FaToggleOff color="#94a3b8" size={24} />}
                      </button>
                    </div>
                  </div>

                  <h4 style={styles.subTitle}>Working Hours</h4>
                  {Object.entries(settings.workPreferences.workingHours).map(([day, hours]) => (
                    <div key={day} style={styles.workingHoursRow}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '150px' }}>
                        <button 
                          onClick={() => updateWorkingHours(day, 'active', !hours.active)}
                          style={styles.toggleButton}
                        >
                          {hours.active ? <FaToggleOn color="#10b981" size={20} /> : <FaToggleOff color="#94a3b8" size={20} />}
                        </button>
                        <span style={{ textTransform: 'capitalize' }}>{day}</span>
                      </div>
                      <input 
                        type="time"
                        value={hours.start}
                        onChange={(e) => updateWorkingHours(day, 'start', e.target.value)}
                        disabled={!hours.active}
                        style={styles.timeInput}
                      />
                      <span>to</span>
                      <input 
                        type="time"
                        value={hours.end}
                        onChange={(e) => updateWorkingHours(day, 'end', e.target.value)}
                        disabled={!hours.active}
                        style={styles.timeInput}
                      />
                    </div>
                  ))}
                </div>

                {/* PAYMENT SETTINGS */}
                <div style={styles.settingsSection}>
                  <h3 style={styles.settingsTitle}>
                    <FaCreditCard /> Payment Settings
                  </h3>
                  <div style={styles.settingsGrid}>
                    <div style={styles.settingItemFull}>
                      <label>Bank Name</label>
                      <input 
                        type="text"
                        value={settings.payment.bankName}
                        onChange={(e) => updateSettings('payment', 'bankName', e.target.value)}
                        style={styles.input}
                        placeholder="Enter bank name"
                      />
                    </div>
                    <div style={styles.settingItemFull}>
                      <label>Account Title</label>
                      <input 
                        type="text"
                        value={settings.payment.accountTitle}
                        onChange={(e) => updateSettings('payment', 'accountTitle', e.target.value)}
                        style={styles.input}
                        placeholder="Enter account title"
                      />
                    </div>
                    <div style={styles.settingItemFull}>
                      <label>Account Number</label>
                      <input 
                        type="text"
                        value={settings.payment.accountNumber}
                        onChange={(e) => updateSettings('payment', 'accountNumber', e.target.value)}
                        style={styles.input}
                        placeholder="Enter account number"
                      />
                    </div>
                    <div style={styles.settingItemFull}>
                      <label>IBAN</label>
                      <input 
                        type="text"
                        value={settings.payment.iban}
                        onChange={(e) => updateSettings('payment', 'iban', e.target.value)}
                        style={styles.input}
                        placeholder="Enter IBAN"
                      />
                    </div>
                    <div style={styles.settingItem}>
                      <label>Auto Withdraw</label>
                      <button 
                        onClick={() => updateSettings('payment', 'autoWithdraw', !settings.payment.autoWithdraw)}
                        style={styles.toggleButton}
                      >
                        {settings.payment.autoWithdraw ? <FaToggleOn color="#10b981" size={24} /> : <FaToggleOff color="#94a3b8" size={24} />}
                      </button>
                    </div>
                    {settings.payment.autoWithdraw && (
                      <div style={styles.settingItem}>
                        <label>Withdraw Threshold (Rs.)</label>
                        <input 
                          type="number"
                          value={settings.payment.withdrawThreshold}
                          onChange={(e) => updateSettings('payment', 'withdrawThreshold', parseInt(e.target.value))}
                          style={styles.input}
                          min="1000"
                          step="1000"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* LANGUAGE SETTINGS */}
                <div style={styles.settingsSection}>
                  <h3 style={styles.settingsTitle}>
                    <FaLanguage /> Language
                  </h3>
                  <div style={styles.settingsGrid}>
                    <div style={styles.settingItem}>
                      <label>Preferred Language</label>
                      <select 
                        value={settings.language.preferred}
                        onChange={(e) => updateSettings('language', 'preferred', e.target.value)}
                        style={styles.select}
                      >
                        <option value="english">English</option>
                        <option value="urdu">Urdu</option>
                        <option value="punjabi">Punjabi</option>
                        <option value="pashto">Pashto</option>
                        <option value="sindhi">Sindhi</option>
                      </select>
                    </div>
                    <div style={styles.settingItem}>
                      <label>Auto-translate Messages</label>
                      <button 
                        onClick={() => updateSettings('language', 'autoTranslate', !settings.language.autoTranslate)}
                        style={styles.toggleButton}
                      >
                        {settings.language.autoTranslate ? <FaToggleOn color="#10b981" size={24} /> : <FaToggleOff color="#94a3b8" size={24} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
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
                <h3>{typeof selectedRequest.service === 'string' ? selectedRequest.service : 'Service'}</h3>
                <p>{selectedRequest.description}</p>
              </div>
              
              <div style={styles.modalGrid}>
                <div>
                  <strong>Customer</strong>
                  <p>{typeof selectedRequest.customer === 'string' ? selectedRequest.customer : 'Customer'}</p>
                </div>
                <div>
                  <strong>Location</strong>
                  <p>{selectedRequest.location}</p>
                </div>
                {selectedRequest.distance && (
                  <div>
                    <strong>Distance</strong>
                    <p style={{ color: '#3498db' }}>{selectedRequest.distance.toFixed(1)} km</p>
                  </div>
                )}
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
                  <p>{formatTime(selectedRequest.time)}</p>
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
    </div>
  );
};

// ============ STYLES (Keep all your existing styles, they're fine) ============
const styles = {
  container: {
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'relative',
    transition: 'all 0.3s ease',
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
    color: '#3498db',
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
    backgroundColor: '#3498db',
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
    width: '100%',
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
  locationBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginLeft: '12px',
    padding: '4px 12px',
    backgroundColor: '#f0f9ff',
    color: '#0369a1',
    borderRadius: '30px',
    fontSize: '12px',
    fontWeight: '500',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  locationButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: 'white',
    color: '#3498db',
    border: '2px solid #e2e8f0',
    borderRadius: '30px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
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
  chatHeaderButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'white',
    color: '#3b82f6',
    border: '2px solid #e2e8f0',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.2s',
  },
  chatHeaderBadge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    backgroundColor: '#ef4444',
    color: 'white',
    fontSize: '11px',
    fontWeight: '600',
    minWidth: '18px',
    height: '18px',
    borderRadius: '9px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
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
  locationControls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    padding: '16px 20px',
    backgroundColor: 'white',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    flexWrap: 'wrap',
    gap: '16px',
  },
  locationInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#0f172a',
    fontSize: '14px',
    fontWeight: '500',
  },
  locationText: {
    maxWidth: '300px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  filterControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    color: '#475569',
    cursor: 'pointer',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  distanceSelect: {
    padding: '8px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#0f172a',
    backgroundColor: 'white',
    cursor: 'pointer',
    outline: 'none',
  },
  mapToggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  mapContainer: {
    marginBottom: '30px',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
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
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
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
  viewAllButton: {
    marginTop: '16px',
    padding: '10px 20px',
    backgroundColor: 'white',
    color: '#3498db',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginLeft: '12px',
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
    marginTop: '20px',
  },

  // CHAT STYLES
  chatsLayout: {
    display: 'grid',
    gridTemplateColumns: '350px 1fr',
    gap: '20px',
    height: '600px',
  },
  chatsList: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflowY: 'auto',
    height: '100%',
  },
  noChats: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '40px',
    textAlign: 'center',
    color: '#64748b',
  },
  chatListItem: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    cursor: 'pointer',
    borderBottom: '1px solid #e2e8f0',
    transition: 'all 0.2s',
    position: 'relative',
  },
  chatListAvatar: {
    position: 'relative',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '600',
    flexShrink: 0,
  },
  chatListOnlineDot: {
    position: 'absolute',
    bottom: '0',
    right: '0',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: '2px solid white',
  },
  chatListInfo: {
    flex: 1,
    minWidth: 0,
  },
  chatListHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  chatListHeaderH4: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '600',
    color: '#0f172a',
  },
  chatListTime: {
    fontSize: '11px',
    color: '#94a3b8',
  },
  chatListJob: {
    margin: '0 0 4px',
    fontSize: '12px',
    color: '#3b82f6',
  },
  chatListMessage: {
    margin: 0,
    fontSize: '12px',
    color: '#64748b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chatListBadge: {
    position: 'absolute',
    right: '16px',
    bottom: '16px',
    backgroundColor: '#3b82f6',
    color: 'white',
    fontSize: '11px',
    fontWeight: '600',
    minWidth: '20px',
    height: '20px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatWindow: {
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    height: '100%',
  },
  emptyChat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#94a3b8',
    textAlign: 'center',
    padding: '20px',
  },
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  chatHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
  },
  chatUserInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  chatAvatar: {
    position: 'relative',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '600',
  },
  onlineDot: {
    position: 'absolute',
    bottom: '0',
    right: '0',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    border: '2px solid white',
  },
  chatUserName: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#0f172a',
  },
  chatUserStatus: {
    margin: '2px 0 0',
    fontSize: '12px',
    color: '#64748b',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  dateDivider: {
    textAlign: 'center',
    margin: '10px 0',
    '& span': {
      backgroundColor: '#f1f5f9',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '11px',
      color: '#64748b',
    },
  },
  messageWrapper: {
    display: 'flex',
    width: '100%',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: '10px 14px',
    borderRadius: '16px',
    position: 'relative',
    wordWrap: 'break-word',
  },
  messageText: {
    margin: '0 0 4px',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  messageFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '4px',
  },
  messageTime: {
    fontSize: '10px',
    opacity: 0.7,
  },
  messageStatus: {
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
  },
  typingIndicator: {
    padding: '10px 20px',
    fontSize: '12px',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  typingDots: {
    '& span': {
      animation: 'typing 1.4s infinite',
      '&:nth-child(2)': {
        animationDelay: '0.2s',
      },
      '&:nth-child(3)': {
        animationDelay: '0.4s',
      },
    },
  },
  typingDot: {
    fontSize: '12px',
    color: '#3b82f6',
    fontWeight: '600',
  },
  messageInputContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 20px',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
  },
  attachmentsContainer: {
    position: 'relative',
  },
  attachButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    color: '#64748b',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
  },
  attachmentsMenu: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    border: '1px solid #e2e8f0',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: '150px',
    '& button': {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      background: 'none',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      width: '100%',
      textAlign: 'left',
    },
  },
  messageInput: {
    flex: 1,
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '24px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
  },
  sendButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: 'none',
    color: 'white',
    transition: 'all 0.2s',
  },

  // Settings Styles
  settingsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  settingsSection: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e2e8f0',
  },
  settingsTitle: {
    margin: '0 0 20px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  subTitle: {
    margin: '20px 0 15px 0',
    fontSize: '16px',
    fontWeight: '500',
    color: '#475569',
  },
  settingsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  settingItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  settingItemFull: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '10px',
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  toggleButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '5px',
  },
  input: {
    padding: '8px 12px',
    border: '2px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    width: '200px',
  },
  select: {
    padding: '8px 12px',
    border: '2px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'white',
    width: '200px',
  },
  timeInput: {
    padding: '6px 10px',
    border: '2px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '13px',
  },
  workingHoursRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '10px',
    padding: '10px',
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
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
    @keyframes typing {
      0%, 60%, 100% {
        opacity: 0;
      }
      30% {
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
}

export default ProviderDashboard;
