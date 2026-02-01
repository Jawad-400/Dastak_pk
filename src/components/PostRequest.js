import React, { useState } from 'react';
import { FaMapMarkerAlt, FaCalendarAlt, FaMoneyBillWave } from 'react-icons/fa';

const PostRequest = () => {
  const [formData, setFormData] = useState({
    serviceType: '',
    description: '',
    location: '',
    dateTime: '',
    budget: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Request posted:', formData);
    alert('Your request has been posted! Nearby workers will Order within minutes.');
  };

  return (
    <section className="post-request" id="post-request">
      <div className="container">
        <h2 className="section-title">Post a Service Request</h2>
        <p className="section-subtitle">Get multiple Orders from local professionals</p>
        
        <form className="request-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Service Type</label>
            <select 
              name="serviceType" 
              value={formData.serviceType}
              onChange={handleChange}
              required
            >
  <option value="">-- Select Service Type --</option>
  <option value="plumbing">Plumbing</option>
  <option value="electrical">Electrical Work</option>
  <option value="painting">Painting & Whitewash</option>
  <option value="carpentry">Carpentry</option>
  <option value="ac-repair">AC Repair</option>
  <option value="masonry">Masonry</option>
  <option value="waterproofing">Waterproofing</option>
  <option value="flooring">Flooring</option>
  <option value="car-repair">Car Repair</option>
  <option value="bike-repair">Bike Repair</option>
  <option value="car-wash">Car Wash</option>
  <option value="towing">Towing Service</option>
  <option value="denting">Denting & Painting</option>
  <option value="tire-change">Tire Change</option>
  <option value="mobile-repair">Mobile Repair</option>
  <option value="tv-repair">TV Repair</option>
  <option value="fridge-repair">Refrigerator Repair</option>
  <option value="washing-machine">Washing Machine Repair</option>
  <option value="generator-repair">Generator Repair</option>
  <option value="inverter-repair">Inverter/UPS Repair</option>
  <option value="microwave-repair">Microwave Oven Repair</option>
  <option value="water-dispenser">Water Dispenser Repair</option>
  <option value="home-cleaning">Home Cleaning</option>
  <option value="carpet-cleaning">Carpet Cleaning</option>
  <option value="sofa-cleaning">Sofa Cleaning</option>
  <option value="kitchen-cleaning">Kitchen Deep Clean</option>
  <option value="tank-cleaning">Water Tank Cleaning</option>
  <option value="pest-control">Pest Control</option>
  <option value="bathroom-cleaning">Bathroom Deep Cleaning</option>
  <option value="mattress-cleaning">Mattress Cleaning</option>
  <option value="barber">Home Barber</option>
  <option value="beautician">Beautician at Home</option>
  <option value="tailor">Tailor Services</option>
  <option value="cobbler">Cobbler</option>
  <option value="mehndi">Mehndi Artist</option>
  <option value="catering">Catering</option>
  <option value="photography">Photography</option>
  <option value="videography">Videography</option>
  <option value="decoration">Event Decoration</option>
  <option value="dj">DJ Services</option>
  <option value="tent-house">Tent House</option>
  <option value="generator-rental">Generator on Rent</option>
  <option value="tuition">Home Tuition</option>
  <option value="quran-teaching">Quran Teaching</option>
  <option value="computer-courses">Computer Courses</option>
  <option value="typing">Typing Services</option>
  <option value="cv-making">CV Making</option>
  <option value="parcel-delivery">Parcel Delivery</option>
  <option value="moving-service">Moving Service</option>
  <option value="car-rental">Car Rental</option>
  <option value="bike-rental">Bike Rental</option>
  <option value="computer-repair">Computer Repair</option>
  <option value="laptop-repair">Laptop Repair</option>
  <option value="internet-setup">Internet Setup</option>
  <option value="printer-repair">Printer Repair</option>
  <option value="cctv-installation">CCTV Installation</option>
  <option value="home-theater">Home Theater Setup</option>
  <option value="data-recovery">Data Recovery</option>
  <option value="key-making">Key Making</option>
  <option value="watch-repair">Watch Repair</option>
  <option value="gas-stove">Gas Stove Repair</option>
  <option value="water-filter">Water Filter Installation</option>
  <option value="gardening">Gardening</option>
  <option value="pet-services">Pet Services</option>
  <option value="legal-services">Legal Services</option>
  <option value="medical-services">Medical Services at Home</option>
  <option value="umbrella-repair">Umbrella Repair</option>
  <option value="laundry">Laundry Service</option>
  <option value="sewage-cleaning">Sewage Cleaning</option>
  <option value="water-tanker">Water Tanker Booking</option>
  <option value="marriage-bureau">Marriage Bureau Services</option>
  <option value="loaders">Loaders/Unloaders</option>
  <option value="sacrifice">Goat/Cow Sacrifice Service</option>
</select>
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea 
              name="description"
              placeholder="Describe what you need in detail..."
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label><FaMapMarkerAlt /> Location</label>
              <input 
                type="text" 
                name="location"
                placeholder="Enter your area/city"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label><FaCalendarAlt /> Preferred Time</label>
              <input 
                type="datetime-local"
                name="dateTime"
                value={formData.dateTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label><FaMoneyBillWave /> Budget (PKR)</label>
            <input 
              type="number" 
              name="budget"
              placeholder="Enter your budget amount"
              value={formData.budget}
              onChange={handleChange}
              required
              min="0"
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-large">
            Post Request & Get Orders
          </button>
        </form>
      </div>
    </section>
  );
};

export default PostRequest;