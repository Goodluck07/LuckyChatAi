// utils/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDujASVZ1_wYCc72Hy8Ru6CPHkwC2i2Kdk",
    authDomain: "chatbot-2932f.firebaseapp.com",
    projectId: "chatbot-2932f",
    storageBucket: "chatbot-2932f.appspot.com",
    messagingSenderId: "683166776130",
    appId: "1:683166776130:web:67685ab3ec42af43aa26db",
    measurementId: "G-F4Q8QNBRLV"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
