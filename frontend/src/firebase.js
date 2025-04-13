// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDNQTaT7TRhDilCaQLgw795etr2QtmAtcY",
  authDomain: "pictogram-a2f9d.firebaseapp.com",
  projectId: "pictogram-a2f9d",
  storageBucket: "pictogram-a2f9d.firebasestorage.app",
  messagingSenderId: "324283295964",
  appId: "1:324283295964:web:bcdf9559f84f1dfbf3ec19",
  measurementId: "G-8JL3HQXZB3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth and Provider
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// Optional: Analytics (only works in browser environments)
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}
