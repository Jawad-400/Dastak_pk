import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { socket } from '../Services/socket';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  
  const messageSound = useRef(null);

  // Load chats from localStorage on mount
  useEffect(() => {
    const savedChats = localStorage.getItem('chats');
    if (savedChats) {
      try {
        setChats(JSON.parse(savedChats));
      } catch (e) {
        console.error('Error parsing chats:', e);
      }
    }
    
    // Create audio element for notifications
    messageSound.current = new Audio('/notification.mp3');
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('chats', JSON.stringify(chats));
    }
  }, [chats]);

  // Save messages to localStorage
  useEffect(() => {
    Object.entries(messages).forEach(([chatId, chatMessages]) => {
      if (chatMessages.length > 0) {
        localStorage.setItem(`chat_${chatId}_messages`, JSON.stringify(chatMessages));
      }
    });
  }, [messages]);

  // Load messages from localStorage
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

  // WebSocket event listeners for chat
  useEffect(() => {
    const handleNewMessage = (data) => {
      console.log('💬 ChatContext - New message received:', data);
      
      // Extract data correctly - the message is nested
      const { chatId, message, senderId, senderName } = data;
      
      if (!message || !message.id) {
        console.error('❌ Invalid message format:', data);
        return;
      }

      const currentUser = socket.getCurrentUser();
      
      // Add message to messages state
      setMessages(prev => {
        const chatMessages = prev[chatId] || [];
        
        // Check if message already exists
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
            senderId: senderId || message.senderId,
            senderName: senderName || message.senderName,
            timestamp: message.timestamp,
            read: false
          }]
        };
      });

      // Update last message in chats list
      setChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { 
              ...chat, 
              lastMessage: message.text,
              lastMessageTime: message.timestamp,
              unreadCount: senderId !== currentUser?.id 
                ? (chat.unreadCount || 0) + 1 
                : chat.unreadCount
            }
          : chat
      ));

      // Update unread count and play sound
      if (senderId !== currentUser?.id) {
        setUnreadCount(prev => prev + 1);
        
        // Play sound if not active chat or window not focused
        if (document.hidden || activeChat?.id !== chatId) {
          messageSound.current?.play().catch(e => console.log('Audio play failed:', e));
        }
      }
    };

    const handleMessageRead = (data) => {
      console.log('👁️ Messages read:', data);
      const { chatId } = data;
      
      const currentUser = socket.getCurrentUser();
      
      // Mark messages as read
      setMessages(prev => ({
        ...prev,
        [chatId]: prev[chatId]?.map(msg => 
          msg.senderId !== currentUser?.id ? { ...msg, read: true } : msg
        ) || []
      }));

      // Reset unread count for this chat
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
      setOnlineUsers(prev => new Set([...prev, data.userId]));
    };

    const handleUserOffline = (data) => {
      console.log('🔴 User offline:', data.userId);
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    };

    // Register listeners
    socket.on('chat_message', handleNewMessage);
    socket.on('messages_read', handleMessageRead);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);

    return () => {
      socket.off('chat_message', handleNewMessage);
      socket.off('messages_read', handleMessageRead);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
    };
  }, [activeChat, chats]);

  const createChat = (participant, jobDetails) => {
    const chatId = `chat_${jobDetails.id}`; // Use job ID for consistency
    const newChat = {
      id: chatId,
      participant: {
        id: participant.id,
        name: participant.name
      },
      jobId: jobDetails.id,
      jobTitle: jobDetails.service,
      createdAt: new Date().toISOString(),
      lastMessage: null,
      lastMessageTime: null,
      unreadCount: 0
    };
    
    setChats(prev => {
      const exists = prev.some(chat => chat.id === chatId);
      if (exists) {
        console.log('⚠️ Chat already exists, skipping creation');
        return prev;
      }
      console.log('🆕 Creating new chat:', newChat);
      return [newChat, ...prev];
    });
    
    return chatId;
  };

  const sendMessage = (chatId, text) => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) {
      console.error('❌ Chat not found:', chatId);
      return;
    }

    const currentUser = socket.getCurrentUser();
    if (!currentUser) {
      console.error('❌ No current user found');
      return;
    }

    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      text,
      senderId: currentUser.id,
      senderName: currentUser.name,
      timestamp: new Date().toISOString(),
      read: false
    };

    console.log('📤 Sending message:', { chatId, message, receiverId: chat.participant.id });

    // Add to local messages
    setMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), message]
    }));

    // Update chat last message
    setChats(prev => prev.map(c => 
      c.id === chatId 
        ? { ...c, lastMessage: text, lastMessageTime: message.timestamp }
        : c
    ));

    // Send via WebSocket
    socket.send('chat_message', {
      chatId,
      message,
      senderId: currentUser.id,
      senderName: currentUser.name,
      receiverId: chat.participant.id,
      jobId: chat.jobId
    });

    return message;
  };

  const markAsRead = (chatId) => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;

    const currentUser = socket.getCurrentUser();
    if (!currentUser) return;

    socket.send('messages_read', {
      chatId,
      userId: currentUser.id
    });

    setMessages(prev => ({
      ...prev,
      [chatId]: prev[chatId]?.map(msg => ({ ...msg, read: true })) || []
    }));

    setChats(prev => prev.map(c => 
      c.id === chatId ? { ...c, unreadCount: 0 } : c
    ));
  };

  const sendTypingIndicator = (chatId, isTyping) => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;

    const currentUser = socket.getCurrentUser();
    if (!currentUser) return;

    socket.send('typing_indicator', {
      chatId,
      isTyping,
      userId: currentUser.id,
      receiverId: chat.participant.id
    });
  };

  const getMessages = (chatId) => {
    return messages[chatId] || [];
  };

  const value = {
    chats,
    activeChat,
    setActiveChat,
    messages: getMessages,
    unreadCount,
    onlineUsers,
    createChat,
    sendMessage,
    markAsRead,
    sendTypingIndicator
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
