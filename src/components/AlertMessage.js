import React, { useEffect } from 'react';
import './AlertMessage.css';

const AlertMessage = ({ message, showAlert, setShowAlert }) => {
  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showAlert, setShowAlert]);

  return (
    <div className={`alert-message ${showAlert ? 'show' : ''}`}>
      <span className="alert-icon">❗</span> {message}
    </div>
  );
};

export default AlertMessage;
