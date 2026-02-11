import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { socket } from '../services/websocket';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  // Auto-login on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          
          // Update WebSocket with user info
          socket.updateQueryParams({
            user_id: JSON.parse(savedUser).id,
            type: JSON.parse(savedUser).role,
            name: JSON.parse(savedUser).name || JSON.parse(savedUser).username
          });
          
          // Connect WebSocket if not connected
          if (!socket.isConnected()) {
            socket.connect();
          }
        } catch (error) {
          console.error('Auto-login failed:', error);
          logout();
        }
      }
      setLoading(false);
    };
    
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      if (response.data.success) {
        const { user, token, session } = response.data.data;
        
        // Save to state and storage
        setUser(user);
        setToken(token);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('session', session);
        
        // Update axios headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Update WebSocket connection
        socket.updateQueryParams({
          user_id: user.id,
          type: user.role,
          name: user.name || user.username
        });
        
        // Reconnect WebSocket with authenticated user
        socket.disconnect();
        setTimeout(() => socket.connect(), 100);
        
        return { success: true, user };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      if (response.data.success) {
        const { user, token, session } = response.data.data;
        
        setUser(user);
        setToken(token);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('session', session);
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        socket.updateQueryParams({
          user_id: user.id,
          type: user.role,
          name: user.name || user.username
        });
        
        socket.disconnect();
        setTimeout(() => socket.connect(), 100);
        
        return { success: true, user };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, {
        headers: {
          'X-Session-Token': localStorage.getItem('session')
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear everything
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('session');
    delete axios.defaults.headers.common['Authorization'];
    
    // Disconnect WebSocket
    socket.disconnect();
    
    // Redirect to login
    window.location.href = '/login';
  };

  const updateProfile = async (userData) => {
    try {
      const response = await axios.put(`${API_URL}/auth/profile`, userData);
      
      if (response.data.success) {
        const updatedUser = { ...user, ...response.data.data.user };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true, user: updatedUser };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Update failed' 
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isProvider: user?.role === 'provider',
    isCustomer: user?.role === 'customer'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Higher-order component for protecting routes
export const withAuth = (Component) => {
  return (props) => {
    const { user, loading } = useAuth();
    
    if (loading) {
      return <div>Loading...</div>;
    }
    
    if (!user) {
      window.location.href = '/login';
      return null;
    }
    
    return <Component {...props} />;
  };
};

// Higher-order component for role-based protection
export const withRole = (roles) => (Component) => {
  return (props) => {
    const { user, loading } = useAuth();
    
    if (loading) {
      return <div>Loading...</div>;
    }
    
    if (!user) {
      window.location.href = '/login';
      return null;
    }
    
    if (!roles.includes(user.role)) {
      window.location.href = '/unauthorized';
      return null;
    }
    
    return <Component {...props} />;
  };
};