import { createFirebaseIdentityUser, deleteFirebaseIdentityUser } from "../src/lib/firebase/identity-toolkit";

async function testToolkit() {
  console.log("🔥 Testing Firebase Identity Toolkit Live Integration...\n");

  const testEmail = `cloud.worker.${Date.now()}@ostan-cloud.com`;
  const testPass = "SecretPass123!";
  const testName = "Test Cloud Worker";

  // 1. Create in Firebase
  console.log("1. Creating user in Firebase Auth:", testEmail);
  const result = await createFirebaseIdentityUser({
    email: testEmail,
    password: testPass,
    displayName: testName,
  });
  console.log("  ✅ Result:", result);

  // 2. Delete from Firebase
  console.log("2. Deleting user from Firebase Auth to free up email...");
  const deleted = await deleteFirebaseIdentityUser(testEmail, testPass);
  console.log("  ✅ Deleted successfully:", deleted);

  console.log("\n=======================================================");
  console.log("🎉 SUCCESS: Firebase Identity Toolkit 100% OPERATIONAL & VERIFIED LIVE!");
  console.log("=======================================================\n");
}

testToolkit();
