import React, { useState } from 'react';
import { 
  FaQuestionCircle, FaSearch, FaUser, FaTools, FaCreditCard,
  FaShieldAlt, FaComments, FaFile, FaChevronDown, FaArrowRight
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const FAQs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openFaqs, setOpenFaqs] = useState({});

  const categories = [
    { id: 'all', name: 'All Questions', count: 24 },
    { id: 'customers', name: 'For Customers', count: 8 },
    { id: 'providers', name: 'For Providers', count: 7 },
    { id: 'payments', name: 'Payments', count: 5 },
    { id: 'safety', name: 'Safety', count: 4 }
  ];

  const faqs = [
    {
      id: 1,
      category: 'customers',
      question: 'How do I post a service request?',
      answer: 'Click on "Post a Request" button in the navigation bar. Select your service category, describe your issue, set your budget and location, then submit. Providers in your area will receive your request instantly.',
      popular: true
    },
    {
      id: 2,
      category: 'customers',
      question: 'How do I choose the right provider?',
      answer: 'Review provider profiles, check their ratings and reviews from previous customers, compare their pricing, and look at their verification status. You can also chat with them before accepting.',
      popular: true
    },
    {
      id: 3,
      category: 'customers',
      question: 'What if I\'m not satisfied with the service?',
      answer: 'If you\'re not satisfied with the service, you can raise a dispute within 7 days of completion. Our support team will review the case and mediate between you and the provider. Funds remain in escrow until resolution.',
      popular: true
    },
    {
      id: 4,
      category: 'providers',
      question: 'How do I become a verified provider?',
      answer: 'Register on our Provider Portal, complete your profile with your CNIC and professional details, and submit for verification. Our team reviews your application within 24-48 hours.',
      popular: true
    },
    {
      id: 5,
      category: 'providers',
      question: 'When do I get paid?',
      answer: 'Payments are released to your account within 24 hours after the customer confirms job completion. The amount will be transferred directly to your linked bank account.',
      popular: true
    },
    {
      id: 6,
      category: 'providers',
      question: 'What commission does Dastak charge?',
      answer: 'Dastak charges a 10% commission on completed jobs. This covers platform costs, verification, payment processing, and customer support.',
      popular: true
    },
    {
      id: 7,
      category: 'payments',
      question: 'How does escrow work?',
      answer: 'When you accept a provider\'s quote, you pay into our secure escrow account. The money is held safely and only released to the provider after you confirm the job is completed to your satisfaction.',
      popular: true
    },
    {
      id: 8,
      category: 'payments',
      question: 'What payment methods are accepted?',
      answer: 'We accept JazzCash, EasyPaisa, all major credit/debit cards, and bank transfers via IBFT. All payments are processed securely.',
      popular: false
    },
    {
      id: 9,
      category: 'payments',
      question: 'How do I request a refund?',
      answer: 'If you\'re not satisfied with the service, you can raise a dispute. If the dispute is resolved in your favor, the full amount will be refunded to your original payment method within 5-7 business days.',
      popular: false
    },
    {
      id: 10,
      category: 'safety',
      question: 'How are providers verified?',
      answer: 'All providers undergo CNIC verification, professional credential checks, and reference verification. Some categories require additional certification verification.',
      popular: true
    },
    {
      id: 11,
      category: 'safety',
      question: 'Is my personal information safe?',
      answer: 'Yes, we use 256-bit SSL encryption and follow industry best practices to protect your data. We never sell your information to third parties.',
      popular: true
    },
    {
      id: 12,
      category: 'safety',
      question: 'What should I do if I feel unsafe?',
      answer: 'If you ever feel unsafe, immediately stop communication and report the user through our platform. Our safety team will investigate and take appropriate action.',
      popular: false
    }
  ];

  const toggleFaq = (id) => {
    setOpenFaqs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const popularFaqs = faqs.filter(faq => faq.popular);

  return (
    <div className="faqs-page">
      {/* Hero Section */}
      <div className="faqs-hero">
        <div className="hero-particles"></div>
        <div className="container">
          <FaQuestionCircle className="hero-icon" />
          <h1>Frequently Asked Questions</h1>
          <p className="hero-subtitle">
            Find answers to common questions about using Dastak
          </p>
          
          {/* Search Bar */}
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search for questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Popular Questions */}
      <div className="popular-section">
        <div className="container">
          <h2>Popular Questions</h2>
          <div className="popular-grid">
            {popularFaqs.map(faq => (
              <div key={faq.id} className="popular-card" onClick={() => toggleFaq(faq.id)}>
                <h3>{faq.question}</h3>
                {openFaqs[faq.id] && (
                  <p className="popular-answer">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="categories-section">
        <div className="container">
          <div className="categories-list">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name}
                <span className="category-count">{category.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FAQs List */}
      <div className="faqs-list-section">
        <div className="container">
          <div className="faqs-container">
            {filteredFaqs.map(faq => (
              <div key={faq.id} className="faq-item">
                <button
                  className={`faq-question ${openFaqs[faq.id] ? 'active' : ''}`}
                  onClick={() => toggleFaq(faq.id)}
                >
                  <span>{faq.question}</span>
                  <FaChevronDown className={`faq-icon ${openFaqs[faq.id] ? 'rotated' : ''}`} />
                </button>
                {openFaqs[faq.id] && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                    <div className="faq-meta">
                      <span className="faq-category">
                        Category: {categories.find(c => c.id === faq.category)?.name}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredFaqs.length === 0 && (
              <div className="no-results">
                <p>No questions found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Still Need Help */}
      <div className="help-cta">
        <div className="container">
          <div className="cta-card">
            <h2>Still have questions?</h2>
            <p>Our support team is here to help you 24/7</p>
            <div className="cta-buttons">
              <Link to="/help" className="cta-btn primary">
                Visit Help Center
              </Link>
              <Link to="/contact" className="cta-btn secondary">
                Contact Support <FaArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .faqs-page {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .faqs-hero {
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

        .faqs-hero h1 {
          color: white;
          font-size: 48px;
          font-weight: 800;
          margin: 0 0 20px;
        }

        .hero-subtitle {
          color: #94a3b8;
          font-size: 18px;
          max-width: 600px;
          margin: 0 auto 30px;
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

        .popular-section {
          padding: 60px 0;
          background: white;
        }

        .popular-section h2 {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 30px;
          text-align: center;
        }

        .popular-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          max-width: 900px;
          margin: 0 auto;
        }

        .popular-card {
          padding: 20px;
          background: #f8fafc;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          transition: all 0.3s;
        }

        .popular-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59,130,246,0.1);
          border-color: #3b82f6;
        }

        .popular-card h3 {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .popular-answer {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 14px;
          line-height: 1.6;
        }

        .categories-section {
          padding: 30px 0;
          background: white;
          border-top: 1px solid #e2e8f0;
          border-bottom: 1px solid #e2e8f0;
        }

        .categories-list {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
        }

        .category-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 30px;
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }

        .category-btn:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .category-btn.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .category-count {
          padding: 2px 6px;
          background: rgba(255,255,255,0.2);
          border-radius: 12px;
          font-size: 11px;
        }

        .faqs-list-section {
          padding: 60px 0;
        }

        .faqs-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .faq-item {
          margin-bottom: 16px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          background: white;
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
          transition: all 0.3s;
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
          color: #94a3b8;
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

        .faq-meta {
          display: flex;
          justify-content: flex-end;
        }

        .faq-category {
          font-size: 12px;
          color: #3b82f6;
        }

        .no-results {
          text-align: center;
          padding: 60px;
          color: #64748b;
        }

        .help-cta {
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
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 16px;
        }

        .cta-card p {
          color: #94a3b8;
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
          text-decoration: none;
          transition: all 0.3s;
        }

        .cta-btn.primary {
          background: linear-gradient(145deg, #3b82f6, #2563eb);
          color: white;
        }

        .cta-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59,130,246,0.4);
        }

        .cta-btn.secondary {
          background: transparent;
          color: white;
          border: 2px solid #3b82f6;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .cta-btn.secondary:hover {
          background: #3b82f6;
        }

        @media (max-width: 1024px) {
          .popular-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .categories-list {
            flex-direction: column;
            align-items: stretch;
          }
          
          .cta-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default FAQs;