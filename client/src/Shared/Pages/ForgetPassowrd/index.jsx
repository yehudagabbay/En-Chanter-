import React, { useEffect, useState } from 'react';
import './forget.css';
import MicTable from "../../../assets/Images/micTable.jpg";


import checkCircle from '../../../assets/Images/check-circle.svg';
import crossCircle from '../../../assets/Images/cross-circle.svg';
import emailjs from "@emailjs/browser"
import { Notification } from '../../Components';
import { useNavigate } from 'react-router-dom';

export default function ForgetPass() {
  const [step, setStep] = useState(1);
  const [isEmailSended, setIsEmailSended] = useState(false)
  const [notificationClass, setNotificationClass] = useState("")
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(''); // שמירת הקוד האקראי שנשלח למשתמש
  const [inputCode, setInputCode] = useState(''); // קוד שהמשתמש מזין
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userID, setUserID] = useState('');
  const navigate = useNavigate();


  const apiUrl = 'http://www.Enchanter.somee.com/api/UsersControllers/email';

  // // שלב 1: פונקציה לשליחת קוד איפוס למייל של המשתמש לאחר אימות המייל
  // const handleResetClick = async () => {
  //   try {
  //     const emailVerificationResponse = await fetch(apiUrl + email, {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'accept': 'application/json',
  //       },
  //     });
  //       console.log(emailVerificationResponse);
  //     if (emailVerificationResponse.ok) {
  //       // שליפת נתוני המשתמש מהתשובה
  //       const userData = await emailVerificationResponse.json();
  //       const { email: userEmail, name, phone,userID } = userData; // דסטרקטורינג כדי לשלוף את הפרטים

  //       // הדפסת הנתונים לבדיקה
  //       console.log(`User Email: ${userEmail}`);
  //       console.log(`User Name: ${name}`);
  //       console.log(`User Phone: ${phone}`);
  //       console.log(`User ID: ${userID}`);

  //       // שלב קוד אקראי

  //       setStep(2); // מעבר לשלב אימות הקוד
  //     } else {
  //       alert('המייל שהוזן אינו קיים במערכת.');
  //     }
  //   } catch (error) {
  //     alert(`שגיאה: ${error.message}`);
  //   }
  // };
  useEffect(() => {
    if (isEmailSended) {
      setTimeout(() => {
        setIsEmailSended(false)
        setNotificationClass("")
      }, 3000)
    }
  }, [isEmailSended])
  // const handleResetClick = async () => {
  //   try {
  //     const response = await fetch(`http://ApiEnchanter.somee.com/api/UsersControllers/email/` + email, {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Accept: 'application/json',
  //       },
  //     });
  //     const userData = await response.json();
  //     console.log(userData);

  //     if (response.ok) {
  //       setUser(userData); // Correctly set user state
  //       alert('Verification code sent to your phone.');
  //     } else {
  //       alert('Error sending verification code.');
  //     }
  //   } catch (error) {
  //     console.error('Error:', error.message);
  //     alert('Error sending code: ' + error.message);
  //   } finally {
  //   }
  // }

  // שלב 2: פונקציה לאימות קוד האיפוס
  const handleCodeVerification = () => {
    if (inputCode === code) {
      setStep(3); // אם הקוד אומת בהצלחה, מעבר לשלב איפוס הסיסמה
    } else {
      alert('קוד אימות שגוי, אנא נסה שוב.');
    }
  };


  // שלב 3: פונקציה לאיפוס הסיסמה
  const handlePasswordReset = async () => {
    if (password !== confirmPassword) {
      alert('הסיסמאות אינן תואמות, אנא בדוק את הנתונים.');
      return;
    }
    try {
      const response = await fetch(`http://www.Enchanter.somee.com/api/UsersControllers/password/${userID}` , {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify({ newPassword:password }),
      });
      if (response.ok) {
        alert('איפוס הסיסמה הצליח!');
       navigate("/");
      } else {
        alert('איפוס הסיסמה נכשל, נסה שנית.');
      }
    } catch (error) {
      alert(`שגיאה: ${error.message}`);
    }
  };


  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Handle reset password form submission
  const onSendOTP = async (e) => {
    e.preventDefault();

    // Generate an OTP
    const otp = generateOTP();
    setCode(otp);

    // Prepare template parameters
    const templateParams = {
      to_email: email,
      from_name: "En-Chanter Karaoke",
      otp: otp
    };//894814

    try {
      const res = await fetch(`${apiUrl}/${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      console.log(res);
      if (res.ok) {
        const userData = await res.json();
        console.log(userData);

        setUserID(userData.id);//שמירת האיידי של המשתמש לשלב שלוש

        console.log('userData.id' , userData.id);

        const result = await emailjs.send(
          "service_ygq26wb",  // Your new Template ID for reset password from EmailJS
          "template_jquxgyg", // Your Service ID from EmailJS
          templateParams,
          "hYRY7OYpqMI-BDRO_"    // Your Public Key from EmailJS
        );
        console.log("OTP Sent:", result);
        setNotificationClass("notification-success")
        setIsEmailSended(true);
        setStep(2); // Move to the next step
        setEmail(""); // Clear the email input
      }
      else {
        alert('אימייל שגוי');
      }
    } catch (error) {
      setNotificationClass("notification-error")
      setIsEmailSended(true);

      setEmail("");

      console.error("Error:", error);

    }
  };



  return (
    <div className='container'>
      <div className='reverse-left-side'>
        <div className="content">
          <form className="auth" onSubmit={(e) => e.preventDefault()}>
            {step === 1 && (
              <>
                <h3>Password Reset</h3>
                <h1>Enter your email to get a code reset</h1>
                <div className="input-box">
                  <input
                    placeholder='Enter Email'
                    name='to_email'
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button onClick={onSendOTP} className="submit-button">Send Code</button>
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
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
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
          {isEmailSended && <Notification
            classNames={notificationClass}
            icon={notificationClass.includes("success") ? checkCircle : crossCircle}
            emoji={notificationClass.includes("success") ? "🚀" : "☹️"}

          />}
        </div>
      </div >

      <div className='reverse-right-side'>
        <div className="content">
          <h1>En'chanter Karaoke System </h1>
          <p>Easily reset your password to regain full access to your karaoke experience.</p><br />
          <button className="read-more">Read More</button>
        </div>
      </div>
    </div >
  );
}
