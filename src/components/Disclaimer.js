import React from 'react';
import { 
  FaExclamationTriangle, FaShieldAlt, FaGavel, FaFileContract,
  FaInfoCircle, FaCheckCircle, FaTimesCircle, FaArrowRight
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Disclaimer = () => {
  const lastUpdated = "March 15, 2025";

  const disclaimers = [
    {
      icon: <FaExclamationTriangle />,
      title: 'Platform Disclaimer',
      content: 'Dastak is a marketplace platform that connects customers with independent service providers. We are not an employer, agent, or representative of any provider. All services are provided directly by independent professionals.'
    },
    {
      icon: <FaShieldAlt />,
      title: 'Verification Disclaimer',
      content: 'While we verify provider credentials to the best of our ability, we cannot guarantee the accuracy of all information. Users should exercise their own judgment when hiring providers.'
    },
    {
      icon: <FaGavel />,
      title: 'Liability Disclaimer',
      content: 'Dastak is not liable for any disputes, damages, or losses arising from interactions between users. Our role is limited to facilitating connections and providing escrow payment services.'
    },
    {
      icon: <FaInfoCircle />,
      title: 'Information Disclaimer',
      content: 'The information on this website is for general purposes only. We make no representations about the accuracy, reliability, or completeness of any information.'
    }
  ];

  const limitations = [
    'We are not responsible for the quality of services provided',
    'We do not guarantee job completion or satisfaction',
    'We are not liable for any damages or losses',
    'We do not endorse any specific provider',
    'We are not responsible for user content or communications'
  ];

  const warranties = [
    'Service as-is without any warranties',
    'No guarantee of uninterrupted service',
    'Platform may be temporarily unavailable',
    'We may modify or discontinue features',
    'Third-party content not warranted'
  ];

  return (
    <div className="disclaimer-page">
      {/* Hero Section */}
      <div className="disclaimer-hero">
        <div className="hero-particles"></div>
        <div className="container">
          <FaExclamationTriangle className="hero-icon" />
          <h1>Disclaimer</h1>
          <p className="hero-subtitle">
            Important information about using Dastak platform
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
            <FaFileContract className="intro-icon" />
            <h2>Please Read Carefully</h2>
            <p>
              This disclaimer governs your use of the Dastak platform. By using our services,
              you acknowledge and agree to the terms stated here. If you do not agree with
              any part of this disclaimer, please do not use our platform.
            </p>
          </div>
        </div>
      </div>

      {/* Main Disclaimers */}
      <div className="disclaimers-section">
        <div className="container">
          <h2>Legal Disclaimers</h2>
          <div className="disclaimers-grid">
            {disclaimers.map((item, index) => (
              <div key={index} className="disclaimer-card">
                <div className="disclaimer-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Limitations & Warranties */}
      <div className="limits-section">
        <div className="container">
          <div className="limits-grid">
            <div className="limits-card">
              <h3>
                <FaTimesCircle className="limits-icon error" />
                Limitations of Liability
              </h3>
              <ul>
                {limitations.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="limits-card">
              <h3>
                <FaInfoCircle className="limits-icon info" />
                Disclaimer of Warranties
              </h3>
              <ul>
                {warranties.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* External Links */}
      <div className="external-section">
        <div className="container">
          <div className="external-card">
            <h3>External Links Disclaimer</h3>
            <p>
              Our platform may contain links to external websites that are not provided or
              maintained by Dastak. We do not guarantee the accuracy, relevance, timeliness,
              or completeness of any information on these external websites.
            </p>
          </div>
        </div>
      </div>

      {/* Professional Advice */}
      <div className="advice-section">
        <div className="container">
          <div className="advice-card">
            <h3>Not Professional Advice</h3>
            <p>
              The information provided on Dastak is for general informational purposes only
              and does not constitute professional advice. You should consult with qualified
              professionals for specific advice tailored to your situation.
            </p>
          </div>
        </div>
      </div>

      {/* Jurisdiction */}
      <div className="jurisdiction-section">
        <div className="container">
          <div className="jurisdiction-card">
            <h3>Governing Law & Jurisdiction</h3>
            <p>
              This disclaimer shall be governed by and construed in accordance with the laws
              of Pakistan. Any disputes relating to this disclaimer shall be subject to the
              exclusive jurisdiction of the courts in Lahore, Pakistan.
            </p>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="disclaimer-contact">
        <div className="container">
          <div className="contact-card">
            <h3>Questions About This Disclaimer?</h3>
            <p>Contact our legal team for clarification</p>
            <div className="contact-links">
              <a href="mailto:legal@dastak.pk" className="contact-link">
                legal@dastak.pk
              </a>
              <Link to="/contact" className="contact-link secondary">
                Contact Us <FaArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .disclaimer-page {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .disclaimer-hero {
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
          color: #f59e0b;
          margin-bottom: 20px;
        }

        .disclaimer-hero h1 {
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

        .disclaimers-section {
          padding: 60px 0;
          background: white;
        }

        .disclaimers-section h2 {
          text-align: center;
          font-size: 32px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 40px;
        }

        .disclaimers-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 30px;
        }

        .disclaimer-card {
          padding: 30px;
          background: #f8fafc;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          text-align: center;
        }

        .disclaimer-icon {
          width: 64px;
          height: 64px;
          background: #f59e0b10;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f59e0b;
          font-size: 28px;
          margin: 0 auto 20px;
        }

        .disclaimer-card h3 {
          font-size: 20px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 16px;
        }

        .disclaimer-card p {
          color: #64748b;
          line-height: 1.6;
          margin: 0;
        }

        .limits-section {
          padding: 60px 0;
        }

        .limits-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 30px;
        }

        .limits-card {
          padding: 30px;
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
        }

        .limits-card h3 {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 20px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 20px;
        }

        .limits-icon {
          font-size: 24px;
        }

        .limits-icon.error {
          color: #ef4444;
        }

        .limits-icon.info {
          color: #3b82f6;
        }

        .limits-card ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .limits-card li {
          padding-left: 20px;
          margin-bottom: 12px;
          color: #475569;
          position: relative;
        }

        .limits-card li::before {
          content: "•";
          color: #3b82f6;
          font-weight: bold;
          position: absolute;
          left: 0;
        }

        .external-section {
          padding: 60px 0;
          background: white;
        }

        .external-card {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          background: linear-gradient(145deg, #f8fafc, #f1f5f9);
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          text-align: center;
        }

        .external-card h3 {
          font-size: 24px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 16px;
        }

        .external-card p {
          color: #475569;
          line-height: 1.6;
          margin: 0;
        }

        .advice-section {
          padding: 60px 0;
        }

        .advice-card {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          text-align: center;
        }

        .advice-card h3 {
          font-size: 24px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 16px;
        }

        .advice-card p {
          color: #475569;
          line-height: 1.6;
          margin: 0;
        }

        .jurisdiction-section {
          padding: 60px 0;
          background: white;
        }

        .jurisdiction-card {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          background: linear-gradient(145deg, #f8fafc, #f1f5f9);
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          text-align: center;
        }

        .jurisdiction-card h3 {
          font-size: 24px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 16px;
        }

        .jurisdiction-card p {
          color: #475569;
          line-height: 1.6;
          margin: 0;
        }

        .disclaimer-contact {
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
          font-size: 24px;
          font-weight: 600;
          margin: 0 0 12px;
        }

        .contact-card p {
          color: #94a3b8;
          margin-bottom: 24px;
        }

        .contact-links {
          display: flex;
          gap: 16px;
          justify-content: center;
        }

        .contact-link {
          display: inline-flex;
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

        .contact-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59,130,246,0.4);
        }

        .contact-link.secondary {
          background: transparent;
          border: 2px solid #3b82f6;
        }

        @media (max-width: 1024px) {
          .disclaimers-grid,
          .limits-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .contact-links {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default Disclaimer;
