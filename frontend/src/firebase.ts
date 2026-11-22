// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "automate-ai-c7ca8.firebaseapp.com",
  projectId: "automate-ai-c7ca8",
  storageBucket: "automate-ai-c7ca8.firebasestorage.app",
  messagingSenderId: "157862570882",
  appId: "1:157862570882:web:9593c786ab2fdb0f7c3d9b",
  measurementId: "G-1929ZXY31V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();