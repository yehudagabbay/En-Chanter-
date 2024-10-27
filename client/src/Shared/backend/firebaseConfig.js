import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAaomqwE9ri0M0be-kzN8eaaQEUwJGpJxw",
  authDomain: "karaoke-app-d3a9c.firebaseapp.com",
  projectId: "karaoke-app-d3a9c",
  storageBucket: "karaoke-app-d3a9c.appspot.com",
  messagingSenderId: "101897435080",
  appId: "1:101897435080:web:e3550c76f9b02e6e4872fd"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;
