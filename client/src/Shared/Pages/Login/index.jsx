import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import firebase from '../../backend/firebaseConfig'; // ייבוא תצורת ה-Firebase
import 'firebase/compat/auth';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

export default function Login() {
  const [username, setUsername] = useState(''); // שמירת שם המשתמש בסטייט
  const [password, setPassword] = useState(''); // שמירת הסיסמה בסטייט
  const [isLoading, setIsLoading] = useState(false); // מעקב אחרי מצב הטעינה
  const [user, setUser] = useState(null); // שמירת המשתמש המחובר בסטייט
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

  // כתובת ה-API
  const apiUrl = 'http://www.enchanterapiuser.somee.com/api/UsersControllers/';

  // פונקציה לטיפול בהתחברות עם שם משתמש וסיסמה
  // פונקציה לטיפול בהתחברות עם שם משתמש וסיסמה
  const handleUsernamePasswordLogin = async () => {
    setIsLoading(true); // הפעלת מצב טעינה
    try {
      // שליחת בקשת התחברות לשרת ה-API
      const response = await fetch(apiUrl + 'login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify({ userName: username, password: password }), // שליחת פרטי התחברות
      });

      const data = await response.json(); // קבלת התגובה מה-API
      setIsLoading(false); // סיום מצב טעינה

      if (response.ok) {
        console.log('Login Successful');
        // שמירת המידע על המשתמש ב-localStorage כדי שניתן יהיה לגשת אליו מאוחר יותר
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data); // עדכון המשתמש בסטייט

        // ניווט לעמוד הבית לאחר התחברות מוצלחת
        navigate('/home/manager');
      } else {
        alert('Login Failed');
      }

    } catch (error) {
      setIsLoading(false); // סיום מצב טעינה במקרה של שגיאה
      alert(`Error: ${error.message}`); // טיפול בשגיאה
    }
  };

  // useEffect לבדיקת המשתמש ב-LocalStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      navigate('/home/manager'); // אם המשתמש קיים ב-LocalStorage, להעביר לעמוד הבית
    }
  }, [navigate]);


  // פונקציה לטיפול בהתחברות עם Google
  // פונקציה לטיפול בהתחברות עם Google
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider(); // ספק התחברות של Google
    try {
      const result = await signInWithPopup(firebase.auth(), provider); // התחברות עם Google
      const user = result.user; // קבלת פרטי המשתמש מ-Google
      localStorage.setItem('user', JSON.stringify(user)); // שמירת המשתמש ב-LocalStorage
      setUser(user); // עדכון המשתמש בסטייט
      alert(`Login Successful, Welcome ${user.displayName}`);
      console.log('User in HomePage:', user); // בדיקה האם המשתמש קיים בסטייט של עמוד הניהול
      navigate('/home/manager'); // ניווט לעמוד הבית לאחר התחברות מוצלחת
    } catch (error) {
      alert(`Error: ${error.message}`); // טיפול בשגיאה בהתחברות עם Google
    }
  };


  // פונקציה ליציאה מהחשבון
  const handleLogout = async () => {
    try {
      await signOut(firebase.auth()); // יציאה מהחשבון
      alert('Logout Successful');
      navigate('/auth/login'); // חזרה לעמוד ההתחברות לאחר יציאה
    } catch (error) {
      alert(`Error: ${error.message}`); // טיפול בשגיאה בעת יציאה
    }
  };

  // פונקציה שתפעל בעת שליחת הטופס
  const handleSubmit = (e) => {
    e.preventDefault(); // מניעת רענון של הדף בעת שליחת הטופס
    handleUsernamePasswordLogin(); // קריאה לפונקציית ההתחברות עם שם משתמש וסיסמה
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
                onChange={(e) => setUsername(e.target.value)} // עדכון שם המשתמש בסטייט
                required
              />
            </div>
            <div className='input-box'>
              <input
                placeholder='Password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)} // עדכון הסיסמה בסטייט
                required
              />
            </div>

            <button type='submit' className='login-button' disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'} {/* הצגת הודעה בהתאם למצב טעינה */}
            </button>

            <button type='button' className='google-login-button' onClick={handleGoogleLogin}>
              Login with Google {/* כפתור התחברות עם Google */}
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
    </div>
  );
}
