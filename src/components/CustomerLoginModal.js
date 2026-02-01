import React from 'react';
import { FaTimes } from 'react-icons/fa';
import CustomerLogin from './CustomerLogin';

const CustomerLoginModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <FaTimes />
        </button>

        <CustomerLogin onSubmit={(data) => {
          // placeholder: handle login
          console.log('Login data:', data);
          onClose();
        }} />
      </div>
    </div>
  );
};

export default CustomerLoginModal;
