import React, { useState } from 'react';
import { 
  FaSearch, FaQuestionCircle, FaUser, FaTools, FaCreditCard,
  FaShieldAlt, FaComments, FaFile, FaDownload, FaVideo,
  FaPhone, FaEnvelope, FaMessage, FaArrowRight, FaChevronDown
} from 'react-icons/fa';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);

  const categories = [
    { icon: <FaUser />, title: 'For Customers', count: 12, color: '#3b82f6' },
    { icon: <FaTools />, title: 'For Providers', count: 15, color: '#10b981' },
    { icon: <FaCreditCard />, title: 'Payments', count: 8, color: '#f59e0b' },
    { icon: <FaShieldAlt />, title: 'Safety & Security', count: 6, color: '#8b5cf6' },
    { icon: <FaComments />, title: 'Chat & Communication', count: 5, color: '#ec4899' },
    { icon: <FaFile />, title: 'Accounts & Profile', count: 9, color: '#14b8a6' }
  ];

  const popularArticles = [
    {
      id: 1,
      title: 'How to post a service request',
      category: 'For Customers',
      views: '12.5k',
      icon: '📝'
    },
    {
      id: 2,
      title: 'How payments work on Dastak',
      category: 'Payments',
      views: '10.2k',
      icon: '💰'
    },
    {
      id: 3,
      title: 'Verification process for providers',
      category: 'For Providers',
      views: '8.7k',
      icon: '✅'
    },
    {
      id: 4,
      title: 'What to do if something goes wrong',
      category: 'Safety & Security',
      views: '7.3k',
      icon: '🛡️'
    }
  ];

  const faqs = [
    {
      id: 1,
      question: 'How do I post a service request?',
      answer: 'Click on "Post a Request" button, select your service category, describe your issue, set your budget and location, and submit. Providers in your area will receive your request instantly.',
      category: 'For Customers'
    },
    {
      id: 2,
      question: 'How are payments processed?',
      answer: 'Dastak uses an escrow system. When you accept a provider\'s quote, you pay into our secure escrow account. The money is held safely and only released to the provider after you confirm the job is completed to your satisfaction.',
      category: 'Payments'
    },
    {
      id: 3,
      question: 'How do I become a verified provider?',
      answer: 'Register on our Provider Portal, complete your profile with CNIC and professional details, and submit for verification. Our team reviews your application within 24-48 hours.',
      category: 'For Providers'
    },
    {
      id: 4,
      question: 'What if I\'m not satisfied with the service?',
      answer: 'If you\'re not satisfied with the service, you can raise a dispute within 7 days of completion. Our support team will review the case and mediate between you and the provider.',
      category: 'Safety & Security'
    },
    {
      id: 5,
      question: 'How do I reset my password?',
      answer: 'Click on "Forgot Password" on the login page. Enter your registered phone number, and you\'ll receive an OTP to reset your password.',
      category: 'Accounts & Profile'
    },
    {
      id: 6,
      question: 'Can I cancel a request after posting?',
      answer: 'Yes, you can cancel a pending request if no provider has accepted it yet. Once a provider accepts, you can still cancel but may be subject to our cancellation policy.',
      category: 'For Customers'
    }
  ];

  const guides = [
    { title: 'Getting Started Guide', type: 'PDF', size: '2.4 MB', icon: <FaDownload /> },
    { title: 'Safety Tips for Customers', type: 'Video', size: '15 min', icon: <FaVideo /> },
    { title: 'Provider Handbook', type: 'PDF', size: '3.1 MB', icon: <FaDownload /> },
    { title: 'Payment FAQ', type: 'PDF', size: '1.8 MB', icon: <FaDownload /> }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="help-center">
      {/* Hero Section */}
      <div className="help-hero">
        <div className="hero-particles"></div>
        <div className="container">
          <h1>How can we help you?</h1>
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="categories-section">
        <div className="container">
          <h2>Browse by Category</h2>
          <div className="categories-grid">
            {categories.map((category, index) => (
              <div key={index} className="category-card">
                <div className="category-icon" style={{ background: `${category.color}15`, color: category.color }}>
                  {category.icon}
                </div>
                <h3>{category.title}</h3>
                <p>{category.count} articles</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Articles */}
      <div className="popular-section">
        <div className="container">
          <h2>Popular Articles</h2>
          <div className="articles-grid">
            {popularArticles.map(article => (
              <div key={article.id} className="article-card">
                <span className="article-icon">{article.icon}</span>
                <div className="article-content">
                  <h3>{article.title}</h3>
                  <span className="article-category">{article.category}</span>
                  <span className="article-views">{article.views} views</span>
                </div>
                <FaArrowRight className="article-arrow" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="faq-section">
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            {filteredFaqs.map(faq => (
              <div key={faq.id} className="faq-item">
                <button
                  className={`faq-question ${activeFaq === faq.id ? 'active' : ''}`}
                  onClick={() => setActiveFaq(activeFaq === faq.id ? null : faq.id)}
                >
                  <span>{faq.question}</span>
                  <FaChevronDown className={`faq-icon ${activeFaq === faq.id ? 'rotated' : ''}`} />
                </button>
                {activeFaq === faq.id && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                    <span className="faq-category">Category: {faq.category}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Guides & Resources */}
      <div className="guides-section">
        <div className="container">
          <h2>Guides & Resources</h2>
          <div className="guides-grid">
            {guides.map((guide, index) => (
              <div key={index} className="guide-card">
                <div className="guide-info">
                  <h4>{guide.title}</h4>
                  <span className="guide-meta">{guide.type} • {guide.size}</span>
                </div>
                <button className="guide-download">
                  {guide.icon}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Still Need Help */}
      <div className="help-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Still need help?</h2>
            <p>Our support team is available 24/7 to assist you</p>
            <div className="cta-buttons">
              <button className="cta-btn primary">
                <FaComments /> Live Chat
              </button>
              <button className="cta-btn secondary">
                <FaEnvelope /> Email Us
              </button>
              <button className="cta-btn secondary">
                <FaPhone /> Call Support
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .help-center {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .help-hero {
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

        .help-hero h1 {
          color: white;
          font-size: 48px;
          font-weight: 800;
          margin: 0 0 30px;
        }

        .search-box {
          max-width: 600px;
          margin: 0 auto;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 20px;
        }

        .search-box input {
          width: 100%;
          padding: 18px 18px 18px 56px;
          border: none;
          border-radius: 40px;
          font-size: 16px;
          background: white;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }

        .search-box input:focus {
          outline: 2px solid #3b82f6;
        }

        .categories-section {
          padding: 60px 0;
          background: white;
        }

        .categories-section h2 {
          text-align: center;
          font-size: 32px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 40px;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .category-card {
          text-align: center;
          padding: 30px;
          background: #f8fafc;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s;
        }

        .category-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(59,130,246,0.1);
          border-color: #3b82f6;
        }

        .category-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          margin: 0 auto 16px;
        }

        .category-card h3 {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 8px;
        }

        .category-card p {
          color: #64748b;
          margin: 0;
        }

        .popular-section {
          padding: 60px 0;
        }

        .popular-section h2 {
          font-size: 32px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 40px;
        }

        .articles-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .article-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          transition: all 0.3s;
        }

        .article-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59,130,246,0.1);
          border-color: #3b82f6;
        }

        .article-icon {
          font-size: 32px;
        }

        .article-content {
          flex: 1;
        }

        .article-content h3 {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 4px;
        }

        .article-category {
          font-size: 12px;
          color: #3b82f6;
          margin-right: 12px;
        }

        .article-views {
          font-size: 12px;
          color: #94a3b8;
        }

        .article-arrow {
          color: #94a3b8;
          transition: all 0.3s;
        }

        .article-card:hover .article-arrow {
          color: #3b82f6;
          transform: translateX(4px);
        }

        .faq-section {
          padding: 60px 0;
          background: white;
        }

        .faq-section h2 {
          font-size: 32px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 40px;
          text-align: center;
        }

        .faq-list {
          max-width: 800px;
          margin: 0 auto;
        }

        .faq-item {
          margin-bottom: 16px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
        }

        .faq-question {
          width: 100%;
          padding: 20px;
          background: white;
          border: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          text-align: left;
        }

        .faq-question:hover {
          background: #f8fafc;
        }

        .faq-question.active {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .faq-icon {
          transition: transform 0.3s;
        }

        .faq-icon.rotated {
          transform: rotate(180deg);
        }

        .faq-answer {
          padding: 20px;
          background: #f8fafc;
        }

        .faq-answer p {
          color: #475569;
          line-height: 1.6;
          margin: 0 0 12px;
        }

        .faq-category {
          font-size: 12px;
          color: #3b82f6;
        }

        .guides-section {
          padding: 60px 0;
        }

        .guides-section h2 {
          font-size: 32px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 40px;
        }

        .guides-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .guide-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }

        .guide-info h4 {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 4px;
        }

        .guide-meta {
          font-size: 12px;
          color: #94a3b8;
        }

        .guide-download {
          padding: 10px;
          background: #3b82f610;
          color: #3b82f6;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .guide-download:hover {
          background: #3b82f6;
          color: white;
        }

        .help-cta {
          padding: 80px 0;
          background: linear-gradient(145deg, #0f172a, #1e293b);
        }

        .cta-content {
          text-align: center;
          color: white;
        }

        .cta-content h2 {
          font-size: 36px;
          font-weight: 700;
          margin: 0 0 16px;
        }

        .cta-content p {
          color: #94a3b8;
          font-size: 18px;
          margin-bottom: 30px;
        }

        .cta-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
        }

        .cta-btn {
          padding: 14px 28px;
          border-radius: 30px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
        }

        .cta-btn.primary {
          background: linear-gradient(145deg, #3b82f6, #2563eb);
          color: white;
          border: none;
        }

        .cta-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59,130,246,0.4);
        }

        .cta-btn.secondary {
          background: transparent;
          color: white;
          border: 2px solid #3b82f6;
        }

        .cta-btn.secondary:hover {
          background: #3b82f6;
        }

        @media (max-width: 1024px) {
          .categories-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .categories-grid,
          .articles-grid,
          .guides-grid {
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

export default HelpCenter;