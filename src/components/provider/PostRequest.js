import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaTools, FaMapMarkerAlt, FaCalendarAlt, 
  FaRupeeSign, FaPhone, FaClipboard, FaArrowLeft,
  FaCheckCircle, FaClock, FaUser
} from 'react-icons/fa';

const PostRequest = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    serviceType: '',
    description: '',
    location: '',
    schedule: 'asap',
    budget: '',
    contactNumber: '',
    customerName: ''
  });

  const serviceCategories = [
    { id: 1, name: 'Plumbing', icon: '🚰', description: 'Pipes, taps, toilets, drainage' },
    { id: 2, name: 'Electrical', icon: '🔌', description: 'Wiring, switches, fixtures' },
    { id: 3, name: 'AC Repair', icon: '❄️', description: 'AC servicing, gas filling' },
    { id: 4, name: 'Carpentry', icon: '🔨', description: 'Furniture, doors, cabinets' },
    { id: 5, name: 'Painting', icon: '🎨', description: 'Home painting, wall repair' },
    { id: 6, name: 'Cleaning', icon: '🧹', description: 'Home, office, deep cleaning' },
    { id: 7, name: 'Appliance Repair', icon: '🔧', description: 'Washing machine, fridge' },
    { id: 8, name: 'Pest Control', icon: '🐜', description: 'Termite, cockroach, mosquito' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // In real app, this would send to backend
    alert('Your request has been posted! Providers will now order on your service.');
    navigate('/');
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div style={styles.container}>
      {/* Back Button */}
      <div style={styles.backButton}>
        <button onClick={() => navigate('/')} style={styles.backBtn}>
          <FaArrowLeft /> Back to Home
        </button>
      </div>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Post a Service Request</h1>
        <p style={styles.subtitle}>Describe your service need and get Orders from local providers</p>
      </div>

      {/* Progress Bar */}
      <div style={styles.progressContainer}>
        <div style={styles.progressBar}>
          <div style={{...styles.progressFill, width: `${(step/3)*100}%`}}></div>
        </div>
        <div style={styles.progressSteps}>
          <div style={step >= 1 ? styles.activeStep : styles.step}>1. Service Details</div>
          <div style={step >= 2 ? styles.activeStep : styles.step}>2. Location & Schedule</div>
          <div style={step >= 3 ? styles.activeStep : styles.step}>3. Contact Info</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Step 1: Service Details */}
        {step === 1 && (
          <div style={styles.stepContainer}>
            <h2 style={styles.stepTitle}>
              <FaTools style={styles.stepIcon} /> What service do you need?
            </h2>
            
            <div style={styles.categoriesGrid}>
              {serviceCategories.map(category => (
                <div
                  key={category.id}
                  style={{
                    ...styles.categoryCard,
                    borderColor: formData.serviceType === category.name ? '#007bff' : '#e0e0e0',
                    backgroundColor: formData.serviceType === category.name ? '#f0f8ff' : 'white'
                  }}
                  onClick={() => setFormData({...formData, serviceType: category.name})}
                >
                  <div style={styles.categoryIcon}>{category.icon}</div>
                  <h4 style={styles.categoryName}>{category.name}</h4>
                  <p style={styles.categoryDesc}>{category.description}</p>
                </div>
              ))}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <FaClipboard /> Service Description *
              </label>
              <textarea
                style={styles.textarea}
                placeholder="Describe your service need in detail. Be specific about the problem or what you want done..."
                rows="5"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>

            <div style={styles.buttonGroup}>
              <button type="button" style={styles.nextBtn} onClick={handleNext}>
                Next: Location & Schedule →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Location & Schedule */}
        {step === 2 && (
          <div style={styles.stepContainer}>
            <h2 style={styles.stepTitle}>
              <FaMapMarkerAlt style={styles.stepIcon} /> Where and when?
            </h2>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <FaMapMarkerAlt /> Service Location *
              </label>
              <input
                type="text"
                style={styles.input}
                placeholder="Enter your complete address (House #, Street, Area, City)"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                required
              />
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroupHalf}>
                <label style={styles.label}>
                  <FaCalendarAlt /> Preferred Schedule *
                </label>
                <select
                  style={styles.select}
                  value={formData.schedule}
                  onChange={(e) => setFormData({...formData, schedule: e.target.value})}
                  required
                >
                  <option value="asap">As soon as possible</option>
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="this-week">This Week</option>
                  <option value="next-week">Next Week</option>
                  <option value="weekend">Weekend</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              <div style={styles.formGroupHalf}>
                <label style={styles.label}>
                  <FaRupeeSign /> Estimated Budget (Optional)
                </label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="e.g., ₹2,000 - ₹3,000"
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                />
                <small style={styles.helperText}>Helps providers give accurate Orders</small>
              </div>
            </div>

            <div style={styles.buttonGroup}>
              <button type="button" style={styles.prevBtn} onClick={handlePrev}>
                ← Back
              </button>
              <button type="button" style={styles.nextBtn} onClick={handleNext}>
                Next: Contact Info →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Contact Information */}
        {step === 3 && (
          <div style={styles.stepContainer}>
            <h2 style={styles.stepTitle}>
              <FaUser style={styles.stepIcon} /> Contact Information
            </h2>

            <div style={styles.formRow}>
              <div style={styles.formGroupHalf}>
                <label style={styles.label}>Your Name *</label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={formData.customerName}
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  required
                />
              </div>

              <div style={styles.formGroupHalf}>
                <label style={styles.label}>
                  <FaPhone /> Contact Number *
                </label>
                <input
                  type="tel"
                  style={styles.input}
                  placeholder="+92 300 1234567"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                  required
                />
              </div>
            </div>

            <div style={styles.summaryBox}>
              <h3 style={styles.summaryTitle}>Request Summary</h3>
              <div style={styles.summaryItem}>
                <strong>Service:</strong> {formData.serviceType || 'Not selected'}
              </div>
              <div style={styles.summaryItem}>
                <strong>Location:</strong> {formData.location || 'Not provided'}
              </div>
              <div style={styles.summaryItem}>
                <strong>Schedule:</strong> {
                  formData.schedule === 'asap' ? 'As soon as possible' :
                  formData.schedule === 'today' ? 'Today' :
                  formData.schedule === 'tomorrow' ? 'Tomorrow' :
                  formData.schedule === 'this-week' ? 'This Week' :
                  formData.schedule === 'next-week' ? 'Next Week' :
                  formData.schedule === 'weekend' ? 'Weekend' : 'Flexible'
                }
              </div>
              <div style={styles.summaryItem}>
                <strong>Budget:</strong> {formData.budget || 'Not specified'}
              </div>
            </div>

            <div style={styles.infoBox}>
              <FaCheckCircle style={{color: '#28a745', marginRight: '10px'}} />
              <div>
                <strong>What happens next?</strong>
                <p style={{margin: '5px 0 0 0'}}>
                  1. Your request will be visible to verified providers<br />
                  2. Providers will submit their Orders with prices and timelines<br />
                  3. You'll receive Orders within 24 hours<br />
                  4. Choose the best provider based on ratings and price
                </p>
              </div>
            </div>

            <div style={styles.buttonGroup}>
              <button type="button" style={styles.prevBtn} onClick={handlePrev}>
                ← Back
              </button>
              <button type="submit" style={styles.submitBtn}>
                <FaBullhorn /> Post Request & Get Orders
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Benefits Section */}
      <div style={styles.benefitsSection}>
        <h2 style={styles.benefitsTitle}>Why Post on DASTAK?</h2>
        <div style={styles.benefitsGrid}>
          <div style={styles.benefitCard}>
            <FaCheckCircle style={styles.benefitIcon} />
            <h4>Get Multiple Orders</h4>
            <p>Receive competitive orders from verified providers</p>
          </div>
          <div style={styles.benefitCard}>
            <FaUser style={styles.benefitIcon} />
            <h4>Verified Providers</h4>
            <p>All providers are background-checked and rated</p>
          </div>
          <div style={styles.benefitCard}>
            <FaClock style={styles.benefitIcon} />
            <h4>Save Time</h4>
            <p>Compare prices and reviews in one place</p>
          </div>
          <div style={styles.benefitCard}>
            <FaRupeeSign style={styles.benefitIcon} />
            <h4>Best Price</h4>
            <p>Get the best value for your money</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  backButton: {
    marginBottom: '20px'
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  title: {
    fontSize: '36px',
    color: '#333',
    marginBottom: '10px'
  },
  subtitle: {
    fontSize: '18px',
    color: '#666',
    maxWidth: '600px',
    margin: '0 auto'
  },
  progressContainer: {
    marginBottom: '40px'
  },
  progressBar: {
    height: '6px',
    backgroundColor: '#e0e0e0',
    borderRadius: '3px',
    marginBottom: '15px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007bff',
    transition: 'width 0.3s ease'
  },
  progressSteps: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px'
  },
  step: {
    color: '#999'
  },
  activeStep: {
    color: '#007bff',
    fontWeight: 'bold'
  },
  form: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '30px',
    boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
    marginBottom: '40px'
  },
  stepContainer: {
    maxWidth: '800px',
    margin: '0 auto'
  },
  stepTitle: {
    fontSize: '24px',
    color: '#333',
    marginBottom: '30px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  stepIcon: {
    color: '#007bff'
  },
  categoriesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '30px'
  },
  categoryCard: {
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    padding: '20px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    ':hover': {
      borderColor: '#007bff',
      transform: 'translateY(-2px)'
    }
  },
  categoryIcon: {
    fontSize: '32px',
    marginBottom: '10px'
  },
  categoryName: {
    margin: '10px 0 5px 0',
    color: '#333'
  },
  categoryDesc: {
    fontSize: '12px',
    color: '#666',
    margin: 0
  },
  formGroup: {
    marginBottom: '25px'
  },
  formGroupHalf: {
    flex: 1,
    marginBottom: '25px'
  },
  formRow: {
    display: 'flex',
    gap: '20px',
    marginBottom: '25px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px'
  },
  textarea: {
    width: '100%',
    padding: '12px 15px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
    fontFamily: 'Arial, sans-serif'
  },
  select: {
    width: '100%',
    padding: '12px 15px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
    backgroundColor: 'white'
  },
  helperText: {
    display: 'block',
    marginTop: '5px',
    color: '#666',
    fontSize: '14px'
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '40px'
  },
  prevBtn: {
    padding: '12px 30px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  nextBtn: {
    padding: '12px 30px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  submitBtn: {
    padding: '15px 40px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '0 auto'
  },
  summaryBox: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '25px'
  },
  summaryTitle: {
    marginTop: 0,
    marginBottom: '15px',
    color: '#333'
  },
  summaryItem: {
    marginBottom: '8px',
    color: '#555'
  },
  infoBox: {
    backgroundColor: '#f0f8ff',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '25px',
    display: 'flex',
    alignItems: 'flex-start'
  },
  benefitsSection: {
    textAlign: 'center',
    padding: '40px 0'
  },
  benefitsTitle: {
    fontSize: '28px',
    color: '#333',
    marginBottom: '40px'
  },
  benefitsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '30px'
  },
  benefitCard: {
    padding: '25px',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 15px rgba(0,0,0,0.1)'
  },
  benefitIcon: {
    fontSize: '36px',
    color: '#007bff',
    marginBottom: '15px'
  }
};

// Add these to existing styles
Object.assign(styles, {
  benefitCard: {
    padding: '25px',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 15px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s ease'
  }
});

export default PostRequest;