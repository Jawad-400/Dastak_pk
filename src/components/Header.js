import React, { useState } from 'react';
import { FaSignInAlt, FaTools, FaBars } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header className="header">
        <div className="container">
          <nav className="navbar">
            {/* Logo */}
            <Link to="/" className="logo" onClick={closeMobileMenu}>
              <span className="logo-main">DASTAK</span>
              <span className="logo-urdu">????</span>
              <span className="logo-registered">®</span>
            </Link>

            {/* Hamburger menu */}
            <button
              type="button"
              className="menu-toggle"
              aria-label="Toggle menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <FaBars />
            </button>

            {/* Nav links + Auth */}
            <div className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
              <div className="main-nav">
                <Link to="/" className="nav-link" onClick={closeMobileMenu}>
                  <span className="nav-text">Home</span>
                </Link>
                <Link to="/services" className="nav-link" onClick={closeMobileMenu}>
                  <span className="nav-text">All Services</span>
                </Link>
                <a href="#how-it-works" className="nav-link" onClick={closeMobileMenu}>
                  <span className="nav-text">How It Works</span>
                </a>
                <Link to="/post-request" className="nav-link" onClick={closeMobileMenu}>
                  <span className="nav-text">Post Request</span>
                </Link>
                <Link to="/provider-portal" className="nav-link" onClick={closeMobileMenu}>
                  <span className="nav-text">Become Provider</span>
                </Link>
              </div>

              <div className="auth-buttons">
                <button
                  type="button"
                  className="btn btn-customer"
                  onClick={() => { 
                    navigate('/customer-login'); 
                    closeMobileMenu(); 
                  }}
                >
                  <FaSignInAlt className="btn-icon" />
                  <span className="btn-text">Customer Sign In</span>
                </button>
                <button
                  type="button"
                  className="btn btn-provider"
                  onClick={() => { 
                    navigate('/provider-portal'); 
                    closeMobileMenu(); 
                  }}
                >
                  <FaTools className="btn-icon" />
                  <span className="btn-text">Provider Portal</span>
                </button>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={closeMobileMenu}
          onKeyDown={(e) => e.key === 'Escape' && closeMobileMenu()}
          role="button"
          tabIndex={0}
          aria-label="Close menu"
        />
      )}
    </>
  );
};

export default Header;


