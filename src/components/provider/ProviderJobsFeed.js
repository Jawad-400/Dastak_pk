import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles.css';

const ProviderJobsFeed = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);

  // Sample available jobs data
  const availableJobs = [
    {
      id: 1,
      service: 'Plumbing',
      title: 'Kitchen Pipe Leak Repair',
      description: 'Pipe under kitchen sink is leaking. Need immediate repair.',
      customer: 'Ahmed Raza',
      location: 'Gulshan, Karachi',
      distance: '2 km',
      budget: '₹1,500 - ₹2,500',
      postedTime: '30 minutes ago',
      OrdersCount: 3,
      urgency: 'high',
      category: 'plumbing'
    },
    {
      id: 2,
      service: 'AC Repair',
      title: 'AC Not Cooling',
      description: 'Split AC not cooling properly. Needs gas refill or repair.',
      customer: 'Sara Khan',
      location: 'DHA Phase 5, Lahore',
      distance: '5 km',
      budget: '₹3,000 - ₹4,500',
      postedTime: '1 hour ago',
      OrdersCount: 8,
      urgency: 'medium',
      category: 'ac'
    },
    {
      id: 3,
      service: 'Electrical',
      title: 'House Wiring Check',
      description: 'Complete house wiring check needed. Lights flickering.',
      customer: 'Ali Hassan',
      location: 'Clifton, Karachi',
      distance: '3 km',
      budget: '₹2,000 - ₹3,500',
      postedTime: '2 hours ago',
      OrdersCount: 2,
      urgency: 'low',
      category: 'electrical'
    },
    {
      id: 4,
      service: 'Car Wash',
      title: 'Car Interior Cleaning',
      description: 'Honda Civic 2020 interior deep cleaning needed.',
      customer: 'Raza Javed',
      location: 'North Nazimabad, Karachi',
      distance: '8 km',
      budget: '₹1,200 - ₹1,800',
      postedTime: '3 hours ago',
      OrdersCount: 5,
      urgency: 'low',
      category: 'car'
    }
  ];

  const handlePlaceorder = (job) => {
    setSelectedJob(job);
    // Show order modal or navigate to order page
    navigate('/provider/place-order', { state: { job } });
  };

  const handleViewMyOrders = () => {
    navigate('/provider/my-orders');
  };

  const filteredJobs = filter === 'all' 
    ? availableJobs 
    : availableJobs.filter(job => job.category === filter);

  return (
    <div className="provider-jobs-feed">
      <div className="container">
        {/* Header */}
        <div className="feed-header">
          <div>
            <h1>Available Jobs Near You</h1>
            <p>Find jobs matching your skills and place Orders</p>
          </div>
          <button className="btn-my-orders" onClick={handleViewMyOrders}>
            📋 My Orders
          </button>
        </div>

        {/* Filters */}
        <div className="jobs-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Jobs
          </button>
          <button 
            className={`filter-btn ${filter === 'plumbing' ? 'active' : ''}`}
            onClick={() => setFilter('plumbing')}
          >
            Plumbing
          </button>
          <button 
            className={`filter-btn ${filter === 'electrical' ? 'active' : ''}`}
            onClick={() => setFilter('electrical')}
          >
            Electrical
          </button>
          <button 
            className={`filter-btn ${filter === 'ac' ? 'active' : ''}`}
            onClick={() => setFilter('ac')}
          >
            AC Repair
          </button>
          <button 
            className={`filter-btn ${filter === 'car' ? 'active' : ''}`}
            onClick={() => setFilter('car')}
          >
            Vehicle
          </button>
        </div>

        {/* Stats */}
        <div className="jobs-stats">
          <div className="stat">
            <span className="stat-number">{availableJobs.length}</span>
            <span className="stat-label">Available Jobs</span>
          </div>
          <div className="stat">
            <span className="stat-number">12</span>
            <span className="stat-label">Total Orders Placed</span>
          </div>
          <div className="stat">
            <span className="stat-number">3</span>
            <span className="stat-label">Jobs Accepted</span>
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="jobs-grid">
          {filteredJobs.map(job => (
            <div key={job.id} className="job-card">
              <div className="job-header">
                <div>
                  <h3>{job.service}</h3>
                  <p className="job-title">{job.title}</p>
                </div>
                <span className={`urgency-badge ${job.urgency}`}>
                  {job.urgency === 'high' ? '🚨 URGENT' : '🕒 STANDARD'}
                </span>
              </div>

              <p className="job-description">{job.description}</p>

              <div className="job-details">
                <div className="detail">
                  <span className="label">📍 Location:</span>
                  <span className="value">{job.location} ({job.distance} away)</span>
                </div>
                <div className="detail">
                  <span className="label">👤 Customer:</span>
                  <span className="value">{job.customer}</span>
                </div>
                <div className="detail">
                  <span className="label">💰 Budget:</span>
                  <span className="value budget">{job.budget}</span>
                </div>
                <div className="detail">
                  <span className="label">⏰ Posted:</span>
                  <span className="value">{job.postedTime}</span>
                </div>
                <div className="detail">
                  <span className="label">👥 Orders:</span>
                  <span className="value">{job.OrdersCount} Orders so far</span>
                </div>
              </div>

              <div className="job-actions">
                <button 
                  className="btn-place-order"
                  onClick={() => handlePlaceorder(job)}
                >
                  Place Order
                </button>
                <button className="btn-save">
                  Save for Later
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredJobs.length === 0 && (
          <div className="empty-jobs">
            <p>No jobs available for {filter} right now.</p>
            <button onClick={() => setFilter('all')}>View All Jobs</button>
          </div>
        )}

        {/* Tips */}
        <div className="jobs-tips">
          <h4>💡 Order Success Tips:</h4>
          <ul>
            <li>Order within customer's budget range</li>
            <li>Place Order quickly for urgent jobs</li>
            <li>Check your distance from job location</li>
            <li>Include a friendly message with your order</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProviderJobsFeed;