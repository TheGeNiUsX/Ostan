import { createFirebaseUser, deleteFirebaseUser, updateFirebaseUser } from "../src/lib/firebase/admin";

async function testUserFirebaseCRUD() {
  console.log("🔥 Testing Firebase Auth User Creation, Update, and Deletion...\n");

  const testEmail = "sample.worker@ostan-cloud.com";
  const testPass = "SecretPass123!";
  const testName = "Sample Cloud Worker";

  // 1. Create in Firebase Auth
  console.log("1. Creating user in Firebase Auth...");
  const uid = await createFirebaseUser({
    email: testEmail,
    password: testPass,
    displayName: testName,
  });
  console.log("  ✅ Firebase User created! UID:", uid);

  // 2. Update email in Firebase Auth
  const updatedEmail = "sample.updated@ostan-cloud.com";
  console.log(`2. Updating email in Firebase Auth: ${testEmail} -> ${updatedEmail}...`);
  const updated = await updateFirebaseUser({
    oldEmail: testEmail,
    newEmail: updatedEmail,
    displayName: "Sample Updated Worker",
    fbUid: uid,
  });
  console.log("  ✅ Firebase User email updated successfully:", updated);

  // 3. Delete from Firebase Auth (frees up the email completely)
  console.log(`3. Deleting user ${updatedEmail} from Firebase Auth...`);
  const deleted = await deleteFirebaseUser(updatedEmail, uid);
  console.log("  ✅ Firebase User deleted successfully:", deleted);

  console.log("\n=======================================================");
  console.log("🎉 SUCCESS: Firebase User Creation, Update, and Deletion are 100% OPERATIONAL!");
  console.log("=======================================================\n");
}

testUserFirebaseCRUD().catch(console.error);
