import React, { useState } from 'react';
import { FaUser, FaIdCard, FaPhone, FaMapMarkerAlt, FaBriefcase, FaUpload } from 'react-icons/fa';

const ProviderRegister = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    cnic: '',
    phone: '',
    serviceType: 'plumber',
    city: 'karachi',
    experience: '',
    areas: '',
    agreeTerms: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.agreeTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }
    
    console.log('Registration data:', formData);
    alert('Registration submitted! Our team will contact you within 24 hours for verification.');
    // Reset form
    setFormData({
      fullName: '',
      cnic: '',
      phone: '',
      serviceType: 'plumber',
      city: 'karachi',
      experience: '',
      areas: '',
      agreeTerms: false
    });
  };

  const serviceTypes = [
    'Plumber', 'Painter', 'Electrician', 'Carpenter',
    'AC Technician', 'Car Mechanic', 'Bike Mechanic',
    'Mason', 'Cleaner', 'Appliance Repair', 'Pest Control'
  ];

  const cities = [
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi',
    'Faisalabad', 'Multan', 'Peshawar', 'Quetta',
    'Gujranwala', 'Sialkot', 'Hyderabad'
  ];

  return (
    <div className="provider-register">
      <div className="register-header">
        <h2>Join DASTAK Provider Network</h2>
        <p>Fill the form below to register as a service provider</p>
      </div>

      <form className="register-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label><FaUser /> Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="Your full name as per CNIC"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label><FaIdCard /> CNIC Number</label>
            <input
              type="text"
              name="cnic"
              placeholder="XXXXX-XXXXXXX-X"
              value={formData.cnic}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label><FaPhone /> Phone Number</label>
            <input
              type="tel"
              name="phone"
              placeholder="03XX-XXXXXXX"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Service Type</label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              required
            >
              {serviceTypes.map((service, index) => (
                <option key={index} value={service.toLowerCase().replace(' ', '-')}>
                  {service}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label><FaMapMarkerAlt /> City</label>
            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            >
              {cities.map((city, index) => (
                <option key={index} value={city.toLowerCase()}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label><FaBriefcase /> Experience (Years)</label>
            <input
              type="number"
              name="experience"
              placeholder="Years of experience"
              value={formData.experience}
              onChange={handleChange}
              required
              min="0"
              max="50"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Service Areas</label>
          <input
            type="text"
            name="areas"
            placeholder="Enter areas where you work (comma separated)"
            value={formData.areas}
            onChange={handleChange}
            required
          />
          <small>Example: Gulshan, DHA, Clifton, Bahadurabad</small>
        </div>

        <div className="form-group">
          <label><FaUpload /> CNIC Front Photo</label>
          <input
            type="file"
            accept="image/*"
            required
          />
          <small>Upload clear photo of CNIC front side (Max 2MB)</small>
        </div>

        <div className="form-group">
          <label><FaUpload /> Recent Photo</label>
          <input
            type="file"
            accept="image/*"
            required
          />
          <small>Upload your recent passport-size photo</small>
        </div>

        <div className="form-terms">
          <input
            type="checkbox"
            name="agreeTerms"
            id="agreeTerms"
            checked={formData.agreeTerms}
            onChange={handleChange}
            required
          />
          <label htmlFor="agreeTerms">
            I agree to DASTAK Provider Terms & Conditions and confirm that all information provided is accurate.
          </label>
        </div>

        <button type="submit" className="btn btn-worker btn-large">
          Submit for Verification
        </button>
      </form>

      <div className="registration-info">
        <h4>Registration Process:</h4>
        <ol>
          <li>Fill and submit this form</li>
          <li>Our team will verify your documents within 24 hours</li>
          <li>You'll receive login credentials via SMS</li>
          <li>Start receiving service requests immediately</li>
        </ol>
      </div>
    </div>
  );
};

export default ProviderRegister;