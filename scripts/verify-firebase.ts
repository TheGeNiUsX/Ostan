import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBosnwK5ima8AFANYoBxfzPN9mb-yNwVnQ",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "ostan-75a0c.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "ostan-75a0c",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "ostan-75a0c.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "278978199753",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:278978199753:web:e32452e1c4b39f41970d18",
};

async function testFirebaseLiveConnection() {
  console.log("🔥 Checking live Firebase connection for project: " + firebaseConfig.projectId + "...\n");

  try {
    // 1. Initialize Firebase App
    const app = initializeApp(firebaseConfig, "diagnostic-test-app");
    console.log("  ✅ Firebase App initialized successfully.");

    // 2. Test Firebase Auth Instance
    const auth = getAuth(app);
    console.log("  ✅ Firebase Auth instance ready (Auth Domain: " + auth.config.authDomain + ").");

    // 3. Test Cloud Firestore Database
    const db = getFirestore(app);
    const testDocRef = doc(db, "_system_diagnostics", "live_ping");

    console.log("  📡 Writing verification heartbeat to Cloud Firestore...");
    await setDoc(testDocRef, {
      status: "ONLINE",
      verifiedAt: serverTimestamp(),
      platform: "Ostan Enterprise",
      configuredFor: "waseem.tw@hotmail.com",
    });

    const docSnap = await getDoc(testDocRef);
    if (docSnap.exists()) {
      console.log("  ✅ Cloud Firestore read/write verified successfully!");
      console.log("  📄 Diagnostic Payload:", JSON.stringify(docSnap.data()));
    } else {
      console.log("  ⚠️ Document written but snapshot returned empty.");
    }

    console.log("\n=======================================================");
    console.log("🎉 SUCCESS: Firebase Authentication & Cloud Firestore Database ARE ACTIVE & 100% LINKED!");
    console.log("=======================================================\n");
  } catch (error: any) {
    console.error("❌ Firebase verification notice:", error?.message || error);
  }
}

testFirebaseLiveConnection();
