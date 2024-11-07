import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import firebase from '../../backend/firebaseConfig'; // ייבוא תצורת ה-Firebase
import 'firebase/compat/auth';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { Alert, Snackbar } from '@mui/material'; // ייבוא רכיבי ה-MUI

export default function Login() {
  const [username, setUsername] = useState(''); // שמירת שם המשתמש בסטייט
  const [password, setPassword] = useState(''); // שמירת הסיסמה בסטייט
  const [isLoading, setIsLoading] = useState(false); // מעקב אחרי מצב הטעינה
  const [user, setUser] = useState(null); // שמירת המשתמש המחובר בסטייט
  const [alertMessage, setAlertMessage] = useState(''); // הודעת ההתראה
  const [alertSeverity, setAlertSeverity] = useState('success'); // סוג ההתראה: 'success', 'error', 'warning', 'info'
  const [openAlert, setOpenAlert] = useState(false); // מצב פתיחת ההתראה
  const navigate = useNavigate();

  useEffect(() => {
    // בדיקה אם יש משתמש מחובר בעת טעינת הקומפוננטה


    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
    
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setTimeout(() => {
        navigate('/home/manager');
    }, 3000);  
    }
  }, [navigate]);

  // כתובת ה-API
  const apiUrl = 'http://www.enchanterapiuser.somee.com/api/UsersControllers/';

  // פונקציה לסגירת ההתראה
  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  // פונקציה לטיפול בהתחברות עם שם משתמש וסיסמה
  const handleUsernamePasswordLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(apiUrl + 'login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify({ userName: username, password: password }),
      });

      const data = await response.json();
      setIsLoading(false);
      console.log(data);

      if (response.ok) {
        setAlertMessage('Login Successful');
        setAlertSeverity('success');
        setOpenAlert(true);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        navigate('/home/manager');
      } else {
        setAlertMessage('Login Failed');
        setAlertSeverity('error');
        setOpenAlert(true);
      }
    } catch (error) {
      setIsLoading(false);
      setAlertMessage(`Error: ${error.message}`);
      setAlertSeverity('error');
      setOpenAlert(true);
    }
  };

  // פונקציה לטיפול בהתחברות עם Google
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(firebase.auth(), provider);
      const user = result.user;
      console.log("Google User Details:בדחיקה ראשונה", user);//בדיקה ראשנה
  
      const newUser = {
        userName: user.displayName,
        email: user.email,
        phone: user.phoneNumber || "000-0000000",
        password: "GoogleOAuthUser123",
        birthday: new Date().toISOString().split('T')[0],
        avatarUrl: "",
        link: "",
        ipUser: "",
      };
  
      console.log("New User Details:בדיקה שניה ", newUser);//בדיקה שניה
  
      // בדיקת קיום המשתמש במערכת
      const response = await fetch('http://apienchanter.somee.com/api/UsersControllers/email/' + user.email, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
      });
      console.log("Response:בדיקה שלישית", response);//בדיקה שלישית
      if (response.ok) {
        // משתמש נמצא במערכת - התחברות
        const userData = await response.json();
        console.log('User found:בדיקה שלישית', userData);//בדיקה שלישית
  
        // התחברות עם ה-API של הלוגין
        const loginResponse = await fetch(apiUrl + 'login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
          },
          body: JSON.stringify({ userName: userData.userName, password: "GoogleOAuthUser123" }),
        });
  
        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          localStorage.setItem('user', JSON.stringify(loginData)); // שמירת פרטי המשתמש ב-localStorage
          setUser(loginData);
          setAlertMessage(`Login Successful, Welcome back ${user.displayName}`);
          setAlertSeverity('success');
          setOpenAlert(true);
            navigate('/home/manager');
      

        } else {
          console.error('Login failed:', loginResponse.status);
          setAlertMessage('Login Failed');
          setAlertSeverity('error');
          setOpenAlert(true);
        }
      } else {
        // משתמש לא נמצא - יצירת משתמש חדש
        console.log('User not found in the system, creating new user: ' );
        console.log(response)
        console.log(newUser)
        const createUserResponse = await fetch('http://www.ApiEnchanter.somee.com/api/UsersControllers/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
          },
          body: JSON.stringify(newUser),
        });
  
        if (createUserResponse.ok) {
          setAlertMessage(`Registration Successful, Welcome ${user.displayName}`);
          setAlertSeverity('success');
          setOpenAlert(true);
  
          // התחברות לאחר יצירת משתמש חדש
          const loginAfterCreateResponse = await fetch(apiUrl + 'login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'accept': 'application/json',
            },
            body: JSON.stringify({ userName: newUser.userName, password: "GoogleOAuthUser123" }),
          });
  
          if (loginAfterCreateResponse.ok) {
            const loginAfterCreateData = await loginAfterCreateResponse.json();
            localStorage.setItem('user', JSON.stringify(loginAfterCreateData)); // שמירת פרטי המשתמש ב-localStorage
            setUser(loginAfterCreateData);
            setAlertMessage(`Login Successful, Welcome ${user.displayName}`);
            setAlertSeverity('success');
            setOpenAlert(true);
            navigate('/home/manager');
          } else {
            console.error('Login after create failed:', loginAfterCreateResponse.status);
            setAlertMessage('Failed to login after registration.');
            setAlertSeverity('error');
            setOpenAlert(true);
          }
        } else {
          console.error('Failed to create new user:', createUserResponse.status);
          setAlertMessage('Failed to register the user.');
          setAlertSeverity('error');
          setOpenAlert(true);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setAlertMessage(`Error: ${error.message}`);
      setAlertSeverity('error');
      setOpenAlert(true);
    }
  };
  

  // פונקציה ליציאה מהחשבון
  const handleLogout = async () => {
    try {
      await signOut(firebase.auth());
      setAlertMessage('Logout Successful');
      setAlertSeverity('success');
      setOpenAlert(true);
      navigate('/');
    } catch (error) {
      setAlertMessage(`Error: ${error.message}`);
      setAlertSeverity('error');
      setOpenAlert(true);
    }
  };

  // פונקציה שתפעל בעת שליחת הטופס
  const handleSubmit = (e) => {
    e.preventDefault();
    handleUsernamePasswordLogin();
  };

  return (
    <div className='container'>
      {user ? (
        <div className='home'>
          <h1>Welcome, {user.displayName || user.email}</h1>
          <button onClick={handleLogout} className='logout-button'>
            Log Out
          </button>
        </div>
      ) : (
        <div className='left-side login-background'>
          <h1>Welcome to En'chanter la compagnie</h1>
          <p>Take full control of your karaoke experience! Easily manage rooms, users, and song queues with real-time audio streaming. Elevate every session to a new level of fun and organization.</p>

          <button className='read-more'>Read More</button>
        </div>
      )}
      {!user && (
        <div className='right-side'>
          <form className='auth' onSubmit={handleSubmit}>
            <h3>Hello Again!</h3>
            <p>Welcome Back</p>

            <div className='input-box'>
              <input
                placeholder='user name'
                type='text'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className='input-box'>
              <input
                placeholder='Password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type='submit' className='login-button' disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>

            <button type='button' className='google-login-button' onClick={handleGoogleLogin}>
              Login with Google
            </button>

            <p className='forgot-password'>
              <a onClick={() => navigate('/auth/forgetPass')}>Forgot Password <span className='arrow'>→</span></a>
            </p>
            <p className='register-link'>
              <a onClick={() => navigate('/auth/register')}>Register <span className='arrow'>→</span></a>
            </p>
          </form>
        </div>
      )}

      {/* התראה מעוצבת של MUI */}
      <Snackbar
        open={openAlert}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // שינוי מיקום ההתראה
      >
        <Alert onClose={handleCloseAlert} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
