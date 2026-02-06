import React from 'react';
import '../styles.css';
import { FaClipboardList, FaUsers, FaMoneyBillWave, FaCheckCircle } from 'react-icons/fa';

const HowItWorks = () => {
const steps = [
  {
    icon: <FaClipboardList />,
    title: "Post",
    description: "Describe what you need"
  },
  {
    icon: <FaUsers />,
    title: "Compare",
    description: "Review Orders from providers"
  },
  {
    icon: <FaMoneyBillWave />,
    title: "Choose",
    description: "Select the right professional"
  },
  {
    icon: <FaCheckCircle />,
    title: "Complete",
    description: "Job done, payment secured"
  }
];

return (
  <section className="how-it-works" id="how-it-works">
    <div className="container">
      <h2 className="section-title">How It Works</h2>
      <p className="section-subtitle">Simple. Secure. Efficient.</p>
      
      <div className="steps-container">
        {steps.map((step, index) => (
          <div key={index} className="step-card">
            <div className="step-icon">{step.icon}</div>
            <div className="step-number">{index + 1}</div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
};

export default HowItWorks;
