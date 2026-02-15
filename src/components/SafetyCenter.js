import React from 'react';
import { 
  FaShieldAlt, FaCheckCircle, FaExclamationTriangle, FaLock,
  FaUserCheck, FaCreditCard, FaComments, FaFile,
  FaPhone, FaEnvelope, FaArrowRight, FaStar
} from 'react-icons/fa';

const SafetyCenter = () => {
  const safetyGuides = [
    {
      icon: <FaUserCheck />,
      title: 'Verification Process',
      description: 'All providers are background verified before joining.',
      items: ['CNIC verification', 'Professional credentials', 'Reference checks', 'In-person interview']
    },
    {
      icon: <FaLock />,
      title: 'Secure Payments',
      description: 'Your money is held in escrow until job completion.',
      items: ['No payment until approval', 'Refund protection', 'Secure transactions', 'Transparent fees']
    },
    {
      icon: <FaComments />,
      title: 'Safe Communication',
      description: 'All communication happens within our platform.',
      items: ['Private messaging', 'No personal contact sharing', 'Chat history saved', 'Report inappropriate messages']
    },
    {
      icon: <FaFile />,
      title: 'Dispute Resolution',
      description: 'Fair process for resolving conflicts.',
      items: ['7-day dispute window', 'Evidence review', 'Mediation support', 'Fair outcomes']
    }
  ];

  const tips = [
    {
      title: 'For Customers',
      items: [
        'Always communicate through the platform',
        'Never pay outside the platform',
        'Check provider ratings and reviews',
        'Take photos of completed work',
        'Report any issues immediately'
      ]
    },
    {
      title: 'For Providers',
      items: [
        'Complete your profile fully',
        'Respond to requests promptly',
        'Communicate clearly about pricing',
        'Arrive on time for appointments',
        'Take before/after photos'
      ]
    }
  ];

  const badges = [
    { icon: <FaCheckCircle />, text: 'ID Verified', color: '#10b981' },
    { icon: <FaShieldAlt />, text: 'Background Checked', color: '#3b82f6' },
    { icon: <FaStar />, text: 'Top Rated', color: '#f59e0b' },
    { icon: <FaCreditCard />, text: 'Secure Payments', color: '#8b5cf6' }
  ];

  return (
    <div className="safety-center">
      {/* Hero Section */}
      <div className="safety-hero">
        <div className="hero-particles"></div>
        <div className="container">
          <FaShieldAlt className="hero-icon" />
          <h1>Your Safety is Our Priority</h1>
          <p className="hero-subtitle">
            We work hard to ensure every interaction on Dastak is safe and secure
          </p>
        </div>
      </div>

      {/* Badges Section */}
      <div className="badges-section">
        <div className="container">
          <div className="badges-grid">
            {badges.map((badge, index) => (
              <div key={index} className="badge-card">
                <div className="badge-icon" style={{ color: badge.color }}>{badge.icon}</div>
                <span className="badge-text">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Safety Guides */}
      <div className="guides-section">
        <div className="container">
          <h2>How We Keep You Safe</h2>
          <div className="guides-grid">
            {safetyGuides.map((guide, index) => (
              <div key={index} className="guide-card">
                <div className="guide-header">
                  <div className="guide-icon">{guide.icon}</div>
                  <h3>{guide.title}</h3>
                </div>
                <p className="guide-description">{guide.description}</p>
                <ul className="guide-list">
                  {guide.items.map((item, i) => (
                    <li key={i}><FaCheckCircle /> {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Safety Tips */}
      <div className="tips-section">
        <div className="container">
          <h2>Safety Tips</h2>
          <div className="tips-grid">
            {tips.map((tip, index) => (
              <div key={index} className="tip-card">
                <h3>{tip.title}</h3>
                <ul>
                  {tip.items.map((item, i) => (
                    <li key={i}><FaShieldAlt /> {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report Section */}
      <div className="report-section">
        <div className="container">
          <div className="report-card">
            <FaExclamationTriangle className="report-icon" />
            <h2>See something suspicious?</h2>
            <p>If you encounter any suspicious behavior, report it immediately</p>
            <div className="report-buttons">
              <button className="report-btn primary">
                Report a User
              </button>
              <button className="report-btn secondary">
                Contact Safety Team
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Safety Team */}
      <div className="safety-contact">
        <div className="container">
          <h3>Safety Team Contact</h3>
          <div className="contact-methods">
            <a href="mailto:safety@dastak.pk" className="contact-method">
              <FaEnvelope /> safety@dastak.pk
            </a>
            <a href="tel:+923295493781" className="contact-method">
              <FaPhone /> +92 329 5493781
            </a>
            <button className="contact-method">
              <FaComments /> Live Chat
            </button>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .safety-center {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .safety-hero {
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

        .hero-icon {
          font-size: 64px;
          color: #3b82f6;
          margin-bottom: 20px;
        }

        .safety-hero h1 {
          color: white;
          font-size: 48px;
          font-weight: 800;
          margin: 0 0 20px;
        }

        .hero-subtitle {
          color: #94a3b8;
          font-size: 18px;
          max-width: 600px;
          margin: 0 auto;
        }

        .badges-section {
          padding: 40px 0;
          background: white;
          border-bottom: 1px solid #e2e8f0;
        }

        .badges-grid {
          display: flex;
          justify-content: center;
          gap: 30px;
          flex-wrap: wrap;
        }

        .badge-card {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #f8fafc;
          border-radius: 30px;
          border: 1px solid #e2e8f0;
        }

        .badge-icon {
          font-size: 18px;
        }

        .badge-text {
          color: #334155;
          font-weight: 500;
        }

        .guides-section {
          padding: 80px 0;
        }

        .guides-section h2 {
          text-align: center;
          font-size: 36px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 40px;
        }

        .guides-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 30px;
        }

        .guide-card {
          background: white;
          padding: 30px;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
        }

        .guide-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .guide-icon {
          width: 56px;
          height: 56px;
          background: #3b82f610;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3b82f6;
          font-size: 24px;
        }

        .guide-header h3 {
          font-size: 20px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .guide-description {
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .guide-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .guide-list li {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #475569;
          margin-bottom: 8px;
        }

        .guide-list li svg {
          color: #10b981;
          font-size: 14px;
        }

        .tips-section {
          padding: 80px 0;
          background: white;
        }

        .tips-section h2 {
          text-align: center;
          font-size: 36px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 40px;
        }

        .tips-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 30px;
        }

        .tip-card {
          padding: 30px;
          background: #f8fafc;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
        }

        .tip-card h3 {
          font-size: 20px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 20px;
        }

        .tip-card ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .tip-card li {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #475569;
          margin-bottom: 12px;
        }

        .tip-card li svg {
          color: #3b82f6;
          font-size: 14px;
        }

        .report-section {
          padding: 80px 0;
        }

        .report-card {
          max-width: 700px;
          margin: 0 auto;
          padding: 40px;
          background: linear-gradient(145deg, #fff, #f8fafc);
          border-radius: 30px;
          text-align: center;
          border: 1px solid #e2e8f0;
        }

        .report-icon {
          font-size: 48px;
          color: #ef4444;
          margin-bottom: 20px;
        }

        .report-card h2 {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 12px;
        }

        .report-card p {
          color: #64748b;
          margin-bottom: 30px;
        }

        .report-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
        }

        .report-btn {
          padding: 12px 24px;
          border-radius: 30px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .report-btn.primary {
          background: linear-gradient(145deg, #3b82f6, #2563eb);
          color: white;
          border: none;
        }

        .report-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59,130,246,0.4);
        }

        .report-btn.secondary {
          background: white;
          color: #3b82f6;
          border: 2px solid #3b82f6;
        }

        .report-btn.secondary:hover {
          background: #3b82f610;
        }

        .safety-contact {
          padding: 60px 0;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }

        .safety-contact h3 {
          text-align: center;
          font-size: 24px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 30px;
        }

        .contact-methods {
          display: flex;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .contact-method {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 30px;
          color: #334155;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s;
        }

        .contact-method:hover {
          border-color: #3b82f6;
          color: #3b82f6;
          transform: translateY(-2px);
        }

        @media (max-width: 1024px) {
          .guides-grid,
          .tips-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .report-buttons {
            flex-direction: column;
          }
          
          .contact-methods {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};

export default SafetyCenter;