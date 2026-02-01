import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMapMarkerAlt, FaCalendarAlt, FaMoneyBill, FaUser, FaSearch, FaFilter } from 'react-icons/fa';

const FindJobs = () => {
  const navigate = useNavigate();
  
  const availableJobs = [
    { id: 1, title: 'Bathroom Plumbing', location: 'Gulshan', budget: '₹3,000', posted: '3 hours ago', category: 'Plumbing' },
    { id: 2, title: 'AC Gas Refill', location: 'DHA', budget: '₹2,500', posted: '5 hours ago', category: 'AC Repair' },
    { id: 3, title: 'Kitchen Sink Repair', location: 'Bahadurabad', budget: '₹1,800', posted: '1 day ago', category: 'Plumbing' },
    { id: 4, title: 'Electrical Wiring', location: 'North Nazimabad', budget: '₹4,000', posted: '2 days ago', category: 'Electrical' },
    { id: 5, title: 'Carpentry Work', location: 'Clifton', budget: '₹6,000', posted: '3 days ago', category: 'Carpentry' },
  ];

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header with Back Button */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '30px',
        paddingBottom: '15px',
        borderBottom: '1px solid #ddd'
      }}>
        <button
          onClick={() => navigate('/provider-dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            marginRight: '20px'
          }}
        >
          <FaArrowLeft /> Back to Dashboard
        </button>
        
        <h1 style={{ margin: 0, fontSize: '28px', color: '#333' }}>Find Jobs</h1>
      </div>

      {/* Search and Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        marginBottom: '30px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', flex: 1, minWidth: '300px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            backgroundColor: 'white',
            padding: '0 15px',
            border: '1px solid #ddd',
            borderRight: 'none',
            borderTopLeftRadius: '5px',
            borderBottomLeftRadius: '5px'
          }}>
            <FaSearch style={{ color: '#666' }} />
          </div>
          <input
            type="text"
            placeholder="Search jobs by title, location, or category..."
            style={{
              flex: 1,
              padding: '12px 15px',
              border: '1px solid #ddd',
              borderLeft: 'none',
              borderRadius: '0 5px 5px 0',
              fontSize: '16px'
            }}
          />
        </div>
        
        <select style={{
          padding: '12px 15px',
          border: '1px solid #ddd',
          borderRadius: '5px',
          backgroundColor: 'white',
          fontSize: '16px',
          minWidth: '180px'
        }}>
          <option>All Categories</option>
          <option>Plumbing</option>
          <option>AC Repair</option>
          <option>Electrical</option>
          <option>Carpentry</option>
          <option>Painting</option>
        </select>
        
        <button style={{
          padding: '12px 25px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FaFilter /> Filter Jobs
        </button>
      </div>

      {/* Available Jobs */}
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Available Jobs ({availableJobs.length})</h2>
      
      <div style={{ display: 'grid', gap: '20px' }}>
        {availableJobs.map(job => (
          <div key={job.id} style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '25px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            border: '1px solid #e9ecef',
            transition: 'transform 0.2s'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ flex: 1, minWidth: '300px' }}>
                <h3 style={{ marginBottom: '15px', color: '#333', fontSize: '20px' }}>{job.title}</h3>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
                    <FaMapMarkerAlt /> {job.location}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
                    <FaCalendarAlt /> {job.posted}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
                    <FaUser /> {job.category}
                  </div>
                </div>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: '#28a745',
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaMoneyBill /> {job.budget}
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '15px'
                  }}>
                    View Details
                  </button>
                  
                  <button style={{
                    padding: '10px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '15px'
                  }}>
                    Place order
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FindJobs;