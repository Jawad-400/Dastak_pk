import React, { useState } from 'react';
import { 
  FaPhone, FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaClock,
  FaUser, FaComment, FaPaperPlane, FaCheckCircle, FaSpinner
} from 'react-icons/fa';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1500);
  };

  const contactMethods = [
    {
      icon: <FaPhone />,
      title: 'Phone',
      details: '+92 329 5493781',
      action: 'Call Now',
      link: 'tel:+923295493781',
      color: '#3b82f6'
    },
    {
      icon: <FaWhatsapp />,
      title: 'WhatsApp',
      details: '+92 329 5493781',
      action: 'Chat on WhatsApp',
      link: 'https://wa.me/923295493781',
      color: '#25d366'
    },
    {
      icon: <FaEnvelope />,
      title: 'Email',
      details: 'support@dastak.pk',
      action: 'Send Email',
      link: 'mailto:support@dastak.pk',
      color: '#ea4335'
    },
    {
      icon: <FaMapMarkerAlt />,
      title: 'Office',
      details: 'Wah Cantt, Pakistan',
      action: 'Get Directions',
      link: 'https://maps.google.com/?q=Lahore,Pakistan',
      color: '#8b5cf6'
    }
  ];

  const faqs = [
    {
      question: 'How quickly do you respond?',
      answer: 'We aim to respond to all inquiries within 2-4 hours during business hours.'
    },
    {
      question: 'Do you have phone support?',
      answer: 'Yes, you can call us at +92 329 5493781 from 9 AM to 6 PM, Monday to Saturday.'
    },
    {
      question: 'Can I visit your office?',
      answer: 'Yes, we welcome visitors! Please schedule an appointment first via email or phone.'
    }
  ];

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <div className="contact-hero">
        <div className="hero-particles"></div>
        <div className="container">
          <h1>Get in Touch</h1>
          <p className="hero-subtitle">
            Have questions? We're here to help. Reach out to us anytime.
          </p>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="methods-section">
        <div className="container">
          <div className="methods-grid">
            {contactMethods.map((method, index) => (
              <a 
                key={index}
                href={method.link}
                target="_blank"
                rel="noopener noreferrer"
                className="method-card"
                style={{ '--hover-color': method.color }}
              >
                <div className="method-icon" style={{ color: method.color }}>
                  {method.icon}
                </div>
                <h3>{method.title}</h3>
                <p className="method-details">{method.details}</p>
                <span className="method-action">{method.action} →</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Form & Map */}
      <div className="form-section">
        <div className="container">
          <div className="form-grid">
            {/* Contact Form */}
            <div className="contact-form">
              <h2>Send Us a Message</h2>
              <p>Fill out the form below and we'll get back to you within 24 hours.</p>
              
              {isSubmitted && (
                <div className="success-message">
                  <FaCheckCircle />
                  <span>Thank you! Your message has been sent successfully.</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <FaUser /> Your Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <FaEnvelope /> Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <FaPhone /> Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="03XX-XXXXXXX"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <FaComment /> Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help?"
                      required
                    />
                  </div>
                </div>

                <div className="form-group full">
                  <label>
                    <FaComment /> Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Please describe your question or concern..."
                    rows="5"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="spin" /> Sending...
                    </>
                  ) : (
                    <>
                      Send Message <FaPaperPlane />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Map & Info */}
            <div className="contact-info">
              <div className="info-card">
                <h3>Office Hours</h3>
                <div className="hours-list">
                  <div className="hour-item">
                    <FaClock />
                    <div>
                      <strong>Monday - Friday</strong>
                      <span>9:00 AM - 6:00 PM</span>
                    </div>
                  </div>
                  <div className="hour-item">
                    <FaClock />
                    <div>
                      <strong>Saturday</strong>
                      <span>10:00 AM - 4:00 PM</span>
                    </div>
                  </div>
                  <div className="hour-item">
                    <FaClock />
                    <div>
                      <strong>Sunday</strong>
                      <span>Closed</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="info-card">
                <h3>Quick FAQs</h3>
                <div className="faq-list">
                  {faqs.map((faq, index) => (
                    <div key={index} className="faq-item">
                      <p className="faq-question">{faq.question}</p>
                      <p className="faq-answer">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="info-card map-card">
                <h3>Visit Us</h3>
                <div className="map-placeholder">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d217776.4561682569!2d74.25407435!3d31.48263635!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107d9%3A0xc23abe6ccc7e2462!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1710000000000!5m2!1sen!2s"
                    width="100%"
                    height="250"
                    style={{ border: 0, borderRadius: '12px' }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Dastak Location"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .contact-page {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .contact-hero {
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

        .contact-hero h1 {
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
          line-height: 1.6;
        }

        .methods-section {
          padding: 60px 0;
        }

        .methods-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .method-card {
          background: white;
          padding: 30px 20px;
          border-radius: 20px;
          text-decoration: none;
          text-align: center;
          transition: all 0.3s;
          border: 1px solid #e2e8f0;
        }

        .method-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(59,130,246,0.1);
          border-color: var(--hover-color);
        }

        .method-icon {
          font-size: 36px;
          margin-bottom: 16px;
        }

        .method-card h3 {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 8px;
        }

        .method-details {
          color: #64748b;
          font-size: 14px;
          margin: 0 0 12px;
        }

        .method-action {
          color: #3b82f6;
          font-size: 13px;
          font-weight: 500;
        }

        .form-section {
          padding: 60px 0;
          background: white;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }

        .contact-form {
          padding-right: 40px;
        }

        .contact-form h2 {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 8px;
        }

        .contact-form p {
          color: #64748b;
          margin-bottom: 30px;
        }

        .success-message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px;
          background: #d4edda;
          color: #059669;
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group.full {
          grid-column: span 2;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-weight: 500;
          color: #334155;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 15px;
          transition: all 0.3s;
          background: #f8fafc;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          border-color: #3b82f6;
          outline: none;
          background: white;
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(145deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59,130,246,0.4);
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .info-card {
          background: #f8fafc;
          border-radius: 20px;
          padding: 24px;
          border: 1px solid #e2e8f0;
        }

        .info-card h3 {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 20px;
        }

        .hours-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .hour-item {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .hour-item svg {
          color: #3b82f6;
          font-size: 20px;
        }

        .hour-item div {
          display: flex;
          flex-direction: column;
        }

        .hour-item strong {
          color: #0f172a;
          font-size: 14px;
        }

        .hour-item span {
          color: #64748b;
          font-size: 13px;
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .faq-question {
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 4px;
        }

        .faq-answer {
          color: #64748b;
          font-size: 14px;
          margin: 0;
        }

        .map-card {
          padding: 0;
          overflow: hidden;
        }

        .map-card h3 {
          padding: 24px 24px 0;
        }

        .map-placeholder {
          margin-top: 16px;
        }

        @media (max-width: 1024px) {
          .methods-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .methods-grid {
            grid-template-columns: 1fr;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Contact;