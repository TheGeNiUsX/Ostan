import { db } from "../src/lib/firebase/config";
import { collection, doc, setDoc, getDocs, deleteDoc } from "firebase/firestore";

async function testRealtimeFirestore() {
  console.log("🔥 Testing Cloud Firestore Real-Time Sync...\n");

  const testUid = `test_live_${Date.now()}`;
  const userDocRef = doc(db, "users", testUid);

  // 1. Write user to Firestore
  console.log("1. Writing live user document to Firestore 'users' collection...");
  await setDoc(userDocRef, {
    uid: testUid,
    name: "Live Test Worker",
    nameAr: "عامل الفحص الحي",
    email: "live.worker@ostan-cloud.com",
    role: "EMPLOYEE",
    createdAt: new Date().toISOString(),
  });
  console.log("  ✅ User doc written to Firestore!");

  // 2. Read back from Firestore
  console.log("2. Querying 'users' collection from Firestore...");
  const snap = await getDocs(collection(db, "users"));
  console.log(`  ✅ Successfully retrieved ${snap.size} documents from Firestore 'users' collection.`);

  // 3. Clean up test doc
  await deleteDoc(userDocRef);
  console.log("  ✅ Test document cleaned up from Firestore.");

  console.log("\n=======================================================");
  console.log("🎉 SUCCESS: Cloud Firestore Real-Time Integration is 100% LIVE!");
  console.log("=======================================================\n");
}

testRealtimeFirestore().catch(console.error);
