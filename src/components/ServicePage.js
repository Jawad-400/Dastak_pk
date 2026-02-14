import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './../styles.css';

const ServicesPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const user = localStorage.getItem('userData');
    
    if (token && user) {
      setIsLoggedIn(true);
    }
  }, []);

  // All services with value field (must match PostRequest dropdown values)
  const allServices = [
    // Home Services
    { name: "Plumbing", value: "plumbing", category: "home", icon: "🚰" },
    { name: "Electrical Work", value: "electrical", category: "home", icon: "⚡" },
    { name: "Painting & Whitewash", value: "painting", category: "home", icon: "🎨" },
    { name: "Carpentry", value: "carpentry", category: "home", icon: "🪚" },
    { name: "AC Repair", value: "ac-repair", category: "home", icon: "❄️" },
    { name: "Masonry", value: "masonry", category: "home", icon: "🧱" },
    { name: "Waterproofing", value: "waterproofing", category: "home", icon: "💧" },
    { name: "Flooring", value: "flooring", category: "home", icon: "🏠" },
    
    // Vehicle Services
    { name: "Car Repair", value: "car-repair", category: "vehicle", icon: "🚗" },
    { name: "Bike Repair", value: "bike-repair", category: "vehicle", icon: "🏍️" },
    { name: "Car Wash", value: "car-wash", category: "vehicle", icon: "🧼" },
    { name: "Towing Service", value: "towing", category: "vehicle", icon: "🚚" },
    { name: "Denting & Painting", value: "denting", category: "vehicle", icon: "🔧" },
    
    // Electronics
    { name: "Mobile Repair", value: "mobile-repair", category: "electronics", icon: "📱" },
    { name: "TV Repair", value: "tv-repair", category: "electronics", icon: "📺" },
    { name: "Refrigerator Repair", value: "fridge-repair", category: "electronics", icon: "🧊" },
    { name: "Washing Machine Repair", value: "washing-machine", category: "electronics", icon: "👕" },
    { name: "Generator Repair", value: "generator-repair", category: "electronics", icon: "🔌" },
    { name: "Inverter/UPS Repair", value: "inverter-repair", category: "electronics", icon: "⚡" },
    
    // Cleaning
    { name: "Home Cleaning", value: "home-cleaning", category: "cleaning", icon: "✨" },
    { name: "Carpet Cleaning", value: "carpet-cleaning", category: "cleaning", icon: "🧹" },
    { name: "Sofa Cleaning", value: "sofa-cleaning", category: "cleaning", icon: "🛋️" },
    { name: "Kitchen Deep Clean", value: "kitchen-cleaning", category: "cleaning", icon: "🍳" },
    { name: "Water Tank Cleaning", value: "tank-cleaning", category: "cleaning", icon: "🚰" },
    { name: "Pest Control", value: "pest-control", category: "cleaning", icon: "🐜" },
    
    // Personal Care
    { name: "Home Barber", value: "barber", category: "personal", icon: "💇" },
    { name: "Beautician at Home", value: "beautician", category: "personal", icon: "💄" },
    { name: "Tailor Services", value: "tailor", category: "personal", icon: "🧵" },
    { name: "Cobbler", value: "cobbler", category: "personal", icon: "👞" },
    { name: "Mehndi Artist", value: "mehndi", category: "personal", icon: "🖐️" },
    
    // Events
    { name: "Catering", value: "catering", category: "events", icon: "🍛" },
    { name: "Photography", value: "photography", category: "events", icon: "📸" },
    { name: "Videography", value: "videography", category: "events", icon: "🎥" },
    { name: "Event Decoration", value: "decoration", category: "events", icon: "🎉" },
    { name: "DJ Services", value: "dj", category: "events", icon: "🎵" },
    
    // Others
    { name: "Home Tuition", value: "tuition", category: "education", icon: "📚" },
    { name: "Moving Service", value: "moving-service", category: "delivery", icon: "🚚" },
    { name: "Parcel Delivery", value: "parcel-delivery", category: "delivery", icon: "📦" },
    { name: "Key Making", value: "key-making", category: "others", icon: "🔑" },
    { name: "Watch Repair", value: "watch-repair", category: "others", icon: "⌚" },
    { name: "Legal Services", value: "legal-services", category: "others", icon: "⚖️" },
  ];

  // Handle Book Now button click
  const handleBookNow = (serviceValue) => {
    // CHECK IF USER IS LOGGED IN
    if (!isLoggedIn) {
      setShowLoginPrompt(true); // Show login prompt
      return; // Stop here
    }
    
    // If logged in, go to post request
    navigate('/post-request', {
      state: { 
        selectedService: serviceValue
      }
    });
  };

  // Handle Login button click
  const handleLoginRedirect = () => {
    navigate('/customer-login');
    setShowLoginPrompt(false);
  };

  // Handle Signup button click
  const handleSignupRedirect = () => {
    navigate('/user-signup');
    setShowLoginPrompt(false);
  };

  // Close login prompt
  const closeLoginPrompt = () => {
    setShowLoginPrompt(false);
  };

  return (
    <div className="services-page">
      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="login-prompt-modal">
          <div className="login-prompt-content">
            <button className="close-btn" onClick={closeLoginPrompt}>×</button>
            <h3>🔒 Login Required</h3>
            <p>Please login or sign up to book a service.</p>
            
            <div className="prompt-buttons">
              <button className="prompt-btn login-btn" onClick={handleLoginRedirect}>
                Login
              </button>
              <button className="prompt-btn signup-btn" onClick={handleSignupRedirect}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container">
        <div className="page-header">
          <h1>All Services in Pakistan</h1>
          <p>Find trusted professionals for every need in your city</p>
        </div>
        
        <div className="services-filter">
          <button className="filter-btn active">All Services</button>
          <button className="filter-btn">Home Services</button>
          <button className="filter-btn">Vehicle Services</button>
          <button className="filter-btn">Electronics</button>
          <button className="filter-btn">Cleaning</button>
          <button className="filter-btn">Personal Care</button>
          <button className="filter-btn">Events</button>
        </div>
        
        <div className="all-services-grid">
          {allServices.map((service, index) => (
            <div key={index} className="service-item-card">
              <div className="service-icon"><service.icon /></div>
              <h3>{service.name}</h3>
              <span className="service-category">{service.category}</span>
              <button 
                className="book-btn"
                onClick={() => handleBookNow(service.value)}
              >
                Book Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;