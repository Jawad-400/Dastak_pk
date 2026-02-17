import React, { useState, useEffect } from 'react';
import { socket } from '../Services/socket';

const ProviderJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  
  // Provider info
  const providerInfo = {
    id: 'provider_123', // Get from auth
    name: 'John Provider',
    service: 'Plumbing'
  };
  
  // Connect to WebSocket
  useEffect(() => {
    // Connect socket
    socket.connect();
    
    // Set up listeners
    socket.on('connect', () => {
      console.log('Provider connected to WebSocket');
      setConnected(true);
      
      // Announce provider is online
      socket.emit('provider_online', {
        provider_id: providerInfo.id,
        name: providerInfo.name,
        service: providerInfo.service
      });
    });
    
    // Listen for new requests
    socket.on('create_request', (data) => {
      console.log('🎯 NEW JOB RECEIVED:', data);
      
      // Add to jobs list
      setJobs(prev => [{
        id: data.id || `job_${Date.now()}`,
        title: data.data?.title || 'Service Request',
        description: data.data?.description || '',
        location: data.data?.location || '',
        budget: data.data?.budget || 'Negotiable',
        customer: data.data?.customer_name || 'Customer',
        schedule: data.data?.schedule || 'ASAP',
        timestamp: new Date().toLocaleTimeString(),
        status: 'pending'
      }, ...prev]);
      
      // Show notification
      if (Notification.permission === 'granted') {
        new Notification('🎯 New Service Request!', {
          body: `${data.data?.title} in ${data.data?.location}`,
          icon: '/logo.png'
        });
      }
    });
    
    // Listen for job accept confirmations
    socket.on('job_accepted', (data) => {
      console.log('Job accepted confirmation:', data);
      // Update job status
      setJobs(prev => prev.map(job => 
        job.id === data.request_id ? {...job, status: 'accepted'} : job
      ));
    });
    
    return () => {
      socket.off('create_request');
      socket.off('job_accepted');
    };
  }, []);
  
  // Request notification permission
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
  
  // Accept a job
  const acceptJob = (jobId) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? {...job, status: 'accepting'} : job
    ));
    
    // Send acceptance to server
    socket.emit('request_accepted', {
      request_id: jobId,
      provider_id: providerInfo.id,
      provider_name: providerInfo.name,
      timestamp: Date.now()
    });
    
    // Show success message
    setTimeout(() => {
      setJobs(prev => prev.map(job => 
        job.id === jobId ? {...job, status: 'accepted'} : job
      ));
      alert('✅ Job accepted! Contact the customer.');
    }, 1000);
  };
  
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1>🔧 Find Service Jobs</h1>
        <div style={{
          ...styles.statusBadge,
          backgroundColor: connected ? '#28a745' : '#dc3545'
        }}>
          {connected ? '✅ LIVE - Receiving Jobs' : '❌ OFFLINE'}
        </div>
        <p>Real-time service requests in your area</p>
      </div>
      
      {/* Stats */}
      <div style={styles.stats}>
        <div style={styles.statCard}>
          <h3>{jobs.length}</h3>
          <p>Total Jobs</p>
        </div>
        <div style={styles.statCard}>
          <h3>{jobs.filter(j => j.status === 'pending').length}</h3>
          <p>Available</p>
        </div>
        <div style={styles.statCard}>
          <h3>{jobs.filter(j => j.status === 'accepted').length}</h3>
          <p>Accepted</p>
        </div>
      </div>
      
      {/* Jobs List */}
      <div style={styles.jobsList}>
        <h2>📋 Available Jobs</h2>
        
        {jobs.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔍</div>
            <h3>No jobs available</h3>
            <p>New service requests will appear here in real-time</p>
            <small>Make sure you're connected to the WebSocket server</small>
          </div>
        ) : (
          jobs.map(job => (
            <div key={job.id} style={{
              ...styles.jobCard,
              borderLeft: job.status === 'accepted' ? '5px solid #28a745' : 
                         job.status === 'accepting' ? '5px solid #ffc107' : 
                         '5px solid #007bff'
            }}>
              <div style={styles.jobHeader}>
                <h3>{job.title}</h3>
                <span style={{
                  ...styles.jobStatus,
                  backgroundColor: job.status === 'pending' ? '#17a2b8' :
                                 job.status === 'accepting' ? '#ffc107' : '#28a745'
                }}>
                  {job.status.toUpperCase()}
                </span>
              </div>
              
              <p style={styles.jobDescription}>{job.description}</p>
              
              <div style={styles.jobDetails}>
                <div style={styles.detail}>
                  <span>📍</span>
                  <span>{job.location}</span>
                </div>
                <div style={styles.detail}>
                  <span>💰</span>
                  <span>{job.budget}</span>
                </div>
                <div style={styles.detail}>
                  <span>👤</span>
                  <span>{job.customer}</span>
                </div>
                <div style={styles.detail}>
                  <span>🕒</span>
                  <span>{job.schedule} • {job.timestamp}</span>
                </div>
              </div>
              
              {job.status === 'pending' && (
                <button 
                  onClick={() => acceptJob(job.id)}
                  style={styles.acceptBtn}
                >
                  ✅ Accept Job
                </button>
              )}
              
              {job.status === 'accepted' && (
                <div style={styles.acceptedMsg}>
                  ✅ You accepted this job
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* Connection Info */}
      <div style={styles.connectionInfo}>
        <small>
          {connected 
            ? `Connected as ${providerInfo.name} (${providerInfo.service})`
            : 'Connecting to job server...'
          }
        </small>
        <button 
          onClick={() => socket.connect()}
          style={styles.reconnectBtn}
        >
          🔄 Reconnect
        </button>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '5px 15px',
    borderRadius: '20px',
    color: 'white',
    fontWeight: 'bold',
    margin: '10px 0'
  },
  stats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'center',
    minWidth: '120px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  },
  jobsList: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '25px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#6c757d'
  },
  emptyIcon: {
    fontSize: '60px',
    marginBottom: '15px'
  },
  jobCard: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    marginBottom: '15px',
    borderRadius: '8px',
    borderLeft: '5px solid #007bff'
  },
  jobHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  jobStatus: {
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    color: 'white',
    fontWeight: 'bold'
  },
  jobDescription: {
    color: '#495057',
    marginBottom: '15px',
    lineHeight: '1.5'
  },
  jobDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '10px',
    marginBottom: '15px'
  },
  detail: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#6c757d'
  },
  acceptBtn: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s',
    '&:hover': {
      backgroundColor: '#218838'
    }
  },
  acceptedMsg: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '10px',
    borderRadius: '5px',
    textAlign: 'center'
  },
  connectionInfo: {
    marginTop: '20px',
    textAlign: 'center',
    color: '#6c757d'
  },
  reconnectBtn: {
    marginTop: '10px',
    padding: '8px 15px',
    backgroundColor: '#17a2b8',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  }
};

export default ProviderJobs;
