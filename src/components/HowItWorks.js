import React from 'react';
import { 
  FaClipboardList, FaUsers, FaMoneyBillWave, FaCheckCircle,
  FaSearch, FaRegHandshake, FaShieldAlt, FaCreditCard,
  FaUserPlus, FaToolbox, FaStar, FaClock,
  FaArrowRight, FaMobile, FaWhatsapp, FaRegBell
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const HowItWorks = () => {
  const navigate = useNavigate();

  const customerSteps = [
    {
      icon: <FaClipboardList />,
      title: "1. Post Your Request",
      description: "Describe your service need in detail - what, where, and when. Add photos if needed.",
      details: "Get matched with verified professionals in your area",
      color: "#3498db"
    },
    {
      icon: <FaUsers />,
      title: "2. Compare & Choose",
      description: "Review Orders and profiles from multiple providers. Check ratings, reviews, and pricing.",
      details: "Average 3 Orders within 30 minutes",
      color: "#f39c12"
    },
    {
      icon: <FaMoneyBillWave />,
      title: "3. Secure Payment",
      description: "Pay securely through DASTAK. Funds are held safely until job completion.",
      details: "100% money-back guarantee",
      color: "#2ecc71"
    },
    {
      icon: <FaCheckCircle />,
      title: "4. Job Complete",
      description: "Work gets done. Confirm completion, release payment, and rate your provider.",
      details: "Build trust with every completed task",
      color: "#9b59b6"
    }
  ];

  const providerSteps = [
    {
      icon: <FaUserPlus />,
      title: "1. Join as Provider",
      description: "Create your professional profile. Add your skills, experience, and service areas.",
      details: "Free registration, 10,000+ active providers",
      color: "#3498db"
    },
    {
      icon: <FaSearch />,
      title: "2. Find Jobs",
      description: "Browse live requests matching your services. Filter by location, budget, and urgency.",
      details: "Real-time notifications for new jobs",
      color: "#f39c12"
    },
    {
      icon: <FaRegHandshake />,
      title: "3. Accept & Deliver",
      description: "Accept jobs, communicate with customers, and deliver quality service.",
      details: "Build your reputation with every job",
      color: "#2ecc71"
    },
    {
      icon: <FaMoneyBillWave />,
      title: "4. Get Paid",
      description: "Receive secure payments directly to your account. Withdraw anytime.",
      details: "Average monthly earnings: 45,000 PKR",
      color: "#9b59b6"
    }
  ];

  const features = [
    {
      icon: <FaShieldAlt />,
      title: "Verified Professionals",
      description: "Every provider undergoes background verification"
    },
    {
      icon: <FaCreditCard />,
      title: "Secure Payments",
      description: "Your money is safe until you're satisfied"
    },
    {
      icon: <FaClock />,
      title: "24/7 Support",
      description: "We're here to help anytime you need"
    },
    {
      icon: <FaStar />,
      title: "4.9 Rating",
      description: "Trusted by 50,000+ customers"
    }
  ];

  const stats = [
    { value: "50,000+", label: "Happy Customers", icon: <FaUsers /> },
    { value: "10,000+", label: "Verified Providers", icon: <FaToolbox /> },
    { value: "25,000+", label: "Jobs Completed", icon: <FaCheckCircle /> },
    { value: "4.9/5", label: "Average Rating", icon: <FaStar /> }
  ];

  return (
    <section className="how-it-works" id="how-it-works">
      {/* Background Decoration */}
      <div className="how-bg-pattern"></div>
      
      <div className="container">
        {/* Header */}
        <div className="how-header">
          <div className="how-tag">
            <span className="how-tag-line">Simple Process</span>
          </div>
          <h2 className="how-title">
            How <span className="how-title-highlight">DASTAK</span> Works
          </h2>
          <p className="how-subtitle">
            Pakistan's most trusted platform connecting customers with verified service professionals
          </p>
        </div>

        {/* Stats Section */}
        <div className="how-stats">
          {stats.map((stat, index) => (
            <div key={index} className="how-stat-card">
              <div className="how-stat-icon">{stat.icon}</div>
              <div className="how-stat-content">
                <span className="how-stat-value">{stat.value}</span>
                <span className="how-stat-label">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Customer Steps */}
        <div className="how-section">
          <div className="how-section-header">
            <div className="how-section-icon">
              <FaUsers />
            </div>
            <h3 className="how-section-title">For Customers</h3>
            <p className="how-section-subtitle">Get your tasks done in 4 simple steps</p>
          </div>

          <div className="how-steps-grid">
            {customerSteps.map((step, index) => (
              <div key={index} className="how-step-card customer-card">
                <div 
                  className="how-step-icon-wrapper"
                  style={{ background: `linear-gradient(145deg, ${step.color}20, ${step.color}05)` }}
                >
                  <div 
                    className="how-step-icon"
                    style={{ color: step.color }}
                  >
                    {step.icon}
                  </div>
                  <div 
                    className="how-step-number"
                    style={{ background: step.color }}
                  >
                    {index + 1}
                  </div>
                </div>
                <h4 className="how-step-title">{step.title}</h4>
                <p className="how-step-desc">{step.description}</p>
                <div className="how-step-details">
                  <FaCheckCircle className="how-detail-icon" />
                  <span>{step.details}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="how-cta">
            <button 
              className="how-cta-btn how-cta-primary"
              onClick={() => navigate('/post-request')}
            >
              Post a Request <FaArrowRight />
            </button>
          </div>
        </div>

        {/* Provider Steps */}
        <div className="how-section how-provider-section">
          <div className="how-section-header">
            <div className="how-section-icon">
              <FaToolbox />
            </div>
            <h3 className="how-section-title">For Service Providers</h3>
            <p className="how-section-subtitle">Start earning in 4 simple steps</p>
          </div>

          <div className="how-steps-grid">
            {providerSteps.map((step, index) => (
              <div key={index} className="how-step-card provider-card">
                <div 
                  className="how-step-icon-wrapper"
                  style={{ background: `linear-gradient(145deg, ${step.color}20, ${step.color}05)` }}
                >
                  <div 
                    className="how-step-icon"
                    style={{ color: step.color }}
                  >
                    {step.icon}
                  </div>
                  <div 
                    className="how-step-number"
                    style={{ background: step.color }}
                  >
                    {index + 1}
                  </div>
                </div>
                <h4 className="how-step-title">{step.title}</h4>
                <p className="how-step-desc">{step.description}</p>
                <div className="how-step-details">
                  <FaCheckCircle className="how-detail-icon" />
                  <span>{step.details}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="how-cta">
            <button 
              className="how-cta-btn how-cta-secondary"
              onClick={() => navigate('/provider-portal')}
            >
              Become a Provider <FaArrowRight />
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="how-features">
          <h3 className="how-features-title">Why Choose DASTAK?</h3>
          <div className="how-features-grid">
            {features.map((feature, index) => (
              <div key={index} className="how-feature-card">
                <div className="how-feature-icon">{feature.icon}</div>
                <div className="how-feature-content">
                  <h4>{feature.title}</h4>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* App Promotion */}
        <div className="how-app-promo">
          <div className="how-app-content">
            <div className="how-app-badge">
              <FaMobile /> COMING SOON
            </div>
            <h3>Get the DASTAK App</h3>
            <p>Post requests, track orders, and chat with providers on the go</p>
            <div className="how-app-buttons">
              <div className="how-app-button">
                <span className="how-app-button-text">App Store</span>
                <small>Coming Soon</small>
              </div>
              <div className="how-app-button">
                <span className="how-app-button-text">Google Play</span>
                <small>Coming Soon</small>
              </div>
            </div>
          </div>
          <div className="how-app-notification">
            <FaRegBell />
            <span>Get notified about new features</span>
          </div>
        </div>

        {/* FAQ Teaser */}
        <div className="how-faq-teaser">
          <h3>Have questions?</h3>
          <p>Visit our <a href="/faqs">FAQs page</a> or <a href="https://wa.me/923295493781">chat with us on WhatsApp</a></p>
          <div className="how-whatsapp">
            <FaWhatsapp /> +92 329 5493781
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .how-it-works {
          position: relative;
          padding: 80px 0;
          background: linear-gradient(145deg, #ffffff, #f8fafc);
          overflow: hidden;
        }

        .how-bg-pattern {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: radial-gradient(#3498db10 1px, transparent 1px);
          background-size: 30px 30px;
          opacity: 0.4;
          pointer-events: none;
        }

        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          position: relative;
          z-index: 2;
        }

        /* Header Styles */
        .how-header {
          text-align: center;
          margin-bottom: 50px;
        }

        .how-tag {
          display: inline-block;
          margin-bottom: 20px;
        }

        .how-tag-line {
          display: inline-block;
          padding: 8px 20px;
          background: linear-gradient(145deg, #3498db10, #2980b910);
          color: #3498db;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 600;
          border: 1px solid #3498db30;
        }

        .how-title {
          font-size: 48px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 20px;
          line-height: 1.2;
        }

        .how-title-highlight {
          color: #3498db;
          position: relative;
          display: inline-block;
        }

        .how-title-highlight::after {
          content: '';
          position: absolute;
          bottom: 5px;
          left: 0;
          width: 100%;
          height: 8px;
          background: #3498db30;
          border-radius: 4px;
          z-index: -1;
        }

        .how-subtitle {
          font-size: 18px;
          color: #475569;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* Stats Section */
        .how-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 60px;
        }

        .how-stat-card {
          background: white;
          padding: 24px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
          border: 1px solid #e2e8f0;
          transition: all 0.3s;
        }

        .how-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.06);
          border-color: #3498db30;
        }

        .how-stat-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(145deg, #3498db10, #2980b910);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3498db;
          font-size: 24px;
        }

        .how-stat-content {
          display: flex;
          flex-direction: column;
        }

        .how-stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.2;
        }

        .how-stat-label {
          font-size: 13px;
          color: #64748b;
        }

        /* Section Headers */
        .how-section {
          margin-bottom: 60px;
        }

        .how-provider-section {
          margin-top: 80px;
        }

        .how-section-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .how-section-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(145deg, #3498db, #2980b9);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 28px;
          margin: 0 auto 20px;
          box-shadow: 0 8px 20px rgba(52,152,219,0.3);
        }

        .how-section-title {
          font-size: 32px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 12px;
        }

        .how-section-subtitle {
          font-size: 16px;
          color: #64748b;
          margin: 0;
        }

        /* Steps Grid */
        .how-steps-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 30px;
        }

        .how-step-card {
          background: white;
          padding: 32px 24px;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
          border: 1px solid #e2e8f0;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }

        .how-step-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.06);
          border-color: transparent;
        }

        .customer-card:hover {
          background: linear-gradient(145deg, white, #f0f9ff);
        }

        .provider-card:hover {
          background: linear-gradient(145deg, white, #fdf4ff);
        }

        .how-step-icon-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          position: relative;
        }

        .how-step-icon {
          font-size: 36px;
        }

        .how-step-number {
          position: absolute;
          top: -5px;
          right: -5px;
          width: 28px;
          height: 28px;
          background: #3498db;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          border: 3px solid white;
        }

        .how-step-title {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 12px;
          text-align: center;
        }

        .how-step-desc {
          font-size: 14px;
          color: #475569;
          line-height: 1.6;
          margin: 0 0 16px;
          text-align: center;
        }

        .how-step-details {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px 12px;
          background: #f8fafc;
          border-radius: 30px;
          font-size: 12px;
          color: #3498db;
          font-weight: 500;
        }

        .how-detail-icon {
          color: #2ecc71;
          font-size: 14px;
        }

        /* CTA Buttons */
        .how-cta {
          display: flex;
          justify-content: center;
          margin-top: 20px;
        }

        .how-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 16px 40px;
          border: none;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
        }

        .how-cta-primary {
          background: linear-gradient(145deg, #3498db, #2980b9);
          color: white;
        }

        .how-cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(52,152,219,0.4);
        }

        .how-cta-secondary {
          background: linear-gradient(145deg, #2c3e50, #1e2b38);
          color: white;
        }

        .how-cta-secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(44,62,80,0.4);
        }

        /* Features Grid */
        .how-features {
          margin: 80px 0;
          padding: 40px;
          background: white;
          border-radius: 32px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.02);
          border: 1px solid #e2e8f0;
        }

        .how-features-title {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          text-align: center;
          margin: 0 0 40px;
        }

        .how-features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .how-feature-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 16px;
          transition: all 0.3s;
        }

        .how-feature-card:hover {
          background: white;
          box-shadow: 0 8px 20px rgba(0,0,0,0.04);
          transform: translateY(-2px);
        }

        .how-feature-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(145deg, #3498db10, #2980b910);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3498db;
          font-size: 24px;
        }

        .how-feature-content h4 {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 4px;
        }

        .how-feature-content p {
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }

        /* App Promotion */
        .how-app-promo {
          background: linear-gradient(145deg, #0f172a, #0a0f1a);
          border-radius: 32px;
          padding: 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 40px;
          position: relative;
          overflow: hidden;
        }

        .how-app-content {
          color: white;
        }

        .how-app-badge {
          display: inline-block;
          padding: 6px 16px;
          background: #3498db30;
          color: #3498db;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 20px;
          border: 1px solid #3498db50;
        }

        .how-app-content h3 {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 12px;
        }

        .how-app-content p {
          font-size: 16px;
          color: #94a3b8;
          margin: 0 0 24px;
        }

        .how-app-buttons {
          display: flex;
          gap: 16px;
        }

        .how-app-button {
          display: flex;
          flex-direction: column;
          padding: 12px 24px;
          background: #1e293b;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
          border: 1px solid #334155;
        }

        .how-app-button:hover {
          background: #2d3a4e;
          transform: translateY(-2px);
        }

        .how-app-button-text {
          font-weight: 600;
          font-size: 16px;
        }

        .how-app-button small {
          font-size: 11px;
          color: #94a3b8;
        }

        .how-app-notification {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 24px;
          background: #1e293b;
          border-radius: 50px;
          color: white;
          border: 1px solid #3498db30;
        }

        .how-app-notification svg {
          color: #3498db;
          font-size: 20px;
        }

        /* FAQ Teaser */
        .how-faq-teaser {
          text-align: center;
          padding: 40px;
          background: #f8fafc;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
        }

        .how-faq-teaser h3 {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 12px;
        }

        .how-faq-teaser p {
          font-size: 16px;
          color: #475569;
          margin: 0 0 16px;
        }

        .how-faq-teaser a {
          color: #3498db;
          text-decoration: none;
          font-weight: 600;
        }

        .how-faq-teaser a:hover {
          text-decoration: underline;
        }

        .how-whatsapp {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: #25d36610;
          color: #25d366;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 600;
          border: 1px solid #25d36630;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .how-stats,
          .how-steps-grid,
          .how-features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .how-title {
            font-size: 40px;
          }
        }

        @media (max-width: 768px) {
          .how-it-works {
            padding: 60px 0;
          }

          .how-title {
            font-size: 32px;
          }

          .how-stats,
          .how-steps-grid,
          .how-features-grid {
            grid-template-columns: 1fr;
          }

          .how-app-promo {
            flex-direction: column;
            text-align: center;
            gap: 30px;
          }

          .how-app-buttons {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .how-title {
            font-size: 28px;
          }

          .how-section-title {
            font-size: 24px;
          }

          .how-step-card {
            padding: 24px;
          }
        }
      `}</style>
    </section>
  );
};

export default HowItWorks;
