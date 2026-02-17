import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaHome, FaTools, FaUser, FaBriefcase, FaInfoCircle,
  FaPhone, FaQuestionCircle, FaShieldAlt, FaFileContract,
  FaCookieBite, FaExclamationTriangle, FaNewspaper, FaUsers,
  FaEnvelope, FaComment, FaCreditCard, FaStar, FaMap
} from 'react-icons/fa';

const Sitemap = () => {
  const lastUpdated = "March 15, 2025";

  const sections = [
    {
      title: 'Main Pages',
      icon: <FaHome />,
      links: [
        { name: 'Home', path: '/', description: 'Return to homepage' },
        { name: 'Services', path: '/services', description: 'Browse all services' },
        { name: 'How It Works', path: '/how-it-works', description: 'Learn how Dastak works' },
        { name: 'Post a Request', path: '/post-request', description: 'Post a new service request' },
        { name: 'Customer Portal', path: '/customer-portal', description: 'Access your customer account' },
        { name: 'Provider Portal', path: '/provider-portal', description: 'Access your provider account' }
      ]
    },
    {
      title: 'Customer Pages',
      icon: <FaUser />,
      links: [
        { name: 'Customer Login', path: '/customer-login', description: 'Login to your account' },
        { name: 'Customer Orders', path: '/customer-orders', description: 'View your orders' },
        { name: 'Post Request', path: '/post-request', description: 'Post a new request' },
        { name: 'My Orders', path: '/my-orders', description: 'Track your orders' }
      ]
    },
    {
      title: 'Provider Pages',
      icon: <FaBriefcase />,
      links: [
        { name: 'Provider Login', path: '/provider-portal', description: 'Login to provider account' },
        { name: 'Provider Dashboard', path: '/provider-dashboard', description: 'Provider dashboard' },
        { name: 'Find Jobs', path: '/find-jobs', description: 'Browse available jobs' },
        { name: 'My Jobs', path: '/my-orders', description: 'View your accepted jobs' }
      ]
    },
    {
      title: 'Company Information',
      icon: <FaInfoCircle />,
      links: [
        { name: 'About Us', path: '/about', description: 'Learn about Dastak' },
        { name: 'Careers', path: '/careers', description: 'Join our team' },
        { name: 'Blog', path: '/blog', description: 'Read our latest articles' },
        { name: 'Press', path: '/press', description: 'Media resources' },
        { name: 'Contact Us', path: '/contact', description: 'Get in touch' }
      ]
    },
    {
      title: 'Support',
      icon: <FaQuestionCircle />,
      links: [
        { name: 'Help Center', path: '/help', description: 'Get help and support' },
        { name: 'FAQs', path: '/faqs', description: 'Frequently asked questions' },
        { name: 'Safety Center', path: '/safety', description: 'Safety guidelines' },
        { name: 'Report an Issue', path: '/report', description: 'Report a problem' }
      ]
    },
    {
      title: 'Legal',
      icon: <FaFileContract />,
      links: [
        { name: 'Terms of Use', path: '/terms', description: 'Terms and conditions' },
        { name: 'Privacy Policy', path: '/privacy', description: 'How we handle your data' },
        { name: 'Cookie Policy', path: '/cookies', description: 'Cookie information' },
        { name: 'Disclaimer', path: '/disclaimer', description: 'Legal disclaimer' }
      ]
    },
    {
      title: 'Service Categories',
      icon: <FaTools />,
      links: [
        { name: 'Plumbing', path: '/services/plumbing', description: 'Find plumbers' },
        { name: 'Electrical', path: '/services/electrical', description: 'Find electricians' },
        { name: 'Carpentry', path: '/services/carpentry', description: 'Find carpenters' },
        { name: 'Painting', path: '/services/painting', description: 'Find painters' },
        { name: 'AC Repair', path: '/services/ac-repair', description: 'Find AC technicians' },
        { name: 'Cleaning', path: '/services/cleaning', description: 'Find cleaners' },
        { name: 'All Services', path: '/services', description: 'View all services' }
      ]
    },
    {
      title: 'Quick Actions',
      icon: <FaStar />,
      links: [
        { name: 'Post a Request', path: '/post-request', description: 'Start a new request' },
        { name: 'Become a Provider', path: '/provider-portal', description: 'Join as provider' },
        { name: 'Customer Login', path: '/customer-login', description: 'Login as customer' },
        { name: 'Provider Login', path: '/provider-portal', description: 'Login as provider' }
      ]
    }
  ];

  return (
    <div className="sitemap-page">
      {/* Hero Section */}
      <div className="sitemap-hero">
        <div className="hero-particles"></div>
        <div className="container">
          <FaMap className="hero-icon" />
          <h1>Sitemap</h1>
          <p className="hero-subtitle">
            Navigate through all pages and sections of Dastak
          </p>
          <div className="last-updated">
            Last Updated: {lastUpdated}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">30+</span>
              <span className="stat-label">Total Pages</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">8</span>
              <span className="stat-label">Main Categories</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">16</span>
              <span className="stat-label">Service Types</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Support Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sitemap Grid */}
      <div className="sitemap-section">
        <div className="container">
          <div className="sitemap-grid">
            {sections.map((section, index) => (
              <div key={index} className="sitemap-card">
                <div className="card-header">
                  <span className="header-icon">{section.icon}</span>
                  <h2>{section.title}</h2>
                </div>
                <ul className="sitemap-links">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <Link to={link.path} className="sitemap-link">
                        <span className="link-name">{link.name}</span>
                        <span className="link-desc">{link.description}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Navigation Guide */}
      <div className="guide-section">
        <div className="container">
          <div className="guide-card">
            <h2>Quick Navigation Guide</h2>
            <div className="guide-grid">
              <div className="guide-item">
                <h3>👤 For Customers</h3>
                <p>Start by posting a request, then track it in your customer portal.</p>
                <Link to="/post-request" className="guide-link">
                  Post a Request →
                </Link>
              </div>
              <div className="guide-item">
                <h3>💼 For Providers</h3>
                <p>Register as a provider, complete your profile, and start earning.</p>
                <Link to="/provider-portal" className="guide-link">
                  Join as Provider →
                </Link>
              </div>
              <div className="guide-item">
                <h3>❓ Need Help?</h3>
                <p>Visit our Help Center or FAQs for quick answers.</p>
                <Link to="/help" className="guide-link">
                  Get Help →
                </Link>
              </div>
              <div className="guide-item">
                <h3>📞 Contact Us</h3>
                <p>Reach out to our support team for any questions.</p>
                <Link to="/contact" className="guide-link">
                  Contact Us →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* XML Sitemap Note */}
      <div className="xml-section">
        <div className="container">
          <div className="xml-card">
            <h3>For Developers & SEO</h3>
            <p>
              An XML sitemap is available for search engines at:
            </p>
            <code className="xml-link">
              https://www.dastak.pk/sitemap.xml
            </code>
            <p className="xml-note">
              This helps search engines discover and index all pages on our platform.
            </p>
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="contact-cta">
        <div className="container">
          <div className="cta-card">
            <h2>Can't find what you're looking for?</h2>
            <p>Our support team is here to help you navigate</p>
            <Link to="/contact" className="cta-button">
              Contact Support
            </Link>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .sitemap-page {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .sitemap-hero {
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

        .sitemap-hero h1 {
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

        .stats-section {
          padding: 40px 0;
          background: white;
          border-bottom: 1px solid #e2e8f0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .stat-card {
          text-align: center;
          padding: 20px;
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
          font-size: 14px;
        }

        .sitemap-section {
          padding: 60px 0;
        }

        .sitemap-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .sitemap-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s;
        }

        .sitemap-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(59,130,246,0.1);
          border-color: #3b82f6;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 2px solid #e2e8f0;
        }

        .header-icon {
          font-size: 24px;
          color: #3b82f6;
        }

        .card-header h2 {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .sitemap-links {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .sitemap-links li {
          margin-bottom: 12px;
        }

        .sitemap-link {
          text-decoration: none;
          display: block;
          padding: 8px 12px;
          border-radius: 8px;
          transition: all 0.3s;
        }

        .sitemap-link:hover {
          background: #f8fafc;
          transform: translateX(4px);
        }

        .link-name {
          display: block;
          color: #3b82f6;
          font-weight: 500;
          margin-bottom: 2px;
        }

        .link-desc {
          display: block;
          color: #64748b;
          font-size: 12px;
        }

        .guide-section {
          padding: 60px 0;
          background: white;
        }

        .guide-card {
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px;
          background: linear-gradient(145deg, #f8fafc, #f1f5f9);
          border-radius: 30px;
          border: 1px solid #e2e8f0;
        }

        .guide-card h2 {
          text-align: center;
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 40px;
        }

        .guide-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .guide-item {
          text-align: center;
          padding: 20px;
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }

        .guide-item h3 {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 12px;
        }

        .guide-item p {
          color: #64748b;
          font-size: 13px;
          line-height: 1.5;
          margin-bottom: 16px;
        }

        .guide-link {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 600;
          font-size: 13px;
        }

        .xml-section {
          padding: 60px 0;
        }

        .xml-card {
          max-width: 600px;
          margin: 0 auto;
          padding: 40px;
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          text-align: center;
        }

        .xml-card h3 {
          font-size: 20px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 16px;
        }

        .xml-card p {
          color: #64748b;
          margin-bottom: 20px;
        }

        .xml-link {
          display: inline-block;
          padding: 12px 24px;
          background: #f1f5f9;
          border-radius: 8px;
          font-family: monospace;
          color: #3b82f6;
          margin-bottom: 16px;
        }

        .xml-note {
          font-size: 13px;
          color: #94a3b8;
          margin: 0;
        }

        .contact-cta {
          padding: 60px 0;
          background: linear-gradient(145deg, #0f172a, #1e293b);
        }

        .cta-card {
          max-width: 600px;
          margin: 0 auto;
          padding: 40px;
          background: rgba(255,255,255,0.05);
          border-radius: 30px;
          border: 1px solid rgba(255,255,255,0.1);
          text-align: center;
        }

        .cta-card h2 {
          color: white;
          font-size: 28px;
          font-weight: 600;
          margin: 0 0 16px;
        }

        .cta-card p {
          color: #94a3b8;
          margin-bottom: 30px;
        }

        .cta-button {
          display: inline-block;
          padding: 14px 32px;
          background: linear-gradient(145deg, #3b82f6, #2563eb);
          color: white;
          text-decoration: none;
          border-radius: 30px;
          font-weight: 600;
          transition: all 0.3s;
        }

        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59,130,246,0.4);
        }

        @media (max-width: 1024px) {
          .sitemap-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .stats-grid,
          .sitemap-grid,
          .guide-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .stats-grid,
          .sitemap-grid,
          .guide-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Sitemap;
