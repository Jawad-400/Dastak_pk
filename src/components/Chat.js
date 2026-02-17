import React, { useState, useEffect, useRef } from 'react';
import { 
  FaPaperPlane, FaUser, FaClock, FaCheck, 
  FaCheckDouble, FaTimes, FaSmile, FaPaperclip,
  FaImage, FaFile, FaVideo, FaMicrophone
} from 'react-icons/fa';
import { useChat } from '../context/ChatContext';
import { socket } from '../Services/socket';

const Chat = ({ onClose }) => {
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const {
    activeChat,
    messages,
    sendMessage,
    markAsRead,
    sendTypingIndicator,
    onlineUsers
  } = useChat();

  const chatMessages = activeChat ? messages(activeChat.id) : [];

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (activeChat) {
      markAsRead(activeChat.id);
    }
  }, [activeChat, markAsRead]);

  // Handle typing indicator
  useEffect(() => {
    if (!activeChat) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    sendTypingIndicator(activeChat.id, isTyping);

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        sendTypingIndicator(activeChat.id, false);
      }
    }, 2000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isTyping, activeChat, sendTypingIndicator]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeChat) return;

    sendMessage(activeChat.id, messageText.trim());
    setMessageText('');
    setIsTyping(false);
    sendTypingIndicator(activeChat.id, false);
  };

  const handleTyping = (e) => {
    setMessageText(e.target.value);
    if (e.target.value.length > 0 && !isTyping) {
      setIsTyping(true);
    } else if (e.target.value.length === 0 && isTyping) {
      setIsTyping(false);
    }
  };

  const handleFileSelect = (type) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'image' ? 'image/*' : 
                                   type === 'video' ? 'video/*' : '*/*';
      fileInputRef.current.click();
    }
    setShowAttachments(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeChat) return;

    // Create FormData and upload file
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
        sendMessage(activeChat.id, `📎 ${file.name}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
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

  if (!activeChat) {
    return (
      <div style={styles.emptyChat}>
        <FaUser size={48} color="#cbd5e1" />
        <h3>No chat selected</h3>
        <p>Select a conversation to start messaging</p>
      </div>
    );
  }

  const isOnline = onlineUsers.has(activeChat.participant.id);

  return (
    <div style={styles.chatContainer}>
      {/* Chat Header */}
      <div style={styles.chatHeader}>
        <div style={styles.chatUserInfo}>
          <div style={styles.chatAvatar}>
            {activeChat.participant.name.charAt(0)}
            <span style={{
              ...styles.onlineDot,
              backgroundColor: isOnline ? '#10b981' : '#94a3b8'
            }} />
          </div>
          <div>
            <h3 style={styles.chatUserName}>{activeChat.participant.name}</h3>
            <p style={styles.chatUserStatus}>
              {isOnline ? 'Online' : 'Offline'} • {activeChat.jobTitle}
            </p>
          </div>
        </div>
        <button onClick={onClose} style={styles.closeButton}>
          <FaTimes />
        </button>
      </div>

      {/* Messages Area */}
      <div style={styles.messagesContainer}>
        {chatMessages.map((msg, index) => {
          const isCurrentUser = msg.senderId === socket.getCurrentUser()?.id;
          const showDate = index === 0 || 
            new Date(msg.timestamp).toDateString() !== 
            new Date(chatMessages[index - 1].timestamp).toDateString();

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
      <form onSubmit={handleSendMessage} style={styles.messageInputContainer}>
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
              <button onClick={() => handleFileSelect('image')}>
                <FaImage /> Image
              </button>
              <button onClick={() => handleFileSelect('video')}>
                <FaVideo /> Video
              </button>
              <button onClick={() => handleFileSelect('file')}>
                <FaFile /> File
              </button>
            </div>
          )}
        </div>

        <input
          type="text"
          value={messageText}
          onChange={handleTyping}
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
  );
};

const styles = {
  emptyChat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#94a3b8',
    textAlign: 'center',
    padding: '20px'
  },
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  chatHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc'
  },
  chatUserInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
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
    fontWeight: '600'
  },
  onlineDot: {
    position: 'absolute',
    bottom: '0',
    right: '0',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    border: '2px solid white'
  },
  chatUserName: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#0f172a'
  },
  chatUserStatus: {
    margin: '2px 0 0',
    fontSize: '12px',
    color: '#64748b'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    color: '#64748b',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    ':hover': {
      backgroundColor: '#f1f5f9'
    }
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  dateDivider: {
    textAlign: 'center',
    margin: '10px 0',
    position: 'relative',
    '& span': {
      backgroundColor: '#f1f5f9',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '11px',
      color: '#64748b'
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
    position: 'relative',
    wordWrap: 'break-word'
  },
  messageText: {
    margin: '0 0 4px',
    fontSize: '14px',
    lineHeight: '1.5'
  },
  messageFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '4px'
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
  typingIndicator: {
    padding: '10px 20px',
    fontSize: '12px',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  typingDots: {
    '& span': {
      animation: 'typing 1.4s infinite',
      '&:nth-child(2)': {
        animationDelay: '0.2s'
      },
      '&:nth-child(3)': {
        animationDelay: '0.4s'
      }
    }
  },
  messageInputContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 20px',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc'
  },
  attachmentsContainer: {
    position: 'relative'
  },
  attachButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    color: '#64748b',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    ':hover': {
      backgroundColor: '#e2e8f0'
    }
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
      ':hover': {
        backgroundColor: '#f1f5f9'
      }
    }
  },
  messageInput: {
    flex: 1,
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '24px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
    ':focus': {
      borderColor: '#3b82f6'
    }
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
    transition: 'all 0.2s'
  }
};

export default Chat;
