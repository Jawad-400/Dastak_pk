import React from 'react';
import { 
  FaShieldAlt, FaUserSecret, FaCookieBite, FaDatabase,
  FaEnvelope, FaPhone, FaLock, FaGlobe
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Privacy = () => {
  const lastUpdated = "March 15, 2025";

  const sections = [
    {
      icon: <FaDatabase />,
      title: 'Information We Collect',
      items: [
        'Name, phone number, email address',
        'Profile photos and CNIC (for providers)',
        'Location data for service matching',
        'Payment information (processed securely)',
        'Chat messages and communications',
        'Device information and usage data'
      ]
    },
    {
      icon: <FaUserSecret />,
      title: 'How We Use Your Information',
      items: [
        'Connect you with service providers',
        'Process payments securely',
        'Verify provider credentials',
        'Improve our services',
        'Send important updates',
        'Prevent fraud and abuse'
      ]
    },
    {
      icon: <FaLock />,
      title: 'Data Security',
      items: [
        '256-bit SSL encryption',
        'Secure data centers',
        'Regular security audits',
        'Access controls and authentication',
        'Encrypted backups',
        '24/7 monitoring'
      ]
    },
    {
      icon: <FaCookieBite />,
      title: 'Cookies & Tracking',
      items: [
        'Essential cookies for site function',
        'Analytics cookies to improve service',
        'Preference cookies for settings',
        'No third-party tracking cookies',
        'You can control cookie settings',
        'Cookies expire after 30 days'
      ]
    },
    {
      icon: <FaGlobe />,
      title: 'Information Sharing',
      items: [
        'Providers see your contact info after job acceptance',
        'We never sell your data',
        'Law enforcement when required',
        'Service providers for operations',
        'Anonymized data for analytics',
        'With your consent only'
      ]
    },
    {
      icon: <FaEnvelope />,
      title: 'Your Rights',
      items: [
        'Access your personal data',
        'Correct inaccurate information',
        'Delete your account',
        'Export your data',
        'Opt-out of marketing',
        'Withdraw consent anytime'
      ]
    }
  ];

  return (
    <div className="privacy-page">
      {/* Hero Section */}
      <div className="privacy-hero">
        <div className="hero-particles"></div>
        <div className="container">
          <FaShieldAlt className="hero-icon" />
          <h1>Privacy Policy</h1>
          <p className="hero-subtitle">
            How we protect and handle your personal information
          </p>
          <div className="last-updated">
            Last Updated: {lastUpdated}
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="intro-section">
        <div className="container">
          <div className="intro-card">
            <h2>Your Privacy Matters</h2>
            <p>
              At Dastak, we take your privacy seriously. This policy explains how we collect, 
              use, and protect your personal information when you use our platform.
            </p>
            <div className="trust-badge">
              <FaLock /> 100% Secure & Encrypted
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Sections */}
      <div className="privacy-sections">
        <div className="container">
          <div className="sections-grid">
            {sections.map((section, index) => (
              <div key={index} className="section-card">
                <div className="section-header">
                  <div className="section-icon">{section.icon}</div>
                  <h2>{section.title}</h2>
                </div>
                <ul className="section-list">
                  {section.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Retention */}
      <div className="retention-section">
        <div className="container">
          <div className="retention-card">
            <h3>Data Retention Period</h3>
            <div className="retention-grid">
              <div className="retention-item">
                <span className="retention-type">Account Information</span>
                <span className="retention-period">Until account deletion</span>
              </div>
              <div className="retention-item">
                <span className="retention-type">Transaction History</span>
                <span className="retention-period">7 years (legal requirement)</span>
              </div>
              <div className="retention-item">
                <span className="retention-type">Chat Messages</span>
                <span className="retention-period">2 years</span>
              </div>
              <div className="retention-item">
                <span className="retention-type">Verification Documents</span>
                <span className="retention-period">3 years</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="contact-section">
        <div className="container">
          <div className="contact-card">
            <h3>Privacy Questions?</h3>
            <p>Contact our Data Protection Officer</p>
            <div className="contact-methods">
              <a href="mailto:privacy@dastak.pk" className="contact-method">
                <FaEnvelope /> privacy@dastak.pk
              </a>
              <a href="tel:+923295493781" className="contact-method">
                <FaPhone /> +92 329 5493781
              </a>
            </div>
            <div className="response-time">
              We typically respond within 24-48 hours
            </div>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .privacy-page {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .privacy-hero {
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

        .privacy-hero h1 {
          color: white;
          font-size: 48px;
          font-weight: 800;
          margin: 0 0 20px;
        }

        .hero-subtitle {
          color: #94a3b8;
          font-size: 18px;
          max-width: 600px;
          margin: 0 auto 20px;
        }

        .last-updated {
          display: inline-block;
          padding: 8px 16px;
          background: rgba(255,255,255,0.1);
          border-radius: 30px;
          color: #e2e8f0;
          font-size: 14px;
        }

        .intro-section {
          padding: 60px 0;
        }

        .intro-card {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          background: white;
          border-radius: 30px;
          border: 1px solid #e2e8f0;
          text-align: center;
        }

        .intro-card h2 {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 20px;
        }

        .intro-card p {
          color: #475569;
          line-height: 1.7;
          margin-bottom: 30px;
        }

        .trust-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: #3b82f610;
          color: #3b82f6;
          border-radius: 40px;
          font-weight: 600;
        }

        .privacy-sections {
          padding: 60px 0;
          background: white;
        }

        .sections-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 30px;
        }

        .section-card {
          padding: 30px;
          background: #f8fafc;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .section-icon {
          width: 48px;
          height: 48px;
          background: #3b82f610;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3b82f6;
          font-size: 20px;
        }

        .section-header h2 {
          font-size: 20px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .section-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .section-list li {
          padding-left: 20px;
          margin-bottom: 10px;
          color: #475569;
          position: relative;
        }

        .section-list li::before {
          content: "•";
          color: #3b82f6;
          font-weight: bold;
          position: absolute;
          left: 0;
        }

        .retention-section {
          padding: 60px 0;
        }

        .retention-card {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          background: white;
          border-radius: 30px;
          border: 1px solid #e2e8f0;
        }

        .retention-card h3 {
          font-size: 24px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 30px;
          text-align: center;
        }

        .retention-grid {
          display: grid;
          gap: 20px;
        }

        .retention-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .retention-type {
          font-weight: 600;
          color: #334155;
        }

        .retention-period {
          color: #3b82f6;
          font-weight: 500;
        }

        .contact-section {
          padding: 60px 0;
          background: linear-gradient(145deg, #0f172a, #1e293b);
        }

        .contact-card {
          max-width: 600px;
          margin: 0 auto;
          padding: 40px;
          background: rgba(255,255,255,0.05);
          border-radius: 30px;
          border: 1px solid rgba(255,255,255,0.1);
          text-align: center;
        }

        .contact-card h3 {
          color: white;
          font-size: 28px;
          font-weight: 600;
          margin: 0 0 12px;
        }

        .contact-card p {
          color: #94a3b8;
          margin-bottom: 30px;
        }

        .contact-methods {
          display: flex;
          gap: 20px;
          justify-content: center;
          margin-bottom: 20px;
        }

        .contact-method {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(145deg, #3b82f6, #2563eb);
          color: white;
          text-decoration: none;
          border-radius: 30px;
          font-weight: 600;
          transition: all 0.3s;
        }

        .contact-method:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59,130,246,0.4);
        }

        .response-time {
          color: #94a3b8;
          font-size: 14px;
        }

        @media (max-width: 1024px) {
          .sections-grid {
            grid-template-columns: 1fr;
          }
          
          .contact-methods {
            flex-direction: column;
          }
        }

        @media (max-width: 768px) {
          .retention-item {
            flex-direction: column;
            gap: 8px;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Privacy;
