import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Email/Password Auth ---
  function signup(email, password, name) {
    return createUserWithEmailAndPassword(auth, email, password)
      .then((result) => {
        // Update profile with display name
        return updateProfile(result.user, {
          displayName: name
        });
      });
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  // --- Google Auth ---
  function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }

  // --- Email Link Auth ---
  function sendEmailLink(email) {
    const actionCodeSettings = {
      url: "https://labyrinth-db7a0.web.app", // or your custom redirect URL
      handleCodeInApp: true,
    };
    return sendSignInLinkToEmail(auth, email, actionCodeSettings)
      .then(() => {
        window.localStorage.setItem('emailForSignIn', email);
      });
  }

  function completeEmailLinkSignIn() {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        email = window.prompt('Please provide your email for confirmation');
      }
      return signInWithEmailLink(auth, email, window.location.href)
        .then((result) => {
          window.localStorage.removeItem('emailForSignIn');
          setCurrentUser(result.user); // Set the user after sign-in
          window.history.replaceState({}, document.title, '/'); // Clean up URL
          return result;
        });
    }
    return Promise.reject("Not an email sign-in link");
  }

  // --- Phone Auth ---
  function setupRecaptcha(containerId = 'recaptcha-container', size = 'invisible', callback) {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size,
        callback: callback || (() => {}),
        'expired-callback': () => {
          // Optionally handle expiration
        }
      });
    }
    return window.recaptchaVerifier;
  }

  function sendPhoneCode(phoneNumber, recaptchaContainerId = 'recaptcha-container') {
    const appVerifier = setupRecaptcha(recaptchaContainerId);
    return signInWithPhoneNumber(auth, phoneNumber, appVerifier)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
        return confirmationResult;
      });
  }

  function confirmPhoneCode(code) {
    if (window.confirmationResult) {
      return window.confirmationResult.confirm(code).then((result) => {
        setCurrentUser(result.user);
        return result;
      });
    } else {
      return Promise.reject(new Error('No confirmation result found.'));
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    signInWithGoogle,
    sendEmailLink,
    completeEmailLinkSignIn,
    sendPhoneCode,
    confirmPhoneCode,
    setupRecaptcha
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 