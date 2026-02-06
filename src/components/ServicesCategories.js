import React from 'react';
import '../styles.css';

const ServicesCategories = () => {
  const services = [
    { id: 1, name: 'Plumbing', icon: '🚰', color: '#3498db' },
    { id: 2, name: 'Painting', icon: '🎨', color: '#e74c3c' },
    { id: 3, name: 'Car Service', icon: '🚗', color: '#2ecc71' },
    { id: 4, name: 'Bike Service', icon: '🏍️', color: '#9b59b6' },
    { id: 5, name: 'AC Repair', icon: '❄️', color: '#1abc9c' },
    { id: 6, name: 'Electrician', icon: '⚡', color: '#f1c40f' },
    { id: 7, name: 'Carpenter', icon: '🪚', color: '#e67e22' },
    { id: 8, name: 'Cleaning', icon: '🧹', color: '#95a5a6' },
    { id: 9, name: 'Mason', icon: '🧱', color: '#34495e' },
    { id: 10, name: 'Appliance Repair', icon: '🔧', color: '#8e44ad' },
    { id: 11, name: 'Pest Control', icon: '🐜', color: '#27ae60' },
    { id: 12, name: 'Tiles & Marble', icon: '🧩', color: '#d35400' },
  ];

  return (
  <section className="services-section" id="services">
    <div className="container">
      <h2 className="section-title">Services</h2>
      <p className="section-subtitle">Available in your area</p>
      
      <div className="services-grid">
        {services.map(service => (
          <div key={service.id} className="service-card">
            <div className="service-icon">{service.icon}</div>
            <h3>{service.name}</h3>
            <a href={`#request-${service.name.toLowerCase()}`} className="btn-service">
              Request
            </a>
          </div>
        ))}
      </div>
    </div>
  </section>
  );
};

export default ServicesCategories;
