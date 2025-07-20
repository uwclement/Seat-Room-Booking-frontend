import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../../api/auth';
import './EmailVerification.css';
import logo from '../../assets/images/logo.jpeg';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setError('Invalid verification link');
        setLoading(false);
        return;
      }

      try {
        const response = await verifyEmail(token);
        if (response.message === 'Email verified successfully!') {
          setVerified(true);
        } else {
          setError('Verification failed. The link may be expired or invalid.');
        }
      } catch (err) {
        setError('An error occurred during verification. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token]);

  const handleContinue = () => {
    navigate('/login');
  };

  const handleResendVerification = () => {
    navigate('/resend-verification');
  };

  return (
    <div className="verification-container">
      <div className="verification-card">
        {/* Logo */}       
        <div className="logo-section">
          <div className="logo-circle">
            <img src={logo} alt="Logo" className="navbar-logo-img" />
          </div>
          <h1 className="app-title">AUCA Library</h1>
        </div>

        {loading ? (
          <div className="content-section loading-state">
            <div className="spinner-container">
              <div className="spinner"></div>
            </div>
            <h2 className="state-heading">Verifying your email...</h2>
            <p className="state-message">Please wait while we confirm your email address</p>
          </div>
        ) : verified ? (
          <div className="content-section success-state">
            <div className="status-icon success-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="state-heading">Email Verified!</h2>
            <p className="state-message">
              Great! Your email has been successfully verified. You can now access all features of your account.
            </p>
            <button onClick={handleContinue} className="primary-button">
              Continue to Login
            </button>
          </div>
        ) : (
          <div className="content-section error-state">
            <div className="status-icon error-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="state-heading">Verification Failed</h2>
            <p className="state-message">{error}</p>
            <div className="button-group">
              <button onClick={handleResendVerification} className="primary-button">
                Resend Verification Email
              </button>
              <button onClick={() => navigate('/login')} className="secondary-button">
                Back to Login
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default EmailVerification;