import React from 'react';
import { 
  FaFacebook, FaWhatsapp, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaTwitter, FaInstagram, FaLinkedin, FaYoutube, FaArrowUp,
  FaWrench, FaBolt, FaPaintBrush, FaSnowflake, FaHammer,
  FaBroom, FaTv, FaBug, FaCar, FaShieldAlt, FaCreditCard,
  FaClock, FaStar, FaUsers, FaHandshake
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickServices = [
    { name: 'Plumbing', icon: <FaWrench />, path: '/services?category=plumbing' },
    { name: 'Electrical', icon: <FaBolt />, path: '/services?category=electrical' },
    { name: 'AC Repair', icon: <FaSnowflake />, path: '/services?category=ac-repair' },
    { name: 'Painting', icon: <FaPaintBrush />, path: '/services?category=painting' },
    { name: 'Carpentry', icon: <FaHammer />, path: '/services?category=carpentry' },
    { name: 'Cleaning', icon: <FaBroom />, path: '/services?category=cleaning' },
    { name: 'Appliance', icon: <FaTv />, path: '/services?category=appliance' },
    { name: 'Pest Control', icon: <FaBug />, path: '/services?category=pest-control' },
    { name: 'Car Service', icon: <FaCar />, path: '/services?category=car-service' },
  ];

  const companyLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'Careers', path: '/careers' },
    { name: 'Blog', path: '/blog' },
    { name: 'Press', path: '/press' },
    { name: 'Contact', path: '/contact' },
  ];

  const supportLinks = [
    { name: 'Help Center', path: '/help' },
    { name: 'Safety Center', path: '/safety' },
    { name: 'Community Guidelines', path: '/guidelines' },
    { name: 'FAQs', path: '/faqs' },
    { name: 'Report an Issue', path: '/report' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Use', path: '/terms' },
    { name: 'Cookie Policy', path: '/cookies' },
    { name: 'Disclaimer', path: '/disclaimer' },
  ];

  const socialLinks = [
    { icon: <FaFacebook />, url: 'https://facebook.com/dastakpk', label: 'Facebook', color: '#1877f2' },
    { icon: <FaTwitter />, url: 'https://twitter.com/dastakpk', label: 'Twitter', color: '#1da1f2' },
    { icon: <FaInstagram />, url: 'https://instagram.com/dastakpk', label: 'Instagram', color: '#e4405f' },
    { icon: <FaLinkedin />, url: 'https://linkedin.com/company/dastakpk', label: 'LinkedIn', color: '#0a66c2' },
    { icon: <FaYoutube />, url: 'https://youtube.com/dastakpk', label: 'YouTube', color: '#ff0000' },
    { icon: <FaWhatsapp />, url: 'https://wa.me/923295493781', label: 'WhatsApp', color: '#25d366' },
  ];

  const contactInfo = [
    { icon: <FaPhone />, text: '+92 329 5493781', link: 'tel:+923295493781' },
    { icon: <FaWhatsapp />, text: '+92 329 5493781', link: 'https://wa.me/923295493781' },
    { icon: <FaEnvelope />, text: 'support@dastak.pk', link: 'mailto:support@dastak.pk' },
    { icon: <FaMapMarkerAlt />, text: 'Lahore, Pakistan', link: 'https://maps.google.com/?q=Lahore,Pakistan' },
  ];

  return (
    <footer className="footer">
      {/* Newsletter Section */}
      <div className="footer-newsletter">
        <div className="container">
          <div className="newsletter-content">
            <div className="newsletter-text">
              <h3>Stay Updated with DASTAK</h3>
              <p>Subscribe to get special offers, service updates, and tips from professionals.</p>
            </div>
            <div className="newsletter-form">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="newsletter-input"
              />
              <button className="newsletter-btn">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Brand Column */}
            <div className="footer-col brand-col">
              <Link to="/" className="footer-logo">
                <span className="logo-main">DASTAK</span>
                <span className="logo-urdu">دستک</span>
                <span className="logo-registered">®</span>
              </Link>
              <p className="brand-description">
                Pakistan's #1 service marketplace connecting verified professionals with customers across the nation. 
                Trusted by 50,000+ customers and 10,000+ service providers.
              </p>
              
              {/* Trust Badges */}
              <div className="trust-badges">
                <div className="trust-badge">
                  <FaShieldAlt /> Verified Professionals
                </div>
                <div className="trust-badge">
                  <FaCreditCard /> Secure Payments
                </div>
                <div className="trust-badge">
                  <FaClock /> 24/7 Support
                </div>
              </div>

              {/* Social Links */}
              <div className="social-links">
                <h4>Follow Us</h4>
                <div className="social-icons">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-icon"
                      style={{ '--hover-color': social.color }}
                      aria-label={social.label}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Services */}
            <div className="footer-col">
              <h3>Quick Services</h3>
              <ul className="footer-links">
                {quickServices.map((service, index) => (
                  <li key={index}>
                    <Link to={service.path}>
                      {service.icon} {service.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company & Support */}
            <div className="footer-col">
              <h3>Company</h3>
              <ul className="footer-links">
                {companyLinks.map((link, index) => (
                  <li key={index}>
                    <Link to={link.path}>{link.name}</Link>
                  </li>
                ))}
              </ul>
              
              <h3 style={{ marginTop: '30px' }}>Support</h3>
              <ul className="footer-links">
                {supportLinks.map((link, index) => (
                  <li key={index}>
                    <Link to={link.path}>{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Legal */}
            <div className="footer-col">
              <h3>Contact Us</h3>
              <ul className="footer-links contact-info">
                {contactInfo.map((item, index) => (
                  <li key={index}>
                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                      {item.icon} {item.text}
                    </a>
                  </li>
                ))}
              </ul>

              <h3 style={{ marginTop: '30px' }}>Legal</h3>
              <ul className="footer-links">
                {legalLinks.map((link, index) => (
                  <li key={index}>
                    <Link to={link.path}>{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="container">
          <div className="bottom-content">
            <div className="copyright">
              <p>© {currentYear} DASTAK. All rights reserved.</p>
              <p className="tagline">Making Pakistan service-ready, one task at a time.</p>
            </div>
            
            <div className="bottom-links">
              <Link to="/privacy">Privacy</Link>
              <span className="separator">·</span>
              <Link to="/terms">Terms</Link>
              <span className="separator">·</span>
              <Link to="/cookies">Cookies</Link>
              <span className="separator">·</span>
              <Link to="/sitemap">Sitemap</Link>
            </div>

            <button 
              className="scroll-top"
              onClick={scrollToTop}
              aria-label="Scroll to top"
            >
              <FaArrowUp />
            </button>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .footer {
          background: linear-gradient(145deg, #0f172a, #0a0f1a);
          color: #e2e8f0;
          position: relative;
          margin-top: 60px;
        }

        /* Newsletter Section */
        .footer-newsletter {
          background: linear-gradient(145deg, #1e293b, #0f172a);
          padding: 60px 0;
          border-bottom: 1px solid #334155;
        }

        .newsletter-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
          flex-wrap: wrap;
        }

        .newsletter-text {
          flex: 1;
          min-width: 300px;
        }

        .newsletter-text h3 {
          color: white;
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 10px 0;
        }

        .newsletter-text p {
          color: #94a3b8;
          margin: 0;
          font-size: 16px;
        }

        .newsletter-form {
          display: flex;
          gap: 12px;
          flex: 1;
          min-width: 400px;
        }

        .newsletter-input {
          flex: 1;
          padding: 16px 20px;
          border: 2px solid #334155;
          border-radius: 12px;
          background: #1e293b;
          color: white;
          font-size: 16px;
          transition: all 0.3s;
        }

        .newsletter-input:focus {
          border-color: #3498db;
          outline: none;
          background: #0f172a;
        }

        .newsletter-input::placeholder {
          color: #64748b;
        }

        .newsletter-btn {
          padding: 16px 32px;
          background: linear-gradient(145deg, #3498db, #2980b9);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(52,152,219,0.3);
        }

        .newsletter-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(52,152,219,0.4);
        }

        /* Main Footer */
        .footer-main {
          padding: 60px 0 40px;
        }

        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1.5fr 1.5fr;
          gap: 40px;
        }

        .footer-col {
          display: flex;
          flex-direction: column;
        }

        /* Brand Column - FIXED LOGO COLORS */
        .footer-logo {
          display: flex;
          align-items: baseline;
          gap: 2px;
          text-decoration: none;
          margin-bottom: 20px;
        }

        .logo-main {
          font-size: 24px;
          font-weight: 700;
          color: #2c3e50 !important; /* YOUR ORIGINAL DARK BLUE-GRAY */
          letter-spacing: 1px;
          line-height: 1;
        }

        .logo-urdu {
          font-size: 18px;
          color: #7f8c8d !important; /* YOUR ORIGINAL GRAY */
          font-family: 'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif;
          line-height: 1;
          margin-left: 4px;
        }

        .logo-registered {
          font-size: 10px;
          color: #95a5a6 !important; /* YOUR ORIGINAL LIGHT GRAY */
          vertical-align: super;
          margin-left: 2px;
          font-weight: 400;
        }

        .brand-description {
          color: #94a3b8;
          line-height: 1.7;
          margin: 0 0 20px 0;
          font-size: 14px;
        }

        .trust-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 30px;
        }

        .trust-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: #1e293b;
          border-radius: 30px;
          color: #e2e8f0;
          font-size: 13px;
          font-weight: 500;
          border: 1px solid #334155;
        }

        .trust-badge svg {
          color: #3498db;
        }

        /* Social Links */
        .social-links h4 {
          color: white;
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 15px 0;
        }

        .social-icons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .social-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: #1e293b;
          border-radius: 50%;
          color: #94a3b8;
          font-size: 18px;
          transition: all 0.3s;
          border: 1px solid #334155;
        }

        .social-icon:hover {
          background: var(--hover-color);
          color: white;
          transform: translateY(-3px);
          border-color: transparent;
        }

        /* Footer Links */
        .footer-col h3 {
          color: white;
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 20px 0;
          position: relative;
          padding-bottom: 10px;
        }

        .footer-col h3::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 40px;
          height: 3px;
          background: linear-gradient(145deg, #3498db, #2980b9);
          border-radius: 2px;
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-links li {
          margin-bottom: 12px;
        }

        .footer-links a {
          color: #94a3b8;
          text-decoration: none;
          font-size: 14px;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .footer-links a:hover {
          color: white;
          transform: translateX(5px);
        }

        .footer-links a svg {
          font-size: 14px;
          color: #3498db;
        }

        .contact-info li a {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* Bottom Bar */
        .footer-bottom {
          background: #0a0f1a;
          padding: 24px 0;
          border-top: 1px solid #1e293b;
        }

        .bottom-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
          position: relative;
        }

        .copyright p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }

        .tagline {
          margin-top: 4px !important;
          font-size: 12px !important;
          color: #475569 !important;
        }

        .bottom-links {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .bottom-links a {
          color: #94a3b8;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.3s;
        }

        .bottom-links a:hover {
          color: #3498db;
        }

        .separator {
          color: #475569;
        }

        .scroll-top {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 50%;
          color: #94a3b8;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .scroll-top:hover {
          background: #3498db;
          color: white;
          transform: translateY(-3px);
          border-color: transparent;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .newsletter-content {
            flex-direction: column;
            text-align: center;
          }
          
          .newsletter-form {
            min-width: 100%;
          }
        }

        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr;
          }
          
          .newsletter-form {
            flex-direction: column;
          }
          
          .bottom-content {
            flex-direction: column;
            text-align: center;
          }
          
          .bottom-links {
            justify-content: center;
          }
          
          .scroll-top {
            position: absolute;
            bottom: 20px;
            right: 20px;
          }
        }

        @media (max-width: 480px) {
          .trust-badges {
            flex-direction: column;
          }
          
          .social-icons {
            justify-content: center;
          }
          
          .footer-col h3::after {
            left: 50%;
            transform: translateX(-50%);
          }
          
          .footer-col {
            text-align: center;
          }
          
          .footer-links a {
            justify-content: center;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;