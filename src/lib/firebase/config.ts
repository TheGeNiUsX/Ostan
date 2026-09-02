import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Firebase Configuration for Live Cloud Firestore & Auth (ostan-75a0c)
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBosnwK5ima8AFANYoBxfzPN9mb-yNwVnQ",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "ostan-75a0c.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "ostan-75a0c",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "ostan-75a0c.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "278978199753",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:278978199753:web:e32452e1c4b39f41970d18",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-L275GLK65X",
};

export const isFirebaseConfigured: boolean = true;

// Initialize Firebase singleton
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  app = initializeApp(firebaseConfig, "ostan-realtime");
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db };
