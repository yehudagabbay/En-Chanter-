import React, { useState } from 'react';
import './forget.css';

export default function ForgetPass() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // כתובת ה-API
  const apiUrl = 'http://www.enchanterapiuser.somee.com/api/UsersControllers/';

  const handleResetClick = async () => {
    try {
      const response = await fetch(apiUrl + 'send-reset-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify({ email: email }), // שליחת מייל לקבלת קוד איפוס
      });
      console.log("after fetch ", response);

      if (response.ok) {
        // Generate a random 4-digit code
        const randomCode = Math.floor(1000 + Math.random() * 9000);
        console.log(`Generated Code: ${randomCode}`);
        setCode(randomCode);
        setStep(2); // מעבר לשלב הבא אם הבקשה הצליחה
      } else {
        alert('Failed to send reset code');
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleCodeVerification = () => {
    // Here you would verify the code entered by the user with the backend
    if (code === parseInt(document.getElementById('verificationCode').value)) {
      setStep(3); // אם הקוד אומת בהצלחה, מעבר לשלב הבא
    } else {
      alert('Verification code is incorrect');
    }
  };

  const handlePasswordReset = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      const response = await fetch(apiUrl + 'reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify({ email: email, password: password }),
      });
      if (response.ok) {
        alert('Password reset successful!');
        setStep(1); // Reset steps after successful password reset
      } else {
        alert('Failed to reset password');
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className='container'>
      <div className='reverse-left-side'>
        <form className="auth" onSubmit={(e) => e.preventDefault()}>
          {step === 1 && (
            <>
              <h3>Password Reset</h3>
              <h1>Enter your email to get a code reset</h1>
              <div className="input-box">
                <input
                  placeholder='Enter Email'
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button onClick={handleResetClick} className="submit-button">Send Code</button>
            </>
          )}

          {step === 2 && (
            <>
              <h3>Verify Code</h3>
              <div className="input-box">
                <input
                  id='verificationCode'
                  placeholder='Enter Code'
                  type="text"
                  required
                />
              </div>
              <button onClick={handleCodeVerification} className="submit-button">Verify Code</button>
            </>
          )}

          {step === 3 && (
            <>
              <h3>Set New Password</h3>
              <div className="input-box">
                <input
                  placeholder='New Password'
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="input-box">
                <input
                  placeholder='Confirm Password'
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button onClick={handlePasswordReset} className="submit-button">Reset Password</button>
            </>
          )}
        </form>
      </div>

      <div className='reverse-right-side'>
        <h1>GoFinance</h1>
        <p>The most popular peer to peer lending at SEA</p>
        <button className="read-more">Read More</button>
      </div>
    </div>
  );
}