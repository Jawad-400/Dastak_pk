// frontend/src/services/auth.js
import axios from 'axios';
import { socket } from '../Services/socket';

const API_URL = process.env.REACT_APP_API_URL || '${process.env.REACT_APP_API_URL}/api';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.sessionToken = localStorage.getItem('sessionToken');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
    
    // Setup axios interceptors
    this.setupAxios();
  }

  setupAxios() {
    // Request interceptor to add tokens
    axios.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        if (this.sessionToken) {
          config.headers['X-Session-Token'] = this.sessionToken;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle auth errors
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Register new user
  async register(userData) {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      if (response.data.success) {
        this.setAuth(response.data.data);
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Registration failed' };
    }
  }

  // Login user
  async login(credentials) {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      
      if (response.data.success) {
        this.setAuth(response.data.data);
        
        // Connect WebSocket with authenticated user
        if (socket) {
          socket.updateQueryParams({
            user_id: response.data.data.user.id,
            type: response.data.data.user.role,
            name: response.data.data.user.full_name || response.data.data.user.username
          });
          
          if (!socket.isConnected()) {
            socket.connect();
          }
        }
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Login failed' };
    }
  }

  // Logout user
  async logout() {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, {
        headers: {
          'X-Session-Token': this.sessionToken
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
      
      // Disconnect WebSocket
      if (socket) {
        socket.disconnect();
      }
      
      window.location.href = '/login';
    }
  }

  // Get current user profile
  async getProfile() {
    try {
      const response = await axios.get(`${API_URL}/auth/profile`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch profile' };
    }
  }

  // Update profile
  async updateProfile(userData) {
    try {
      const response = await axios.put(`${API_URL}/auth/profile`, userData);
      
      if (response.data.success) {
        // Update local user data
        this.user = { ...this.user, ...response.data.data.user };
        localStorage.setItem('user', JSON.stringify(this.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update profile' };
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to send reset email' };
    }
  }

  // Reset password
  async resetPassword(token, newPassword) {
    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, { 
        token, 
        newPassword 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to reset password' };
    }
  }

  // Validate session
  async validateSession() {
    try {
      if (!this.sessionToken) return false;
      
      const response = await axios.get(`${API_URL}/auth/validate-session`);
      return response.data.success;
    } catch (error) {
      return false;
    }
  }

  // Set authentication data
  setAuth(authData) {
    this.token = authData.token;
    this.sessionToken = authData.session;
    this.user = authData.user;
    
    localStorage.setItem('token', authData.token);
    localStorage.setItem('sessionToken', authData.session);
    localStorage.setItem('user', JSON.stringify(authData.user));
    localStorage.setItem('expiresAt', authData.expiresAt);
  }

  // Clear authentication data
  clearAuth() {
    this.token = null;
    this.sessionToken = null;
    this.user = null;
    
    localStorage.removeItem('token');
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('user');
    localStorage.removeItem('expiresAt');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!(this.token && this.user);
  }

  // Check if user has specific role
  hasRole(role) {
    return this.user?.role === role;
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles) {
    return roles.includes(this.user?.role);
  }

  // Get current user
  getCurrentUser() {
    return this.user;
  }

  // Get token
  getToken() {
    return this.token;
  }

  // Auto-login on page refresh
  async autoLogin() {
    if (this.isAuthenticated()) {
      try {
        // Validate session
        const isValid = await this.validateSession();
        
        if (!isValid) {
          this.clearAuth();
          return false;
        }
        
        // Connect WebSocket
        if (socket) {
          socket.updateQueryParams({
            user_id: this.user.id,
            type: this.user.role,
            name: this.user.full_name || this.user.username
          });
          
          if (!socket.isConnected()) {
            socket.connect();
          }
        }
        
        return true;
      } catch (error) {
        this.clearAuth();
        return false;
      }
    }
    
    return false;
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
