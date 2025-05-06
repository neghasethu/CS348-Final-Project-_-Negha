import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    try {
      const response = await fetch('/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, new_password: newPassword })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Password reset successfully!');
        // Optionally, navigate back to login after a delay:
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.error || 'Failed to reset password.');
      }
    } catch (err) {
      console.error("Error resetting password:", err);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Reset Password</h2>
      <form onSubmit={handleReset}>
        <div style={{ marginBottom: 10 }}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ marginRight: 8 }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <input 
            type="password" 
            placeholder="New Password" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            required 
            style={{ marginRight: 8 }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {message && <p style={{ color: 'green' }}>{message}</p>}
        <button type="submit">Reset Password</button>
      </form>
      <button onClick={() => navigate('/login')} style={{ marginTop: 10 }}>
        Back to Login
      </button>
    </div>
  );
}
