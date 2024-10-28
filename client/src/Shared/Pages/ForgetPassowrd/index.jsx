import React, { useState } from 'react';
import './forget.css';

export default function ForgetPass() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(''); // שמירת הקוד האקראי שנשלח למשתמש
  const [inputCode, setInputCode] = useState(''); // קוד שהמשתמש מזין
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // כתובת ה-API
  const apiUrl = 'http://www.enchanterapiuser.somee.com/api/UsersControllers/';

  // פונקציה לשליחת קוד איפוס למייל של המשתמש
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

      if (response.ok) {
        // יצירת קוד אקראי בן 4 ספרות ושמירה ב-state (לצורך התהליך המקומי)
        const randomCode = Math.floor(1000 + Math.random() * 9000);
        console.log(`Generated Code: ${randomCode}`);
        setCode(randomCode); // שמירת הקוד ב-state בלבד
        setStep(2); // מעבר לשלב הבא אם הבקשה הצליחה
      } else {
        alert('Failed to send reset code');
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  // פונקציה לאימות קוד האיפוס
  const handleCodeVerification = () => {
    // אימות קוד האיפוס על בסיס ה-state של הקוד
    if (parseInt(inputCode) === code) {
      setStep(3); // אם הקוד אומת בהצלחה, מעבר לשלב הבא
    } else {
      alert('Verification code is incorrect');
    }
  };

  // פונקציה לאיפוס הסיסמה
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
        setStep(1); // איפוס השלב לאחר איפוס הסיסמה בהצלחה
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
                  value={inputCode} // שימוש ב-state לשמירת הקוד שהמשתמש מכניס
                  onChange={(e) => setInputCode(e.target.value)} // עדכון ה-state עם הערך שהמשתמש מזין
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
        <h1>En'chanter Karaoke System </h1>
        <p>Easily reset your password to regain full access to your karaoke experience.</p><br/>

        <button className="read-more">Read More</button>
      </div>
    </div>
  );
}
