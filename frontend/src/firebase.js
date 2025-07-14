// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBF-GSsnayoyAfRhX29TnCErXD4N4pT3pk",
  authDomain: "labyrinth-db7a0.firebaseapp.com",
  projectId: "labyrinth-db7a0",
  storageBucket: "labyrinth-db7a0.appspot.com",
  messagingSenderId: "316561291107",
  appId: "1:316561291107:web:339b5ea3341d774f3a0556",
  measurementId: "G-JZZX7J7C73"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage }; 