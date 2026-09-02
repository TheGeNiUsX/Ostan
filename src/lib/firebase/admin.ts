import * as admin from "firebase-admin";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "ostan-75a0c";

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId: projectId,
    });
  } catch (error) {
    console.warn("Firebase Admin initialize warning:", error);
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminFirestore = admin.apps.length ? admin.firestore() : null;

/**
 * Create user in Firebase Auth and return their UID
 */
export async function createFirebaseUser(data: {
  email: string;
  password: string;
  displayName: string;
}): Promise<string | null> {
  const normalizedEmail = data.email.toLowerCase().trim();

  try {
    if (adminAuth) {
      // Check if user already exists
      try {
        const existing = await adminAuth.getUserByEmail(normalizedEmail);
        if (existing) {
          await adminAuth.updateUser(existing.uid, {
            displayName: data.displayName,
            password: data.password,
          });
          return existing.uid;
        }
      } catch (e: any) {
        // user not found, proceed to create
      }

      const userRecord = await adminAuth.createUser({
        email: normalizedEmail,
        password: data.password,
        displayName: data.displayName,
      });

      // Also create document in Cloud Firestore
      if (adminFirestore) {
        await adminFirestore.collection("users").doc(userRecord.uid).set(
          {
            uid: userRecord.uid,
            email: normalizedEmail,
            name: data.displayName,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }

      return userRecord.uid;
    }
  } catch (error: any) {
    console.warn("createFirebaseUser notice:", error?.message || error);
  }
  return null;
}

/**
 * Delete user from Firebase Auth and Cloud Firestore
 */
export async function deleteFirebaseUser(email: string, fbUid?: string | null): Promise<boolean> {
  const normalizedEmail = email.toLowerCase().trim();

  try {
    if (adminAuth) {
      let targetUid = fbUid;

      if (!targetUid) {
        try {
          const userRecord = await adminAuth.getUserByEmail(normalizedEmail);
          targetUid = userRecord?.uid;
        } catch (e) {}
      }

      if (targetUid) {
        // 1. Delete from Firebase Auth
        await adminAuth.deleteUser(targetUid);
        console.log(`🔥 Deleted user ${normalizedEmail} (${targetUid}) from Firebase Auth.`);

        // 2. Delete from Cloud Firestore
        if (adminFirestore) {
          await adminFirestore.collection("users").doc(targetUid).delete();
        }
        return true;
      }
    }
  } catch (error: any) {
    console.warn("deleteFirebaseUser notice:", error?.message || error);
  }
  return false;
}

/**
 * Update user in Firebase Auth (e.g. email change)
 */
export async function updateFirebaseUser(params: {
  oldEmail: string;
  newEmail: string;
  displayName?: string;
  password?: string;
  fbUid?: string | null;
}): Promise<boolean> {
  const normalizedOld = params.oldEmail.toLowerCase().trim();
  const normalizedNew = params.newEmail.toLowerCase().trim();

  try {
    if (adminAuth) {
      let targetUid = params.fbUid;
      if (!targetUid) {
        try {
          const userRecord = await adminAuth.getUserByEmail(normalizedOld);
          targetUid = userRecord?.uid;
        } catch (e) {}
      }

      if (targetUid) {
        const updatePayload: admin.auth.UpdateRequest = {
          email: normalizedNew,
        };
        if (params.displayName) updatePayload.displayName = params.displayName;
        if (params.password) updatePayload.password = params.password;

        await adminAuth.updateUser(targetUid, updatePayload);
        console.log(`🔥 Updated user ${normalizedOld} -> ${normalizedNew} in Firebase Auth.`);

        // Update in Cloud Firestore
        if (adminFirestore) {
          await adminFirestore.collection("users").doc(targetUid).set(
            {
              email: normalizedNew,
              name: params.displayName || undefined,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
        }
        return true;
      }
    }
  } catch (error: any) {
    console.warn("updateFirebaseUser notice:", error?.message || error);
  }
  return false;
}
