import React, { useState } from 'react';
import { 
  FaCookieBite, FaCheck, FaTimes, FaInfoCircle,
  FaChartLine, FaCog, FaShieldAlt, FaGlobe
} from 'react-icons/fa';

const Cookies = () => {
  const [cookieSettings, setCookieSettings] = useState({
    essential: true,
    analytics: true,
    preferences: true,
    marketing: false
  });

  const lastUpdated = "March 15, 2025";

  const cookieTypes = [
    {
      id: 'essential',
      name: 'Essential Cookies',
      description: 'Required for the website to function properly. Cannot be disabled.',
      icon: <FaShieldAlt />,
      always: true
    },
    {
      id: 'analytics',
      name: 'Analytics Cookies',
      description: 'Help us understand how visitors interact with our website.',
      icon: <FaChartLine />
    },
    {
      id: 'preferences',
      name: 'Preference Cookies',
      description: 'Remember your settings and preferences.',
      icon: <FaCog />
    },
    {
      id: 'marketing',
      name: 'Marketing Cookies',
      description: 'Used to deliver relevant advertisements.',
      icon: <FaGlobe />
    }
  ];

  const cookieList = [
    {
      name: 'session_id',
      purpose: 'Maintain your login session',
      duration: 'Session',
      type: 'Essential'
    },
    {
      name: 'csrf_token',
      purpose: 'Security protection',
      duration: 'Session',
      type: 'Essential'
    },
    {
      name: '_ga',
      purpose: 'Google Analytics - user tracking',
      duration: '2 years',
      type: 'Analytics'
    },
    {
      name: 'preferences',
      purpose: 'Store user preferences',
      duration: '1 year',
      type: 'Preferences'
    }
  ];

  const handleSaveSettings = () => {
    // Save to localStorage or send to backend
    localStorage.setItem('cookieSettings', JSON.stringify(cookieSettings));
    alert('Cookie preferences saved!');
  };

  const handleAcceptAll = () => {
    setCookieSettings({
      essential: true,
      analytics: true,
      preferences: true,
      marketing: true
    });
  };

  const handleRejectAll = () => {
    setCookieSettings({
      essential: true,
      analytics: false,
      preferences: false,
      marketing: false
    });
  };

  return (
    <div className="cookies-page">
      {/* Hero Section */}
      <div className="cookies-hero">
        <div className="hero-particles"></div>
        <div className="container">
          <FaCookieBite className="hero-icon" />
          <h1>Cookie Policy</h1>
          <p className="hero-subtitle">
            How we use cookies to improve your experience
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
            <FaInfoCircle className="intro-icon" />
            <h2>What are Cookies?</h2>
            <p>
              Cookies are small text files stored on your device that help us provide 
              and improve our services. They remember your preferences, keep you logged in, 
              and help us understand how you use Dastak.
            </p>
          </div>
        </div>
      </div>

      {/* Cookie Settings */}
      <div className="settings-section">
        <div className="container">
          <h2>Cookie Preferences</h2>
          <div className="settings-card">
            {cookieTypes.map(cookie => (
              <div key={cookie.id} className="setting-item">
                <div className="setting-info">
                  <div className="setting-icon">{cookie.icon}</div>
                  <div>
                    <h3>{cookie.name}</h3>
                    <p>{cookie.description}</p>
                  </div>
                </div>
                <div className="setting-toggle">
                  {cookie.always ? (
                    <span className="always-enabled">Always On</span>
                  ) : (
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={cookieSettings[cookie.id]}
                        onChange={(e) => setCookieSettings({
                          ...cookieSettings,
                          [cookie.id]: e.target.checked
                        })}
                      />
                      <span className="slider"></span>
                    </label>
                  )}
                </div>
              </div>
            ))}

            <div className="settings-actions">
              <button className="save-btn" onClick={handleSaveSettings}>
                Save Preferences
              </button>
              <button className="accept-btn" onClick={handleAcceptAll}>
                Accept All
              </button>
              <button className="reject-btn" onClick={handleRejectAll}>
                Reject All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie List */}
      <div className="list-section">
        <div className="container">
          <h2>Cookies We Use</h2>
          <div className="table-card">
            <table className="cookie-table">
              <thead>
                <tr>
                  <th>Cookie Name</th>
                  <th>Purpose</th>
                  <th>Duration</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {cookieList.map((cookie, index) => (
                  <tr key={index}>
                    <td><code>{cookie.name}</code></td>
                    <td>{cookie.purpose}</td>
                    <td>{cookie.duration}</td>
                    <td>
                      <span className={`cookie-type ${cookie.type.toLowerCase()}`}>
                        {cookie.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Third-Party Cookies */}
      <div className="third-party-section">
        <div className="container">
          <div className="info-card">
            <h3>Third-Party Cookies</h3>
            <p>
              We use the following third-party services that may set cookies:
            </p>
            <ul>
              <li><strong>Google Analytics</strong> - Website analytics</li>
              <li><strong>Cloudflare</strong> - Security and performance</li>
              <li><strong>Facebook Pixel</strong> - Advertising (optional)</li>
            </ul>
            <p className="note">
              These third parties have their own privacy policies and cookie practices.
            </p>
          </div>
        </div>
      </div>

      {/* How to Control Cookies */}
      <div className="control-section">
        <div className="container">
          <div className="control-card">
            <h3>How to Control Cookies</h3>
            <p>
              You can control cookies through your browser settings:
            </p>
            <div className="browser-links">
              <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">
                Google Chrome
              </a>
              <a href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences" target="_blank" rel="noopener noreferrer">
                Mozilla Firefox
              </a>
              <a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer">
                Safari
              </a>
              <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">
                Microsoft Edge
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="contact-section">
        <div className="container">
          <div className="contact-card">
            <h3>Questions About Cookies?</h3>
            <p>Contact our privacy team</p>
            <a href="mailto:privacy@dastak.pk" className="contact-link">
              privacy@dastak.pk
            </a>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .cookies-page {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .cookies-hero {
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

        .cookies-hero h1 {
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

        .intro-icon {
          font-size: 48px;
          color: #3b82f6;
          margin-bottom: 20px;
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
          margin: 0;
        }

        .settings-section {
          padding: 60px 0;
          background: white;
        }

        .settings-section h2 {
          text-align: center;
          font-size: 32px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 40px;
        }

        .settings-card {
          max-width: 800px;
          margin: 0 auto;
          background: #f8fafc;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .setting-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .setting-item:last-child {
          border-bottom: none;
        }

        .setting-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .setting-icon {
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

        .setting-info h3 {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 4px;
        }

        .setting-info p {
          color: #64748b;
          margin: 0;
          font-size: 14px;
        }

        .always-enabled {
          padding: 6px 12px;
          background: #e2e8f0;
          border-radius: 20px;
          font-size: 13px;
          color: #475569;
        }

        .switch {
          position: relative;
          display: inline-block;
          width: 52px;
          height: 26px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #cbd5e1;
          transition: .3s;
          border-radius: 34px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .3s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: #3b82f6;
        }

        input:checked + .slider:before {
          transform: translateX(26px);
        }

        .settings-actions {
          display: flex;
          gap: 12px;
          padding: 24px;
          background: white;
          border-top: 1px solid #e2e8f0;
        }

        .save-btn, .accept-btn, .reject-btn {
          flex: 1;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .save-btn {
          background: linear-gradient(145deg, #3b82f6, #2563eb);
          color: white;
          border: none;
        }

        .save-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59,130,246,0.4);
        }

        .accept-btn {
          background: #10b981;
          color: white;
          border: none;
        }

        .reject-btn {
          background: #ef4444;
          color: white;
          border: none;
        }

        .list-section {
          padding: 60px 0;
        }

        .list-section h2 {
          text-align: center;
          font-size: 32px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 40px;
        }

        .table-card {
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          overflow-x: auto;
        }

        .cookie-table {
          width: 100%;
          border-collapse: collapse;
        }

        .cookie-table th {
          padding: 16px;
          text-align: left;
          background: #f8fafc;
          color: #334155;
          font-weight: 600;
          border-bottom: 2px solid #e2e8f0;
        }

        .cookie-table td {
          padding: 16px;
          border-bottom: 1px solid #e2e8f0;
          color: #475569;
        }

        .cookie-table code {
          background: #f1f5f9;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 13px;
        }

        .cookie-type {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .cookie-type.essential {
          background: #3b82f610;
          color: #3b82f6;
        }

        .cookie-type.analytics {
          background: #f59e0b10;
          color: #f59e0b;
        }

        .cookie-type.preferences {
          background: #8b5cf610;
          color: #8b5cf6;
        }

        .third-party-section {
          padding: 60px 0;
          background: white;
        }

        .info-card {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          background: #f8fafc;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
        }

        .info-card h3 {
          font-size: 24px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 20px;
        }

        .info-card p {
          color: #475569;
          margin-bottom: 20px;
        }

        .info-card ul {
          list-style: none;
          padding: 0;
          margin: 0 0 20px;
        }

        .info-card li {
          padding: 10px 0;
          border-bottom: 1px solid #e2e8f0;
          color: #475569;
        }

        .info-card li:last-child {
          border-bottom: none;
        }

        .note {
          font-size: 14px;
          color: #64748b;
          font-style: italic;
        }

        .control-section {
          padding: 60px 0;
        }

        .control-card {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          text-align: center;
        }

        .control-card h3 {
          font-size: 24px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 16px;
        }

        .control-card p {
          color: #64748b;
          margin-bottom: 30px;
        }

        .browser-links {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 16px;
        }

        .browser-links a {
          padding: 10px 20px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 30px;
          color: #334155;
          text-decoration: none;
          transition: all 0.3s;
        }

        .browser-links a:hover {
          border-color: #3b82f6;
          color: #3b82f6;
          transform: translateY(-2px);
        }

        .contact-section {
          padding: 60px 0;
          background: linear-gradient(145deg, #0f172a, #1e293b);
        }

        .contact-card {
          max-width: 500px;
          margin: 0 auto;
          padding: 40px;
          background: rgba(255,255,255,0.05);
          border-radius: 30px;
          border: 1px solid rgba(255,255,255,0.1);
          text-align: center;
        }

        .contact-card h3 {
          color: white;
          font-size: 24px;
          font-weight: 600;
          margin: 0 0 12px;
        }

        .contact-card p {
          color: #94a3b8;
          margin-bottom: 24px;
        }

        .contact-link {
          display: inline-block;
          padding: 12px 32px;
          background: linear-gradient(145deg, #3b82f6, #2563eb);
          color: white;
          text-decoration: none;
          border-radius: 30px;
          font-weight: 600;
          transition: all 0.3s;
        }

        .contact-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59,130,246,0.4);
        }

        @media (max-width: 768px) {
          .setting-item {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }
          
          .setting-info {
            flex-direction: column;
          }
          
          .settings-actions {
            flex-direction: column;
          }
          
          .cookie-table {
            font-size: 14px;
          }
          
          .browser-links {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default Cookies;