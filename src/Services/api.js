// API service with WebSocket integration
import { socket } from './socket';

const process.env.REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = {
  // Post a new service request
  async postServiceRequest(requestData) {
    try {
      console.log('Posting service request:', requestData);
      
      // Mock API call (replace with actual API)
      const mockResponse = {
        success: true,
        requestId: Date.now().toString(),
        message: 'Service request posted successfully'
      };
      
      // Emit socket event for real-time notification
      if (socket.connected) {
        socket.emit('new-service-request', {
          ...requestData,
          requestId: mockResponse.requestId,
          timestamp: new Date().toISOString(),
          customer: JSON.parse(localStorage.getItem('dastak_user') || '{}')
        });
      }
      
      return mockResponse;
    } catch (error) {
      console.error('Error posting service request:', error);
      throw error;
    }
  },
  
  // Submit a bid/order
  async submitBid(bidData) {
    try {
      console.log('Submitting bid:', bidData);
      
      const mockResponse = {
        success: true,
        bidId: Date.now().toString(),
        message: 'Bid submitted successfully'
      };
      
      // Emit socket event
      if (socket.connected) {
        socket.emit('new-bid', {
          ...bidData,
          bidId: mockResponse.bidId,
          timestamp: new Date().toISOString(),
          provider: JSON.parse(localStorage.getItem('dastak_provider') || '{}')
        });
      }
      
      return mockResponse;
    } catch (error) {
      console.error('Error submitting bid:', error);
      throw error;
    }
  },
  
  // Accept a bid
  async acceptBid(bidId, requestId) {
    try {
      console.log('Accepting bid:', bidId, 'for request:', requestId);
      
      const mockResponse = {
        success: true,
        message: 'Bid accepted successfully'
      };
      
      // Emit socket event
      if (socket.connected) {
        socket.emit('accept-bid', {
          bidId,
          requestId,
          timestamp: new Date().toISOString()
        });
      }
      
      return mockResponse;
    } catch (error) {
      console.error('Error accepting bid:', error);
      throw error;
    }
  },
  
  // Get active requests (for providers)
  async getActiveRequests() {
    try {
      // Mock data - in real app, this would come from API
      const mockRequests = [
        {
          id: '1',
          service: 'Plumbing - Leak Repair',
          description: 'Kitchen sink leaking under cabinet',
          budget: '?2,500',
          location: 'Gulshan, Karachi',
          urgency: 'high',
          postedTime: '10 minutes ago'
        },
        {
          id: '2', 
          service: 'AC Repair',
          description: 'AC not cooling properly, needs gas refill',
          budget: '?3,000',
          location: 'DHA Phase 5',
          urgency: 'medium',
          postedTime: '25 minutes ago'
        },
        {
          id: '3',
          service: 'Electrical Wiring',
          description: 'Complete house wiring needed for new construction',
          budget: '?25,000',
          location: 'Bahria Town',
          urgency: 'low',
          postedTime: '1 hour ago'
        }
      ];
      
      return mockRequests;
    } catch (error) {
      console.error('Error fetching requests:', error);
      throw error;
    }
  },
  
  // Get provider bids/orders
  async getProviderOrders(providerId) {
    try {
      // Mock data
      const mockOrders = [
        {
          id: '1',
          requestId: '101',
          service: 'Bathroom Plumbing',
          customerName: 'Ali Ahmed',
          customerPhone: '0300-1234567',
          bidAmount: '?2,800',
          status: 'pending',
          submittedTime: '2 hours ago'
        },
        {
          id: '2',
          requestId: '102',
          service: 'AC Maintenance',
          customerName: 'Sara Khan',
          customerPhone: '0300-7654321',
          bidAmount: '?2,500',
          status: 'accepted',
          submittedTime: '1 day ago'
        }
      ];
      
      return mockOrders;
    } catch (error) {
      console.error('Error fetching provider orders:', error);
      throw error;
    }
  },
  
  // Get customer orders
  async getCustomerOrders(customerPhone) {
    try {
      // Mock data
      const mockOrders = [
        {
          id: '1',
          service: 'Bathroom Plumbing',
          description: 'Leaking tap and drainage issue',
          postedDate: '2024-01-20',
          budget: '?2,500',
          status: 'Orders Open',
          bidCount: 3,
          location: 'Gulshan, Karachi'
        },
        {
          id: '2',
          service: 'AC Gas Refill',
          description: 'AC not cooling properly',
          postedDate: '2024-01-19',
          budget: '?3,000',
          status: 'Order Accepted',
          acceptedBid: '?2,800',
          provider: 'Cool Masters'
        }
      ];
      
      return mockOrders;
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      throw error;
    }
  },
  
  // Send chat message
  async sendChatMessage(messageData) {
    try {
      if (socket.connected) {
        socket.emit('chat-message', messageData);
        return { success: true };
      }
      return { success: false, error: 'Socket not connected' };
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }
};

export { api };
