import React, { useState, useEffect } from 'react';
import { 
  FaMapMarkerAlt, FaClock, FaRupeeSign, FaUser,
  FaBolt, FaWrench, FaSnowflake, FaCar, FaPaintBrush,
  FaHammer, FaBroom, FaTv, FaBug, FaSearch,
  FaFilter, FaBell, FaCheckCircle, FaSpinner,
  FaStar, FaRegBookmark, FaBookmark, FaShare,
  FaExclamationCircle, FaArrowRight
} from 'react-icons/fa';
import { socket } from '../../Services/socket';
import { useNavigate } from 'react-router-dom';
import { SERVICE_TYPES } from '../../components/serviceTypes';


const Allservices = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [distance, setDistance] = useState(20);
  const [sortBy, setSortBy] = useState('latest');
  const [liveCount, setLiveCount] = useState(0);

  // Service categories with icons and colors
  {SERVICE_TYPES.map(service => (
    <option key={service.value} value={service.value}>
      {service.name}
    </option>
  ))}

  // Real-time job feed
  useEffect(() => {
    setLoading(true);
    
    // Simulate fetching jobs
    setTimeout(() => {
      setJobs(mockJobs);
      setLiveCount(mockJobs.length);
      setLoading(false);
    }, 1000);

    // Listen for real-time job updates
    const handleNewRequest = (request) => {
      console.log('🎯 New job received:', request);
      
      const newJob = {
        id: request.id || Date.now(),
        service: request.serviceType || request.service || 'Service',
        title: request.title || `${request.serviceType || 'Service'} Request`,
        description: request.description || 'New service request available',
        customer: request.customerName || 'Customer',
        location: request.location || 'Karachi',
        distance: Math.floor(Math.random() * 8) + 1,
        budget: request.budget || 'Negotiable',
        budgetValue: parseInt(request.budget?.replace(/[^0-9]/g, '')) || 2000,
        postedTime: 'Just now',
        timeValue: 0,
        bids: Math.floor(Math.random() * 5) + 1,
        urgency: request.schedule === 'today' ? 'high' : 'normal',
        category: request.serviceType || 'general',
        customerRating: 4.8,
        completedJobs: 156,
        saved: false
      };

      setJobs(prev => [newJob, ...prev]);
      setLiveCount(prev => prev + 1);
      
      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification('🎯 New Service Request!', {
          body: `${newJob.service} - ${newJob.location} - ${newJob.budget}`,
          icon: '/logo.png'
        });
      }
    };

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    socket.on('new_request', handleNewRequest);
    
    return () => {
      socket.off('new_request', handleNewRequest);
    };
  }, []);

  // Mock jobs data
  const mockJobs = [
    {
      id: 1,
      service: 'Plumbing',
      title: 'Kitchen Pipe Leak Repair',
      description: 'Pipe under kitchen sink is leaking. Need immediate repair. Water is dripping constantly and causing damage to cabinet.',
      customer: 'Ahmed Raza',
      location: 'Gulshan-e-Iqbal, Karachi',
      distance: 2.3,
      budget: 'Rs. 1,500 - 2,500',
      budgetValue: 2000,
      postedTime: '30 min ago',
      timeValue: 30,
      bids: 3,
      urgency: 'high',
      category: 'plumbing',
      customerRating: 4.9,
      completedJobs: 212,
      saved: false
    },
    {
      id: 2,
      service: 'AC Repair',
      title: 'AC Not Cooling - Gas Refill',
      description: 'Split AC not cooling properly. Needs gas refill or compressor check. Model: Gree 1.5 Ton',
      customer: 'Sara Khan',
      location: 'DHA Phase 5, Lahore',
      distance: 5.1,
      budget: 'Rs. 3,000 - 4,500',
      budgetValue: 3750,
      postedTime: '1 hour ago',
      timeValue: 60,
      bids: 8,
      urgency: 'medium',
      category: 'ac_repair',
      customerRating: 4.7,
      completedJobs: 89,
      saved: true
    },
    {
      id: 3,
      service: 'Electrical',
      title: 'House Wiring & Fixture Installation',
      description: 'Complete house wiring check needed. Lights flickering in living room. Also need to install 3 new ceiling fans.',
      customer: 'Ali Hassan',
      location: 'Clifton, Karachi',
      distance: 3.7,
      budget: 'Rs. 2,000 - 3,500',
      budgetValue: 2750,
      postedTime: '2 hours ago',
      timeValue: 120,
      bids: 2,
      urgency: 'low',
      category: 'electrical',
      customerRating: 4.5,
      completedJobs: 45,
      saved: false
    },
    {
      id: 4,
      service: 'Car Service',
      title: 'Car Interior Deep Cleaning',
      description: 'Honda Civic 2020 interior deep cleaning needed. Seats, carpets, and roof lining.',
      customer: 'Raza Javed',
      location: 'North Nazimabad, Karachi',
      distance: 8.4,
      budget: 'Rs. 1,200 - 1,800',
      budgetValue: 1500,
      postedTime: '3 hours ago',
      timeValue: 180,
      bids: 5,
      urgency: 'low',
      category: 'car_service',
      customerRating: 4.6,
      completedJobs: 178,
      saved: false
    },
    {
      id: 5,
      service: 'Painting',
      title: '2 Bedroom Apartment Painting',
      description: 'Need professional painting for 2 bedroom apartment. Walls need minor repair before painting.',
      customer: 'Fatima Akhtar',
      location: 'Gulberg, Lahore',
      distance: 4.2,
      budget: 'Rs. 15,000 - 20,000',
      budgetValue: 17500,
      postedTime: '4 hours ago',
      timeValue: 240,
      bids: 12,
      urgency: 'medium',
      category: 'painting',
      customerRating: 4.9,
      completedJobs: 324,
      saved: false
    }
  ];

  // Filter and sort jobs
  const filteredJobs = jobs
    .filter(job => {
      // Category filter
      if (filter !== 'all' && job.category !== filter) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return job.title.toLowerCase().includes(query) ||
               job.description.toLowerCase().includes(query) ||
               job.service.toLowerCase().includes(query) ||
               job.location.toLowerCase().includes(query);
      }
      
      // Price filter
      if (job.budgetValue < priceRange[0] || job.budgetValue > priceRange[1]) return false;
      
      // Distance filter
      if (job.distance > distance) return false;
      
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'latest') return b.timeValue - a.timeValue;
      if (sortBy === 'price_low') return a.budgetValue - b.budgetValue;
      if (sortBy === 'price_high') return b.budgetValue - a.budgetValue;
      if (sortBy === 'distance') return a.distance - b.distance;
      return 0;
    });

  // Toggle save job
  const toggleSaveJob = (jobId) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, saved: !job.saved } : job
    ));
    
    if (savedJobs.includes(jobId)) {
      setSavedJobs(prev => prev.filter(id => id !== jobId));
    } else {
      setSavedJobs(prev => [...prev, jobId]);
    }
  };

  // Place bid/order
  const handlePlaceOrder = (job) => {
    setSelectedJob(job);
    navigate('/provider/place-order', { 
      state: { 
        job,
        customerName: job.customer,
        serviceType: job.service,
        budget: job.budget
      } 
    });
  };

  // View my orders
  const handleViewMyOrders = () => {
    navigate('/my-orders');
  };

  // Get urgency badge color
  const getUrgencyColor = (urgency) => {
    switch(urgency) {
      case 'high': return { bg: '#fee2e2', text: '#dc2626', label: 'Urgent' };
      case 'medium': return { bg: '#fef3c7', text: '#d97706', label: 'Standard' };
      case 'low': return { bg: '#e0f2fe', text: '#0284c7', label: 'Flexible' };
      default: return { bg: '#f3f4f6', text: '#6b7280', label: 'Normal' };
    }
  };

  return (
    <div className="all-services">
      {/* Hero Banner */}
      <div className="services-hero">
        <div className="container">
          <div className="hero-content">
            <div className="live-badge">
              <span className="pulse-dot"></span>
              <span className="live-text">{liveCount} jobs available now</span>
            </div>
            <h1>Find Your Next Job</h1>
            <p>Browse real-time service requests from customers near you</p>
            
            {/* Search Bar */}
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by service, location, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="filter-toggle" onClick={() => setShowFilters(!showFilters)}>
                <FaFilter /> Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Main Content */}
        <div className="services-layout">
          {/* Sidebar Filters */}
          <div className={`filters-sidebar ${showFilters ? 'show' : ''}`}>
            <div className="filters-header">
              <h3>Filters</h3>
              <button className="close-filters" onClick={() => setShowFilters(false)}>×</button>
            </div>

            {/* Categories */}
            <div className="filter-section">
              <h4>Categories</h4>
              <div className="category-list">
                <button 
                  className={`category-item ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  <span>All Services</span>
                  <span className="count">{jobs.length}</span>
                </button>
                {SERVICE_TYPES.map(cat => (
                  <button
                    key={cat.id}
                    className={`category-item ${filter === cat.id ? 'active' : ''}`}
                    onClick={() => setFilter(cat.id)}
                  >
                    <span style={{ color: cat.color }}>{cat.icon}</span>
                    <span>{cat.name}</span>
                    <span className="count">{cat.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Distance Filter */}
            <div className="filter-section">
              <h4>Distance</h4>
              <div className="distance-slider">
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={distance}
                  onChange={(e) => setDistance(parseInt(e.target.value))}
                />
                <div className="distance-value">Within {distance} km</div>
              </div>
            </div>

            {/* Price Range */}
            <div className="filter-section">
              <h4>Budget Range</h4>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                />
              </div>
            </div>

            {/* Sort By */}
            <div className="filter-section">
              <h4>Sort By</h4>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="latest">Latest First</option>
                <option value="distance">Nearest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Jobs Grid */}
          <div className="jobs-main">
            {/* Stats Bar */}
            <div className="stats-bar">
              <div className="stat-item">
                <span className="stat-value">{filteredJobs.length}</span>
                <span className="stat-label">Jobs Found</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{savedJobs.length}</span>
                <span className="stat-label">Saved Jobs</span>
              </div>
              <button className="btn-my-orders" onClick={handleViewMyOrders}>
                <FaBell /> My Orders
              </button>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="loading-state">
                <FaSpinner className="spin" />
                <p>Finding best jobs for you...</p>
              </div>
            ) : (
              <>
                {/* Jobs Grid */}
                <div className="jobs-grid">
                  {filteredJobs.map(job => {
                    const urgency = getUrgencyColor(job.urgency);
                    return (
                      <div key={job.id} className="job-card">
                        {/* Card Header */}
                        <div className="card-header">
                          <div className="service-icon" style={{ background: `${urgency.bg}` }}>
                            {SERVICE_TYPES.find(c => c.id === job.category)?.icon || <FaWrench />}
                          </div>
                          <div className="job-info">
                            <h3>{job.service}</h3>
                            <p className="job-title">{job.title}</p>
                          </div>
                          <button 
                            className={`save-btn ${job.saved ? 'saved' : ''}`}
                            onClick={() => toggleSaveJob(job.id)}
                          >
                            {job.saved ? <FaBookmark /> : <FaRegBookmark />}
                          </button>
                        </div>

                        {/* Urgency Badge */}
                        <span className="urgency-badge" style={{ background: urgency.bg, color: urgency.text }}>
                          <FaExclamationCircle /> {urgency.label}
                        </span>

                        {/* Description */}
                        <p className="job-description">{job.description}</p>

                        {/* Details Grid */}
                        <div className="details-grid">
                          <div className="detail">
                            <FaMapMarkerAlt className="detail-icon" />
                            <div>
                              <span className="label">Location</span>
                              <span className="value">{job.location}</span>
                              <span className="distance">{job.distance} km away</span>
                            </div>
                          </div>
                          <div className="detail">
                            <FaUser className="detail-icon" />
                            <div>
                              <span className="label">Customer</span>
                              <span className="value">{job.customer}</span>
                              <span className="rating">
                                <FaStar /> {job.customerRating} ({job.completedJobs}+ jobs)
                              </span>
                            </div>
                          </div>
                          <div className="detail">
                            <FaRupeeSign className="detail-icon" />
                            <div>
                              <span className="label">Budget</span>
                              <span className="value budget">{job.budget}</span>
                            </div>
                          </div>
                          <div className="detail">
                            <FaClock className="detail-icon" />
                            <div>
                              <span className="label">Posted</span>
                              <span className="value">{job.postedTime}</span>
                              <span className="bids">{job.bids} orders placed</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="job-actions">
                          <button 
                            className="btn-place-order"
                            onClick={() => handlePlaceOrder(job)}
                          >
                            Place Order <FaArrowRight />
                          </button>
                          <button className="btn-share">
                            <FaShare />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Empty State */}
                {filteredJobs.length === 0 && (
                  <div className="empty-state">
                    <FaSearch className="empty-icon" />
                    <h3>No jobs found</h3>
                    <p>Try adjusting your filters or search criteria</p>
                    <button onClick={() => {
                      setFilter('all');
                      setSearchQuery('');
                      setPriceRange([0, 10000]);
                      setDistance(50);
                    }}>
                      Clear All Filters
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Pro Tips */}
            <div className="pro-tips">
              <h4>💡 Pro Tips for Winning Orders</h4>
              <div className="tips-grid">
                <div className="tip">
                  <FaCheckCircle className="tip-icon" />
                  <div>
                    <strong>Respond Quickly</strong>
                    <p>Jobs with earliest orders win 80% of contracts</p>
                  </div>
                </div>
                <div className="tip">
                  <FaCheckCircle className="tip-icon" />
                  <div>
                    <strong>Competitive Pricing</strong>
                    <p>Order within 10% of average budget for best results</p>
                  </div>
                </div>
                <div className="tip">
                  <FaCheckCircle className="tip-icon" />
                  <div>
                    <strong>Complete Profile</strong>
                    <p>Providers with verified profiles get 3x more orders</p>
                  </div>
                </div>
                <div className="tip">
                  <FaCheckCircle className="tip-icon" />
                  <div>
                    <strong>Be Professional</strong>
                    <p>Include a friendly message with your order</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .all-services {
          background: linear-gradient(145deg, #f8fafc, #ffffff);
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Hero Banner */
        .services-hero {
          background: linear-gradient(145deg, #0f172a, #1e293b);
          padding: 60px 0;
          margin-bottom: 40px;
          position: relative;
          overflow: hidden;
        }

        .services-hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 30% 50%, rgba(52,152,219,0.1) 0%, transparent 50%);
        }

        .hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          color: white;
        }

        .live-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 20px;
          background: rgba(255,255,255,0.1);
          border-radius: 40px;
          margin-bottom: 30px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
        }

        .pulse-dot {
          width: 10px;
          height: 10px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .live-text {
          font-weight: 600;
          font-size: 14px;
          color: white;
        }

        .hero-content h1 {
          font-size: 48px;
          font-weight: 800;
          margin: 0 0 16px;
          background: linear-gradient(145deg, #fff, #e2e8f0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-content p {
          font-size: 18px;
          color: #94a3b8;
          margin-bottom: 40px;
        }

        /* Search Container */
        .search-container {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          gap: 16px;
          background: white;
          padding: 8px;
          border-radius: 60px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }

        .search-icon {
          position: absolute;
          left: 24px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 18px;
        }

        .search-container input {
          flex: 1;
          padding: 16px 24px 16px 56px;
          border: none;
          border-radius: 60px;
          font-size: 16px;
          background: transparent;
        }

        .search-container input:focus {
          outline: none;
        }

        .filter-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 40px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .filter-toggle:hover {
          background: #2980b9;
        }

        /* Layout */
        .services-layout {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 30px;
          position: relative;
        }

        /* Filters Sidebar */
        .filters-sidebar {
          background: white;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
          border: 1px solid #e2e8f0;
          height: fit-content;
          position: sticky;
          top: 100px;
        }

        .filters-header {
          display: none;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .close-filters {
          display: none;
          font-size: 24px;
          background: none;
          border: none;
          cursor: pointer;
          color: #64748b;
        }

        .filter-section {
          margin-bottom: 30px;
        }

        .filter-section h4 {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 16px;
        }

        .category-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .category-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border: none;
          background: none;
          border-radius: 10px;
          color: #475569;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
        }

        .category-item:hover {
          background: #f8fafc;
        }

        .category-item.active {
          background: #eff6ff;
          color: #3498db;
          font-weight: 500;
        }

        .category-item span:first-child {
          font-size: 18px;
        }

        .category-item .count {
          margin-left: auto;
          background: #e2e8f0;
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 12px;
          color: #475569;
        }

        .distance-slider {
          padding: 0 4px;
        }

        .distance-slider input {
          width: 100%;
          margin-bottom: 12px;
        }

        .distance-value {
          text-align: center;
          font-size: 14px;
          color: #3498db;
          font-weight: 600;
        }

        .price-inputs {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .price-inputs input {
          flex: 1;
          padding: 10px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
        }

        .filter-section select {
          width: 100%;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          color: #0f172a;
          background: white;
        }

        /* Jobs Main */
        .jobs-main {
          flex: 1;
        }

        /* Stats Bar */
        .stats-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: white;
          padding: 20px 24px;
          border-radius: 16px;
          margin-bottom: 24px;
          border: 1px solid #e2e8f0;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.2;
        }

        .stat-label {
          font-size: 13px;
          color: #64748b;
        }

        .btn-my-orders {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(145deg, #3498db, #2980b9);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-my-orders:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(52,152,219,0.3);
        }

        /* Jobs Grid */
        .jobs-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          margin-bottom: 40px;
        }

        .job-card {
          background: white;
          border-radius: 20px;
          padding: 24px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s;
          position: relative;
        }

        .job-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.06);
          border-color: transparent;
        }

        .card-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 16px;
        }

        .service-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;
        }

        .job-info {
          flex: 1;
        }

        .job-info h3 {
          margin: 0 0 4px;
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
        }

        .job-title {
          margin: 0;
          font-size: 14px;
          color: #64748b;
        }

        .save-btn {
          background: none;
          border: none;
          font-size: 20px;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s;
        }

        .save-btn.saved {
          color: #f59e0b;
        }

        .urgency-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .job-description {
          color: #475569;
          font-size: 14px;
          line-height: 1.6;
          margin: 0 0 20px;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 20px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 16px;
        }

        .detail {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .detail-icon {
          font-size: 16px;
          color: #3498db;
          margin-top: 2px;
        }

        .detail div {
          display: flex;
          flex-direction: column;
        }

        .label {
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .value {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
        }

        .value.budget {
          color: #10b981;
        }

        .distance, .bids, .rating {
          font-size: 11px;
          color: #64748b;
        }

        .rating svg {
          color: #f59e0b;
        }

        .job-actions {
          display: flex;
          gap: 12px;
        }

        .btn-place-order {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px;
          background: linear-gradient(145deg, #3498db, #2980b9);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-place-order:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(52,152,219,0.3);
        }

        .btn-share {
          padding: 14px;
          background: white;
          color: #64748b;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-share:hover {
          background: #f8fafc;
          color: #3498db;
        }

        /* Loading State */
        .loading-state {
          text-align: center;
          padding: 60px;
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
        }

        .loading-state .spin {
          font-size: 40px;
          color: #3498db;
          animation: spin 1s linear infinite;
        }

        .loading-state p {
          margin-top: 20px;
          color: #64748b;
          font-size: 16px;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 60px;
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
        }

        .empty-icon {
          font-size: 48px;
          color: #cbd5e1;
          margin-bottom: 20px;
        }

        .empty-state h3 {
          color: #0f172a;
          margin-bottom: 8px;
        }

        .empty-state p {
          color: #64748b;
          margin-bottom: 24px;
        }

        .empty-state button {
          padding: 12px 24px;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
        }

        /* Pro Tips */
        .pro-tips {
          background: white;
          border-radius: 20px;
          padding: 30px;
          border: 1px solid #e2e8f0;
          margin-top: 40px;
        }

        .pro-tips h4 {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 24px;
        }

        .tips-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .tip {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .tip-icon {
          color: #10b981;
          font-size: 20px;
          flex-shrink: 0;
        }

        .tip strong {
          display: block;
          font-size: 15px;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .tip p {
          margin: 0;
          font-size: 13px;
          color: #64748b;
          line-height: 1.5;
        }

        /* Animations */
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .spin {
          animation: spin 1s linear infinite;
          display: inline-block;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .services-layout {
            grid-template-columns: 1fr;
          }

          .filters-sidebar {
            position: fixed;
            top: 0;
            left: -100%;
            width: 300px;
            height: 100vh;
            z-index: 1001;
            border-radius: 0;
            transition: left 0.3s ease;
            overflow-y: auto;
          }

          .filters-sidebar.show {
            left: 0;
          }

          .filters-header {
            display: flex;
          }

          .close-filters {
            display: block;
          }

          .tips-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .hero-content h1 {
            font-size: 32px;
          }

          .search-container {
            flex-direction: column;
            border-radius: 20px;
          }

          .stats-bar {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
            text-align: center;
          }

          .details-grid {
            grid-template-columns: 1fr;
          }

          .tips-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Allservices;
