import React, { useState } from 'react';
import { 
  FaBriefcase, FaMapMarkerAlt, FaClock, FaRupeeSign, 
  FaGraduationCap, FaHeart, FaUsers, FaRocket,
  FaCheckCircle, FaArrowRight, FaSearch, FaFilter
} from 'react-icons/fa';

const Careers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  const benefits = [
    { icon: <FaHeart />, title: 'Health Insurance', description: 'Comprehensive health coverage for you and family' },
    { icon: <FaGraduationCap />, title: 'Learning Budget', description: 'Annual stipend for courses and conferences' },
    { icon: <FaClock />, title: 'Flexible Hours', description: 'Work when you are most productive' },
    { icon: <FaUsers />, title: 'Great Culture', description: 'Collaborative, supportive, and fun environment' },
    { icon: <FaRocket />, title: 'Growth Opportunities', description: 'Clear career progression paths' },
    { icon: <FaRupeeSign />, title: 'Competitive Salary', description: 'Top-tier compensation package' }
  ];

  const departments = [
    'All Departments',
    'Engineering',
    'Product',
    'Sales & Marketing',
    'Operations',
    'Customer Support',
    'Human Resources'
  ];

  const jobs = [
    {
      id: 1,
      title: 'Senior Full Stack Developer',
      department: 'Engineering',
      location: 'Lahore (Hybrid)',
      type: 'Full-time',
      salary: 'Rs. 250K - 350K',
      posted: '2 days ago',
      description: 'Build scalable web applications and lead technical initiatives.',
      requirements: ['5+ years React/Node.js', 'MongoDB/PostgreSQL', 'System Design']
    },
    {
      id: 2,
      title: 'Product Manager',
      department: 'Product',
      location: 'Lahore',
      type: 'Full-time',
      salary: 'Rs. 300K - 400K',
      posted: '1 week ago',
      description: 'Drive product strategy and roadmap for our marketplace.',
      requirements: ['3+ years PM experience', 'Marketplace experience', 'Data-driven mindset']
    },
    {
      id: 3,
      title: 'Customer Support Specialist',
      department: 'Customer Support',
      location: 'Remote',
      type: 'Full-time',
      salary: 'Rs. 60K - 80K',
      posted: '3 days ago',
      description: 'Help customers and providers with their inquiries.',
      requirements: ['Excellent communication', 'Problem-solving skills', 'Empathy']
    },
    {
      id: 4,
      title: 'Sales Development Representative',
      department: 'Sales & Marketing',
      location: 'Lahore',
      type: 'Full-time',
      salary: 'Rs. 80K + Commission',
      posted: '5 days ago',
      description: 'Generate leads and onboard new service providers.',
      requirements: ['Sales experience', 'Excellent communication', 'Target-driven']
    },
    {
      id: 5,
      title: 'Operations Manager',
      department: 'Operations',
      location: 'Lahore',
      type: 'Full-time',
      salary: 'Rs. 150K - 200K',
      posted: '1 week ago',
      description: 'Oversee daily operations and provider relationships.',
      requirements: ['3+ years ops experience', 'Process optimization', 'Team management']
    },
    {
      id: 6,
      title: 'UI/UX Designer',
      department: 'Product',
      location: 'Lahore (Hybrid)',
      type: 'Full-time',
      salary: 'Rs. 180K - 250K',
      posted: '4 days ago',
      description: 'Design beautiful, intuitive experiences for our users.',
      requirements: ['3+ years UI/UX', 'Figma expert', 'Portfolio required']
    }
  ];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'all' || job.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="careers-page">
      {/* Hero Section */}
      <div className="careers-hero">
        <div className="hero-particles"></div>
        <div className="container">
          <h1>Join the DASTAK Team</h1>
          <p className="hero-subtitle">
            Help us build Pakistan's most trusted service marketplace. 
            We're looking for passionate individuals to join our journey.
          </p>
          <button className="primary-btn" onClick={() => document.getElementById('openings').scrollIntoView({ behavior: 'smooth' })}>
            View Open Positions <FaArrowRight />
          </button>
        </div>
      </div>

      {/* Why Join Us */}
      <div className="why-join-section">
        <div className="container">
          <h2>Why Work at DASTAK?</h2>
          <div className="benefits-grid">
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit-card">
                <div className="benefit-icon">{benefit.icon}</div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Life at DASTAK */}
      <div className="life-section">
        <div className="container">
          <div className="life-grid">
            <div className="life-content">
              <h2>Life at DASTAK</h2>
              <p className="life-quote">
                "The best part about working at DASTAK is the impact we create. 
                Every feature we build helps someone find work or get their problem solved."
              </p>
              <p className="life-author">— Sara Ahmed, Lead Developer</p>
              
              <div className="life-stats">
                <div className="life-stat">
                  <span className="stat-number">25+</span>
                  <span className="stat-label">Team Members</span>
                </div>
                <div className="life-stat">
                  <span className="stat-number">6</span>
                  <span className="stat-label">Cities</span>
                </div>
                <div className="life-stat">
                  <span className="stat-number">4.9/5</span>
                  <span className="stat-label">Employee Rating</span>
                </div>
              </div>
            </div>
            <div className="life-images">
              <div className="image-collage">
                <div className="collage-item item1">👥 Team Meeting</div>
                <div className="collage-item item2">🎉 Celebration</div>
                <div className="collage-item item3">💻 Hackathon</div>
                <div className="collage-item item4">🌴 Team Outing</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Open Positions */}
      <div id="openings" className="openings-section">
        <div className="container">
          <h2>Open Positions</h2>
          
          {/* Search and Filter */}
          <div className="search-filter">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search positions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-box">
              <FaFilter className="filter-icon" />
              <select 
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
              >
                {departments.map((dept, index) => (
                  <option key={index} value={index === 0 ? 'all' : dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Jobs List */}
          <div className="jobs-grid">
            {filteredJobs.map(job => (
              <div key={job.id} className="job-card">
                <div className="job-header">
                  <h3>{job.title}</h3>
                  <span className="job-badge">{job.department}</span>
                </div>
                
                <div className="job-meta">
                  <span><FaMapMarkerAlt /> {job.location}</span>
                  <span><FaClock /> {job.type}</span>
                  <span><FaRupeeSign /> {job.salary}</span>
                </div>

                <p className="job-description">{job.description}</p>

                <div className="job-requirements">
                  <strong>Requirements:</strong>
                  <ul>
                    {job.requirements.map((req, i) => (
                      <li key={i}><FaCheckCircle /> {req}</li>
                    ))}
                  </ul>
                </div>

                <div className="job-footer">
                  <span className="posted-date">Posted {job.posted}</span>
                  <button className="apply-btn">Apply Now</button>
                </div>
              </div>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="no-jobs">
              <p>No positions match your criteria. Check back later!</p>
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="careers-cta">
        <div className="container">
          <h2>Don't see the right role?</h2>
          <p>Send us your resume and we'll keep you in mind for future opportunities.</p>
          <button className="secondary-btn">
            Send Open Application
          </button>
        </div>
      </div>

      <style jsx="true">{`
        .careers-page {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .careers-hero {
          position: relative;
          background: linear-gradient(145deg, #0f172a, #1e293b);
          padding: 100px 0;
          overflow: hidden;
          text-align: center;
        }

        .hero-particles {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: radial-gradient(#3b82f6 1px, transparent 1px);
          background-size: 30px 30px;
          opacity: 0.2;
        }

        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          position: relative;
          z-index: 2;
        }

        .careers-hero h1 {
          color: white;
          font-size: 48px;
          font-weight: 800;
          margin: 0 0 20px;
        }

        .hero-subtitle {
          color: #94a3b8;
          font-size: 18px;
          max-width: 700px;
          margin: 0 auto 30px;
          line-height: 1.6;
        }

        .primary-btn {
          padding: 14px 32px;
          background: linear-gradient(145deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
        }

        .primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59,130,246,0.4);
        }

        .why-join-section {
          padding: 80px 0;
          background: white;
        }

        .why-join-section h2 {
          text-align: center;
          font-size: 36px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 50px;
        }

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }

        .benefit-card {
          text-align: center;
          padding: 30px;
          border-radius: 20px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          transition: all 0.3s;
        }

        .benefit-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(59,130,246,0.1);
          border-color: #3b82f6;
        }

        .benefit-icon {
          width: 64px;
          height: 64px;
          background: #3b82f610;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3b82f6;
          font-size: 28px;
          margin: 0 auto 20px;
        }

        .benefit-card h3 {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 10px;
        }

        .benefit-card p {
          color: #64748b;
          line-height: 1.6;
          margin: 0;
        }

        .life-section {
          padding: 80px 0;
        }

        .life-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .life-content h2 {
          font-size: 36px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 20px;
        }

        .life-quote {
          font-size: 20px;
          line-height: 1.6;
          color: #334155;
          font-style: italic;
          margin-bottom: 20px;
        }

        .life-author {
          color: #3b82f6;
          font-weight: 500;
          margin-bottom: 30px;
        }

        .life-stats {
          display: flex;
          gap: 30px;
        }

        .life-stat {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 28px;
          font-weight: 700;
          color: #3b82f6;
          margin-bottom: 4px;
        }

        .stat-label {
          color: #64748b;
          font-size: 13px;
        }

        .image-collage {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .collage-item {
          aspect-ratio: 1;
          background: linear-gradient(145deg, #1e293b, #0f172a);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
          border: 1px solid #3b82f630;
        }

        .openings-section {
          padding: 80px 0;
          background: white;
        }

        .openings-section h2 {
          text-align: center;
          font-size: 36px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 40px;
        }

        .search-filter {
          display: flex;
          gap: 20px;
          margin-bottom: 40px;
        }

        .search-box {
          flex: 1;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .search-box input {
          width: 100%;
          padding: 14px 14px 14px 48px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 16px;
          transition: all 0.3s;
        }

        .search-box input:focus {
          border-color: #3b82f6;
          outline: none;
        }

        .filter-box {
          position: relative;
          min-width: 200px;
        }

        .filter-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          z-index: 1;
        }

        .filter-box select {
          width: 100%;
          padding: 14px 14px 14px 48px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 16px;
          background: white;
          cursor: pointer;
          appearance: none;
        }

        .filter-box select:focus {
          border-color: #3b82f6;
          outline: none;
        }

        .jobs-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .job-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 24px;
          transition: all 0.3s;
        }

        .job-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(59,130,246,0.1);
          border-color: #3b82f6;
        }

        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .job-header h3 {
          font-size: 20px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .job-badge {
          padding: 4px 12px;
          background: #3b82f610;
          color: #3b82f6;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 600;
        }

        .job-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 16px;
        }

        .job-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #64748b;
          font-size: 13px;
        }

        .job-description {
          color: #334155;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .job-requirements {
          margin-bottom: 20px;
        }

        .job-requirements strong {
          display: block;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .job-requirements ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .job-requirements li {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #475569;
          font-size: 14px;
          margin-bottom: 6px;
        }

        .job-requirements li svg {
          color: #10b981;
          font-size: 14px;
        }

        .job-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }

        .posted-date {
          color: #94a3b8;
          font-size: 13px;
        }

        .apply-btn {
          padding: 8px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .apply-btn:hover {
          background: #2563eb;
          transform: translateY(-2px);
        }

        .no-jobs {
          text-align: center;
          padding: 60px;
          color: #64748b;
        }

        .careers-cta {
          padding: 80px 0;
          background: linear-gradient(145deg, #0f172a, #1e293b);
          text-align: center;
        }

        .careers-cta h2 {
          color: white;
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 16px;
        }

        .careers-cta p {
          color: #94a3b8;
          font-size: 18px;
          margin-bottom: 30px;
        }

        .secondary-btn {
          padding: 14px 32px;
          background: transparent;
          color: white;
          border: 2px solid #3b82f6;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .secondary-btn:hover {
          background: #3b82f6;
          transform: translateY(-2px);
        }

        @media (max-width: 1024px) {
          .benefits-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .life-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          
          .jobs-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .benefits-grid {
            grid-template-columns: 1fr;
          }
          
          .search-filter {
            flex-direction: column;
          }
          
          .filter-box {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Careers;