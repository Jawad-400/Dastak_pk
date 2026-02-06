import React from 'react';
import '../styles.css';
import { FaCampground, FaPeopleArrows, FaStar, FaUserShield } from 'react-icons/fa';

const Testimonials = () => {
  return (
    <section className="testimonials">
      <div className="container">
        <h2>What Our Users Say</h2>
        {/* Add testimonials here */}
        
        <FaUserShield/> Muhammad Anwar From Karachi
        <h3>★★★★☆ Good Platform I Got My Issue Resolved While I Am Far From Home</h3>
        
      </div>
    </section>
  );
};

export default Testimonials;
