import React from 'react';
import { FaBell, FaWallet, FaStar, FaCalendarAlt, FaMapMarkerAlt, FaTools, FaCheckCircle } from 'react-icons/fa';

const WorkerDashboard = () => {
  const requests = [
    { id: 1, service: 'Plumbing', customer: 'Ahmed Raza', location: 'Gulshan, Karachi', budget: '₹2,500', time: '2 hours ago' },
    { id: 2, service: 'Car Service', customer: 'Sara Khan', location: 'DHA, Lahore', budget: '₹4,000', time: '5 hours ago' },
    { id: 3, service: 'AC Repair', customer: 'Imran Ali', location: 'F-7, Islamabad', budget: '₹3,000', time: '1 day ago' },
  ];

  const stats = {
    completedJobs: 24,
    totalEarnings: '₹68,500',
    rating: 4.8,
    activeRequests: 3
  };

  return (
    <section className="worker-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Provider Dashboard</h1>
          <p>Welcome back, <strong>John Doe</strong> (Plumber)</p>
        </div>
        
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon" style={{background: '#0ea5e9'}}>
              <FaCheckCircle />
            </div>
            <h3>{stats.completedJobs}</h3>
            <p>Completed Jobs</p>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{background: '#10b981'}}>
              <FaWallet />
            </div>
            <h3>{stats.totalEarnings}</h3>
            <p>Total Earnings</p>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{background: '#f59e0b'}}>
              <FaStar />
            </div>
            <h3>{stats.rating}</h3>
            <p>Your Rating</p>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{background: '#ef4444'}}>
              <FaBell />
            </div>
            <h3>{stats.activeRequests}</h3>
            <p>Active Requests</p>
          </div>
        </div>
        
        <div className="dashboard-content">
          <div className="requests-section">
            <h2>New Service Requests</h2>
            <div className="requests-list">
              {requests.map(request => (
                <div key={request.id} className="request-card">
                  <div className="request-header">
                    <h3>{request.service}</h3>
                    <span className="budget">{request.budget}</span>
                  </div>
                  <div className="request-details">
                    <p><strong>Customer:</strong> {request.customer}</p>
                    <p><FaMapMarkerAlt /> {request.location}</p>
                    <p><FaCalendarAlt /> {request.time}</p>
                  </div>
                  <div className="request-actions">
                    <button className="btn btn-primary">View Details</button>
                    <button className="btn btn-worker">Accept Request</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="sidebar">
            <div className="profile-card">
              <h3>Your Profile</h3>
              <div className="profile-info">
                <p><strong>Service:</strong> Plumber</p>
                <p><strong>City:</strong> Karachi</p>
                <p><strong>Experience:</strong> 5 years</p>
                <p><strong>Rating:</strong> 4.8/5 (42 reviews)</p>
              </div>
              <button className="btn btn-outline">Edit Profile</button>
            </div>
            
            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <button className="action-btn">
                <FaTools /> Update Availability
              </button>
              <button className="action-btn">
                <FaWallet /> Withdraw Earnings
              </button>
              <button className="action-btn">
                <FaStar /> View Reviews
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkerDashboard;