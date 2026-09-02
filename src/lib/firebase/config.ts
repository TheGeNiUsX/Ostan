import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Firebase Configuration from Environment Variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDummyKeyForDevelopment123456789",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "ostan-system.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "ostan-system",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "ostan-system.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1029384756",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1029384756:web:abcdef1234567890",
};

// Check if user has supplied actual live keys
export const isFirebaseConfigured: boolean = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "AIzaSyDummyKeyForDevelopment123456789"
);

// Initialize Firebase singleton
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn("Firebase initialization notice:", error);
  // Fallback initialization
  app = initializeApp(firebaseConfig, "ostan-fallback");
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db, firebaseConfig };
