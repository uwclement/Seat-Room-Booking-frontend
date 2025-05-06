import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../../api/auth';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import '../../assets/css/auth.css';

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

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2 className="auth-heading">Email Verification</h2>
        
        {loading ? (
          <div className="auth-loading">
            <div className="loading-spinner"></div>
            <p>Verifying your email...</p>
          </div>
        ) : verified ? (
          <div className="auth-success-container">
            <div className="auth-success-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h3 className="auth-success-heading">Email verified successfully!</h3>
            <p className="auth-success-message">
              Your email has been verified. You can now log in to your account.
            </p>
            <Button variant="primary" onClick={handleContinue}>
              Continue to Login
            </Button>
          </div>
        ) : (
          <Alert type="danger" message={error} />
        )}
      </div>
    </div>
  );
};

export default EmailVerification;