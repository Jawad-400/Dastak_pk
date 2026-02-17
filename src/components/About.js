import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, FaTrophy, FaHandshake, FaChartLine, FaShieldAlt,
  FaQuoteLeft, FaStar, FaCheckCircle, FaArrowRight
} from 'react-icons/fa';

const About = () => {
  const navigate = useNavigate();

  const stats = [
    { value: '50,000+', label: 'Happy Customers', icon: <FaUsers /> },
    { value: '10,000+', label: 'Verified Providers', icon: <FaHandshake /> },
    { value: '25,000+', label: 'Jobs Completed', icon: <FaChartLine /> },
    { value: '4.9/5', label: 'Average Rating', icon: <FaStar /> }
  ];

  const values = [
    {
      title: 'Trust & Safety',
      description: 'All professionals are background verified. Your safety is our priority.',
      icon: <FaShieldAlt />
    },
    {
      title: 'Quality Service',
      description: 'We ensure every job meets our quality standards before payment release.',
      icon: <FaTrophy />
    },
    {
      title: 'Fair Partnerships',
      description: 'We believe in win-win relationships with our service providers.',
      icon: <FaHandshake />
    }
  ];

  const team = [
    {
      name: 'Jawad Hassan',
      role: 'Founder & CEO',
      bio: 'Former tech lead with 10+ years in marketplace platforms.',
      image: '👨‍💼'
    },
    {
      name: 'Ali Hassan',
      role: 'Head of Operations',
      bio: 'Ensuring smooth experiences for customers and providers.',
      image: '👨‍💼'
    },
    {
      name: 'Bilal Hassan',
      role: 'Technical Lead',
      bio: 'Building the technology that connects Pakistan.',
      image: '👨‍💻'
    }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <div className="about-hero">
        <div className="hero-particles"></div>
        <div className="container">
          <h1>About DASTAK</h1>
          <p className="hero-subtitle">
            Pakistan's most trusted service marketplace, connecting verified professionals 
            with customers across the nation.
          </p>
          <div className="hero-stats">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-content">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="story-section">
        <div className="container">
          <div className="story-grid">
            <div className="story-content">
              <h2>Our Story</h2>
              <p className="story-quote">
                <FaQuoteLeft className="quote-icon" />
                DASTAK was born from a simple observation: finding reliable service 
                professionals in Pakistan was too difficult.
              </p>
              <p>
                In 2024, our founders experienced the frustration of finding a trustworthy 
                plumber. After multiple bad experiences, they realized there was a gap in 
                the market for a platform that truly vets service providers.
              </p>
              <p>
                Today, DASTAK has grown to serve thousands of customers across Pakistan's 
                major cities, with a network of over 10,000 verified professionals. We're 
                on a mission to make quality home services accessible, reliable, and 
                affordable for every Pakistani.
              </p>
              <button 
                className="cta-button"
                onClick={() => navigate('/post-request')}
              >
                Post Your First Request <FaArrowRight />
              </button>
            </div>
            <div className="story-image">
              <div className="image-grid">
                <div className="grid-item">🔧</div>
                <div className="grid-item">⚡</div>
                <div className="grid-item">🔨</div>
                <div className="grid-item">🎨</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="values-section">
        <div className="container">
          <h2>Our Core Values</h2>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="team-section">
        <div className="container">
          <h2>Meet Our Team</h2>
          <div className="team-grid">
            {team.map((member, index) => (
              <div key={index} className="team-card">
                <div className="team-avatar">{member.image}</div>
                <h3>{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-bio">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="about-cta">
        <div className="container">
          <h2>Ready to get started?</h2>
          <p>Join thousands of satisfied customers and verified professionals on DASTAK.</p>
          <div className="cta-buttons">
            <button 
              className="btn-primary"
              onClick={() => navigate('/post-request')}
            >
              Post a Request
            </button>
            <button 
              className="btn-secondary"
              onClick={() => navigate('/provider-portal')}
            >
              Become a Provider
            </button>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .about-page {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .about-hero {
          position: relative;
          background: linear-gradient(145deg, #0f172a, #1e293b);
          padding: 80px 0;
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

        .about-hero h1 {
          color: white;
          font-size: 48px;
          font-weight: 800;
          margin: 0 0 20px;
        }

        .hero-subtitle {
          color: #94a3b8;
          font-size: 18px;
          max-width: 800px;
          margin: 0 auto 40px;
          line-height: 1.6;
        }

        .hero-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          max-width: 900px;
          margin: 0 auto;
        }

        .stat-card {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stat-icon {
          font-size: 28px;
          color: #3b82f6;
        }

        .stat-content {
          text-align: left;
        }

        .stat-value {
          font-size: 20px;
          font-weight: 700;
          color: white;
        }

        .stat-label {
          font-size: 12px;
          color: #94a3b8;
        }

        .story-section {
          padding: 80px 0;
        }

        .story-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .story-content h2 {
          font-size: 36px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 24px;
        }

        .story-quote {
          font-size: 20px;
          line-height: 1.6;
          color: #334155;
          margin-bottom: 24px;
          position: relative;
          padding-left: 24px;
        }

        .quote-icon {
          position: absolute;
          left: -10px;
          top: -10px;
          font-size: 40px;
          color: #3b82f6;
          opacity: 0.2;
        }

        .story-content p {
          font-size: 16px;
          line-height: 1.7;
          color: #64748b;
          margin-bottom: 20px;
        }

        .cta-button {
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

        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59,130,246,0.4);
        }

        .image-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .grid-item {
          aspect-ratio: 1;
          background: white;
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.04);
          border: 1px solid #e2e8f0;
        }

        .values-section {
          padding: 80px 0;
          background: white;
        }

        .values-section h2 {
          text-align: center;
          font-size: 36px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 40px;
        }

        .values-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }

        .value-card {
          text-align: center;
          padding: 40px 30px;
          background: #f8fafc;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s;
        }

        .value-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(59,130,246,0.1);
          border-color: #3b82f6;
        }

        .value-icon {
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

        .value-card h3 {
          font-size: 20px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 12px;
        }

        .value-card p {
          color: #64748b;
          line-height: 1.6;
          margin: 0;
        }

        .team-section {
          padding: 80px 0;
        }

        .team-section h2 {
          text-align: center;
          font-size: 36px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 40px;
        }

        .team-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }

        .team-card {
          text-align: center;
          padding: 30px;
          background: white;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
        }

        .team-avatar {
          width: 100px;
          height: 100px;
          background: linear-gradient(145deg, #3b82f6, #2563eb);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          color: white;
          margin: 0 auto 20px;
        }

        .team-card h3 {
          font-size: 20px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 8px;
        }

        .team-role {
          color: #3b82f6;
          font-weight: 500;
          margin: 0 0 12px;
        }

        .team-bio {
          color: #64748b;
          line-height: 1.6;
          margin: 0;
        }

        .about-cta {
          padding: 80px 0;
          background: linear-gradient(145deg, #0f172a, #1e293b);
          text-align: center;
        }

        .about-cta h2 {
          color: white;
          font-size: 36px;
          font-weight: 700;
          margin: 0 0 16px;
        }

        .about-cta p {
          color: #94a3b8;
          font-size: 18px;
          margin-bottom: 30px;
        }

        .cta-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
        }

        .btn-primary, .btn-secondary {
          padding: 14px 32px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-primary {
          background: linear-gradient(145deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59,130,246,0.4);
        }

        .btn-secondary {
          background: rgba(255,255,255,0.1);
          color: white;
          border: 1px solid rgba(255,255,255,0.2);
        }

        .btn-secondary:hover {
          background: rgba(255,255,255,0.15);
          border-color: #3b82f6;
        }

        @media (max-width: 1024px) {
          .hero-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .story-grid {
            grid-template-columns: 1fr;
          }
          
          .values-grid,
          .team-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .hero-stats,
          .values-grid,
          .team-grid {
            grid-template-columns: 1fr;
          }
          
          .cta-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default About;
