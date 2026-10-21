// Firebase web config for project "cloudcompany-dbc36". These values are
// public (they identify the project, they don't grant access). Keep them in
// sync with public/firebase-messaging-sw.js.
export const firebaseConfig = {
  apiKey: "AIzaSyC4Kqqq6hMdg8XBudiOPeDUIyVSQXA1FHM",
  authDomain: "cloudcompany-dbc36.firebaseapp.com",
  projectId: "cloudcompany-dbc36",
  storageBucket: "cloudcompany-dbc36.firebasestorage.app",
  messagingSenderId: "591914584119",
  appId: "1:591914584119:web:2386faf825e424adb157b2",
  measurementId: "G-JPCGJN9LYN",
};

// Web Push certificate key pair (public key) from Firebase console >
// Project settings > Cloud Messaging > Web Push certificates.
// Without it the browser can't get an FCM token and push stays off.
export const FIREBASE_VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "";
