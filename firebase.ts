import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDBma5XO19j_-Zsotk13zFnLVrcucmsffQ",
  authDomain: "sfarok-7bd30.firebaseapp.com",
  projectId: "sfarok-7bd30",
  storageBucket: "sfarok-7bd30.firebasestorage.app",
  messagingSenderId: "1061286128592",
  appId: "1:1061286128592:web:50d1006dcb80e25333a7d5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Firestore
const db = getFirestore(app);

export { auth, googleProvider, db, app };