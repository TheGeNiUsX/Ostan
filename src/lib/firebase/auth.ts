import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "./config";

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  nameAr?: string | null;
  role: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "STOCK_MANAGER" | "EMPLOYEE";
  status: "ACTIVE" | "ON_LEAVE" | "SUSPENDED" | "TERMINATED";
  isProtected: boolean;
  departmentId?: string | null;
  sectionAccess?: Record<string, "accessible" | "locked" | "hidden">;
  createdAt?: any;
}

/**
 * Register a new user in Firebase Auth and create their Firestore profile
 */
export async function registerWithFirebase(
  name: string,
  email: string,
  pass: string
): Promise<{ user: UserProfile; isAutoSuperAdmin: boolean }> {
  const normalizedEmail = email.toLowerCase().trim();
  const isWaseem = normalizedEmail === "waseem.tw@hotmail.com";

  if (!isFirebaseConfigured) {
    // Graceful offline mock if keys not yet inserted
    const mockUser: UserProfile = {
      uid: "fb-" + Date.now().toString(),
      email: normalizedEmail,
      name: name.trim(),
      role: isWaseem ? "SUPER_ADMIN" : "EMPLOYEE",
      status: "ACTIVE",
      isProtected: isWaseem,
      sectionAccess: {
        reminders: "accessible",
        tasks: "accessible",
        workers: isWaseem ? "accessible" : "hidden",
        warehouse: "accessible",
        settings: "accessible",
      },
    };
    return { user: mockUser, isAutoSuperAdmin: isWaseem };
  }

  // 1. Create in Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, pass);
  const fbUser = userCredential.user;

  // 2. Update display name
  await updateProfile(fbUser, { displayName: name.trim() });

  // 3. Create Firestore User Profile Document
  const userProfile: UserProfile = {
    uid: fbUser.uid,
    email: normalizedEmail,
    name: name.trim(),
    role: isWaseem ? "SUPER_ADMIN" : "EMPLOYEE",
    status: "ACTIVE",
    isProtected: isWaseem,
    sectionAccess: {
      reminders: "accessible",
      tasks: "accessible",
      workers: isWaseem ? "accessible" : "hidden",
      warehouse: "accessible",
      settings: "accessible",
    },
    createdAt: serverTimestamp(),
  };

  const userDocRef = doc(db, "users", fbUser.uid);
  await setDoc(userDocRef, userProfile, { merge: true });

  return { user: userProfile, isAutoSuperAdmin: isWaseem };
}

/**
 * Sign in existing user with Firebase Auth
 */
export async function loginWithFirebase(
  email: string,
  pass: string
): Promise<{ user: UserProfile }> {
  const normalizedEmail = email.toLowerCase().trim();
  const isWaseem = normalizedEmail === "waseem.tw@hotmail.com";

  if (!isFirebaseConfigured) {
    // Graceful offline mock
    const mockUser: UserProfile = {
      uid: "fb-waseem",
      email: normalizedEmail,
      name: isWaseem ? "Waseem Al-Otaibi" : "Ostan Worker",
      role: isWaseem ? "SUPER_ADMIN" : "EMPLOYEE",
      status: "ACTIVE",
      isProtected: isWaseem,
      sectionAccess: {
        reminders: "accessible",
        tasks: "accessible",
        workers: isWaseem ? "accessible" : "hidden",
        warehouse: "accessible",
        settings: "accessible",
      },
    };
    return { user: mockUser };
  }

  const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, pass);
  const fbUser = userCredential.user;

  // Retrieve user document from Firestore
  const userDocRef = doc(db, "users", fbUser.uid);
  const snap = await getDoc(userDocRef);

  let profile: UserProfile;
  if (snap.exists()) {
    profile = snap.data() as UserProfile;
  } else {
    // Auto-create document if first time
    profile = {
      uid: fbUser.uid,
      email: normalizedEmail,
      name: fbUser.displayName || (isWaseem ? "Waseem Al-Otaibi" : "Worker"),
      role: isWaseem ? "SUPER_ADMIN" : "EMPLOYEE",
      status: "ACTIVE",
      isProtected: isWaseem,
      sectionAccess: {
        reminders: "accessible",
        tasks: "accessible",
        workers: isWaseem ? "accessible" : "hidden",
        warehouse: "accessible",
        settings: "accessible",
      },
      createdAt: serverTimestamp(),
    };
    await setDoc(userDocRef, profile);
  }

  return { user: profile };
}

/**
 * Sign out from Firebase
 */
export async function logoutFirebase(): Promise<void> {
  if (isFirebaseConfigured) {
    await signOut(auth);
  }
}

/**
 * Subscribe to Firebase Auth state changes
 */
export function onFirebaseAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
  if (isFirebaseConfigured) {
    return onAuthStateChanged(auth, callback);
  }
  return () => {};
}
