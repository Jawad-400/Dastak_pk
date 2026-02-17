import React from 'react';
import { 
  FaGavel, FaFileContract, FaUserLock, FaMoneyBillWave,
  FaShieldAlt, FaExclamationTriangle, FaCheckCircle, FaArrowRight
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Terms = () => {
  const lastUpdated = "March 15, 2025";

  const sections = [
    {
      icon: <FaUserLock />,
      title: '1. Account Terms',
      content: [
        'You must be 18 years or older to use Dastak',
        'You are responsible for maintaining your account security',
        'Provide accurate and complete information',
        'One person can only maintain one account',
        'You cannot transfer your account to another user'
      ]
    },
    {
      icon: <FaMoneyBillWave />,
      title: '2. Payments & Fees',
      content: [
        'Dastak charges a commission on completed jobs',
        'Current commission rate is 10% of the job amount',
        'Payments are held in escrow until job completion',
        'Funds are released within 24 hours of customer approval',
        'Refunds are processed within 5-7 business days'
      ]
    },
    {
      icon: <FaShieldAlt />,
      title: '3. User Responsibilities',
      content: [
        'Customers must pay for completed work',
        'Providers must deliver services as described',
        'Both parties must communicate respectfully',
        'Do not share personal contact information',
        'Report any suspicious activity immediately'
      ]
    },
    {
      icon: <FaExclamationTriangle />,
      title: '4. Prohibited Activities',
      content: [
        'No fraudulent transactions or fake jobs',
        'No harassment or abusive behavior',
        'No competing service solicitations',
        'No sharing of explicit or inappropriate content',
        'No attempting to bypass our payment system'
      ]
    },
    {
      icon: <FaGavel />,
      title: '5. Dispute Resolution',
      content: [
        'Disputes must be raised within 7 days',
        'Both parties can provide evidence',
        'Dastak mediates fairly between parties',
        'Decisions are final and binding',
        'Legal action may be taken for severe violations'
      ]
    },
    {
      icon: <FaFileContract />,
      title: '6. Cancellation Policy',
      content: [
        'Customers can cancel pending requests anytime',
        'Accepted jobs can be cancelled with mutual agreement',
        'Repeated cancellations may affect account standing',
        'Providers may cancel due to emergencies',
        'Fraudulent cancellations may result in account suspension'
      ]
    }
  ];

  return (
    <div className="terms-page">
      {/* Hero Section */}
      <div className="terms-hero">
        <div className="hero-particles"></div>
        <div className="container">
          <FaGavel className="hero-icon" />
          <h1>Terms of Use</h1>
          <p className="hero-subtitle">
            Please read these terms carefully before using Dastak
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
            <h2>Welcome to Dastak</h2>
            <p>
              By accessing or using Dastak's platform, you agree to be bound by these Terms of Use. 
              If you do not agree to all terms, please do not use our services.
            </p>
            <div className="intro-highlights">
              <div className="highlight">
                <FaCheckCircle className="highlight-icon" />
                <span>10,000+ active providers</span>
              </div>
              <div className="highlight">
                <FaCheckCircle className="highlight-icon" />
                <span>50,000+ happy customers</span>
              </div>
              <div className="highlight">
                <FaCheckCircle className="highlight-icon" />
                <span>4.9/5 rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms Sections */}
      <div className="terms-sections">
        <div className="container">
          <div className="sections-grid">
            {sections.map((section, index) => (
              <div key={index} className="section-card">
                <div className="section-header">
                  <div className="section-icon">{section.icon}</div>
                  <h2>{section.title}</h2>
                </div>
                <ul className="section-list">
                  {section.content.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="notes-section">
        <div className="container">
          <div className="notes-grid">
            <div className="note-card warning">
              <h3>⚠️ Important</h3>
              <p>
                Dastak is a marketplace platform connecting customers with service providers. 
                We are not a direct employer and do not control the quality or safety of services.
              </p>
            </div>
            <div className="note-card info">
              <h3>📋 Your Agreement</h3>
              <p>
                By using Dastak, you agree to resolve disputes professionally and respect 
                our community guidelines. We reserve the right to update these terms.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="terms-contact">
        <div className="container">
          <div className="contact-card">
            <h3>Questions about our Terms?</h3>
            <p>Our legal team is here to help</p>
            <div className="contact-links">
              <Link to="/contact" className="contact-link">
                Contact Us <FaArrowRight />
              </Link>
              <a href="mailto:legal@dastak.pk" className="contact-link">
                legal@dastak.pk
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .terms-page {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .terms-hero {
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

        .terms-hero h1 {
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

        .intro-highlights {
          display: flex;
          justify-content: center;
          gap: 30px;
          flex-wrap: wrap;
        }

        .highlight {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #10b981;
        }

        .highlight-icon {
          font-size: 18px;
        }

        .terms-sections {
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
          margin-bottom: 12px;
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

        .notes-section {
          padding: 60px 0;
        }

        .notes-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 30px;
        }

        .note-card {
          padding: 30px;
          border-radius: 20px;
        }

        .note-card.warning {
          background: #fef3c7;
          border: 1px solid #fbbf24;
        }

        .note-card.info {
          background: #dbeafe;
          border: 1px solid #3b82f6;
        }

        .note-card h3 {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 12px;
        }

        .note-card.warning h3 {
          color: #92400e;
        }

        .note-card.info h3 {
          color: #1e40af;
        }

        .note-card p {
          margin: 0;
          line-height: 1.6;
        }

        .note-card.warning p {
          color: #78350f;
        }

        .note-card.info p {
          color: #1e3a8a;
        }

        .terms-contact {
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

        .contact-links {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .contact-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
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

        .contact-link:last-child {
          background: transparent;
          border: 2px solid #3b82f6;
        }

        @media (max-width: 1024px) {
          .sections-grid,
          .notes-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .intro-highlights {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Terms;
