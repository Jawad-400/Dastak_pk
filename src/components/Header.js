import React, { useState, useEffect } from 'react';
import { 
  FaSignInAlt, FaTools, FaBars, FaTimes, 
  FaUser, FaTachometerAlt, FaBox, FaWrench,
  FaHome, FaInfoCircle, FaShoppingBag
} from 'react-icons/fa';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { socket } from '../Services/socket';
import '../styles.css'

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Load user from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
  }, [location]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('provider_service');
    setUser(null);
    socket.disconnect();
    closeMobileMenu();
    navigate('/');
  };

  // Determine dashboard link based on user type
  const getDashboardLink = () => {
    if (!user) return '/';
    return user.user_type === 'provider' ? '/provider-dashboard' : '/customer-orders';
  };

  // Determine if current link is active
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          {/* Logo - YOUR EXACT ORIGINAL DESIGN */}
          <Link to="/" className="logo" onClick={closeMobileMenu}>
            <span className="logo-main">DASTAK</span>
            <span className="logo-urdu">دستک</span>
            <span className="logo-registered">®</span>
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="nav-center">
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              <FaHome className="nav-icon" />
              <span>Home</span>
            </Link>
            <Link to="/services" className={`nav-link ${isActive('/services') ? 'active' : ''}`}>
              <FaShoppingBag className="nav-icon" />
              <span>All Services</span>
            </Link>
            {/* ✅ FIXED: Changed from <a> to <Link> */}
            <Link to="/how-it-works" className={`nav-link ${isActive('/how-it-works') ? 'active' : ''}`}>
              <FaInfoCircle className="nav-icon" />
              <span>How It Works</span>
            </Link>
            {!user && (
              <Link to="/post-request" className={`nav-link ${isActive('/post-request') ? 'active' : ''}`}>
                <FaTools className="nav-icon" />
                <span>Post Request</span>
              </Link>
            )}
            <Link to="/provider-portal" className={`nav-link ${isActive('/provider-portal') ? 'active' : ''}`}>
              <FaWrench className="nav-icon" />
              <span>Become Provider</span>
            </Link>
          </div>

          {/* Right Section - Auth Buttons / User Menu */}
          <div className="nav-right">
            {user ? (
              <div className="user-menu">
                <Link to={getDashboardLink()} className="user-avatar" title={user.name}>
                  {user.name?.charAt(0) || 'U'}
                </Link>
                <button onClick={handleLogout} className="btn btn-logout">
                  <FaSignInAlt /> Logout
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigate('/customer-login')}
                >
                  <FaSignInAlt className="btn-icon" />
                  <span>Customer Sign In</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate('/provider-portal')}
                >
                  <FaTools className="btn-icon" />
                  <span>Provider Portal</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-header">
          <div className="mobile-logo">
            <span className="logo-main">DASTAK</span>
            <span className="logo-urdu">دستک</span>
            <span className="logo-registered">®</span>
          </div>
          <button className="mobile-menu-close" onClick={closeMobileMenu}>
            <FaTimes />
          </button>
        </div>

        <div className="mobile-menu-content">
          {user && (
            <div className="mobile-user-info">
              <div className="mobile-user-avatar">
                {user.name?.charAt(0) || 'U'}
              </div>
              <div className="mobile-user-details">
                <p className="mobile-user-name">{user.name}</p>
                <p className="mobile-user-role">{user.user_type}</p>
              </div>
            </div>
          )}

          <div className="mobile-nav-links">
            <Link to="/" className="mobile-nav-link" onClick={closeMobileMenu}>
              <FaHome /> Home
            </Link>
            <Link to="/services" className="mobile-nav-link" onClick={closeMobileMenu}>
              <FaShoppingBag /> All Services
            </Link>
            {/* ✅ FIXED: Changed from <a> to <Link> */}
            <Link to="/how-it-works" className="mobile-nav-link" onClick={closeMobileMenu}>
              <FaInfoCircle /> How It Works
            </Link>
            
            {user ? (
              <>
                <div className="mobile-nav-divider" />
                <Link to={getDashboardLink()} className="mobile-nav-link" onClick={closeMobileMenu}>
                  <FaTachometerAlt /> Dashboard
                </Link>
                {user.user_type === 'provider' ? (
                  <Link to="/my-orders" className="mobile-nav-link" onClick={closeMobileMenu}>
                    <FaBox /> My Orders
                  </Link>
                ) : (
                  <>
                    <Link to="/customer-orders" className="mobile-nav-link" onClick={closeMobileMenu}>
                      <FaBox /> My Orders
                    </Link>
                    <Link to="/post-request" className="mobile-nav-link" onClick={closeMobileMenu}>
                      <FaTools /> Post Request
                    </Link>
                  </>
                )}
                <Link to="/provider-portal" className="mobile-nav-link" onClick={closeMobileMenu}>
                  <FaWrench /> Become Provider
                </Link>
                <button className="mobile-nav-link logout" onClick={handleLogout}>
                  <FaSignInAlt /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/post-request" className="mobile-nav-link" onClick={closeMobileMenu}>
                  <FaTools /> Post Request
                </Link>
                <Link to="/provider-portal" className="mobile-nav-link" onClick={closeMobileMenu}>
                  <FaWrench /> Become Provider
                </Link>
                <div className="mobile-auth-buttons">
                  <button
                    className="mobile-btn mobile-btn-outline"
                    onClick={() => { 
                      navigate('/customer-login'); 
                      closeMobileMenu(); 
                    }}
                  >
                    <FaSignInAlt /> Customer Sign In
                  </button>
                  <button
                    className="mobile-btn mobile-btn-primary"
                    onClick={() => { 
                      navigate('/provider-portal'); 
                      closeMobileMenu(); 
                    }}
                  >
                    <FaTools /> Provider Portal
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu} />
      )}

      <style jsx="true">{`
        .header {
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          background: white;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
          z-index: 1000;
          transition: all 0.3s ease;
          border-bottom: 1px solid #f1f5f9;
        }

        .header.scrolled {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
        }

        .header-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* Logo - YOUR EXACT ORIGINAL STYLES */
        .logo {
          display: flex;
          align-items: baseline;
          gap: 2px;
          text-decoration: none;
          flex-shrink: 0;
        }

        .logo-main {
          font-size: 24px;
          font-weight: 700;
          color: #2c3e50;
          letter-spacing: 1px;
          line-height: 1;
        }

        .logo-urdu {
          font-size: 18px;
          color: #0ea5e9;
          font-family: 'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif;
          line-height: 1;
          margin-left: 4px;
        }

        .logo-registered {
          font-size: 10px;
          color: #95a5a6;
          vertical-align: super;
          margin-left: 2px;
          font-weight: 400;
        }

        /* Desktop Navigation */
        .nav-center {
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1;
          justify-content: center;
          padding: 0 20px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          color: #475569;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          border-radius: 6px;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .nav-link:hover {
          background: #f8fafc;
          color: #3498db;
        }

        .nav-link.active {
          background: #eff6ff;
          color: #3498db;
        }

        .nav-icon {
          font-size: 14px;
        }

        /* Right Section */
        .nav-right {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-shrink: 0;
        }

        /* Auth Buttons */
        .auth-buttons {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          white-space: nowrap;
        }

        .btn-outline {
          background: white;
          color: #3498db;
          border: 1.5px solid #e2e8f0;
        }

        .btn-outline:hover {
          background: #f8fafc;
          border-color: #3498db;
        }

        .btn-primary {
          background: #3498db;
          color: white;
        }

        .btn-primary:hover {
          background: #2980b9;
        }

        .btn-logout {
          background: #fef2f2;
          color: #ef4444;
          border: 1px solid #fee2e2;
        }

        .btn-logout:hover {
          background: #fee2e2;
        }

        .btn-icon {
          font-size: 14px;
        }

        /* User Menu */
        .user-menu {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          background: #3498db;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 16px;
          text-decoration: none;
          transition: transform 0.2s;
        }

        .user-avatar:hover {
          transform: scale(1.05);
        }

        /* Mobile Menu Toggle */
        .menu-toggle {
          display: none;
          background: none;
          border: none;
          font-size: 22px;
          color: #2c3e50;
          cursor: pointer;
          padding: 8px;
          margin-left: 4px;
        }

        /* Mobile Menu */
        .mobile-menu {
          position: fixed;
          top: 0;
          right: -100%;
          width: 300px;
          height: 100vh;
          background: white;
          box-shadow: -4px 0 20px rgba(0, 0, 0, 0.08);
          z-index: 1001;
          transition: right 0.3s ease;
          overflow-y: auto;
        }

        .mobile-menu.active {
          right: 0;
        }

        .mobile-menu-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          border-bottom: 1px solid #e2e8f0;
        }

        .mobile-logo {
          display: flex;
          align-items: baseline;
          gap: 2px;
        }

        .mobile-menu-close {
          background: none;
          border: none;
          font-size: 20px;
          color: #64748b;
          cursor: pointer;
          padding: 8px;
        }

        .mobile-menu-content {
          padding: 20px;
        }

        .mobile-user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f8fafc;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .mobile-user-avatar {
          width: 44px;
          height: 44px;
          background: #3498db;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 18px;
        }

        .mobile-user-name {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
        }

        .mobile-user-role {
          margin: 4px 0 0;
          font-size: 12px;
          color: #64748b;
          text-transform: capitalize;
        }

        .mobile-nav-links {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          color: #475569;
          text-decoration: none;
          font-size: 15px;
          font-weight: 500;
          border-radius: 6px;
          transition: all 0.2s;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
        }

        .mobile-nav-link:hover {
          background: #f8fafc;
          color: #3498db;
        }

        .mobile-nav-link.logout {
          color: #ef4444;
        }

        .mobile-nav-link.logout:hover {
          background: #fef2f2;
        }

        .mobile-nav-divider {
          height: 1px;
          background: #e2e8f0;
          margin: 16px 0;
        }

        .mobile-auth-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 20px;
        }

        .mobile-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          width: 100%;
        }

        .mobile-btn-outline {
          background: white;
          color: #3498db;
          border: 1.5px solid #e2e8f0;
        }

        .mobile-btn-primary {
          background: #3498db;
          color: white;
        }

        /* Mobile Menu Overlay */
        .mobile-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .nav-center {
            display: none;
          }

          .auth-buttons {
            display: none;
          }

          .user-menu .btn-logout {
            display: none;
          }

          .menu-toggle {
            display: block;
          }

          .header-container {
            height: 70px;
            padding: 0 20px;
          }
          
          .logo-main {
            font-size: 22px;
          }
          
          .logo-urdu {
            font-size: 16px;
          }
        }

        @media (max-width: 480px) {
          .header-container {
            padding: 0 16px;
          }

          .logo-main {
            font-size: 20px;
          }

          .logo-urdu {
            font-size: 14px;
          }

          .mobile-menu {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
};

export default Header;
