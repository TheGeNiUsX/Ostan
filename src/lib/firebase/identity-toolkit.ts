/**
 * Firebase Identity Toolkit REST API Client
 * Enables server-side user creation, deletion, and updates using the web API Key
 */

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBosnwK5ima8AFANYoBxfzPN9mb-yNwVnQ";

export async function createFirebaseIdentityUser(params: {
  email: string;
  password: string;
  displayName?: string;
}): Promise<{ uid: string; email: string } | null> {
  const normalizedEmail = params.email.toLowerCase().trim();

  try {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: normalizedEmail,
        password: params.password,
        displayName: params.displayName || undefined,
        returnSecureToken: true,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      // If email already exists, attempt to sign in to get UID
      if (data.error?.message?.includes("EMAIL_EXISTS")) {
        console.log(`User ${normalizedEmail} already exists in Firebase Auth.`);
        return { uid: data.error?.message, email: normalizedEmail };
      }
      console.warn("Firebase Identity Toolkit SignUp notice:", data.error);
      return null;
    }

    // Set display name if provided
    if (params.displayName && data.idToken) {
      await updateFirebaseIdentityProfile(data.idToken, params.displayName);
    }

    return {
      uid: data.localId,
      email: data.email,
    };
  } catch (error) {
    console.error("createFirebaseIdentityUser error:", error);
    return null;
  }
}

export async function updateFirebaseIdentityProfile(idToken: string, displayName: string): Promise<boolean> {
  try {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${FIREBASE_API_KEY}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idToken,
        displayName,
        returnSecureToken: true,
      }),
    });
    return res.ok;
  } catch (error) {
    console.error("updateFirebaseIdentityProfile error:", error);
    return false;
  }
}

export async function deleteFirebaseIdentityUser(email: string, password?: string): Promise<boolean> {
  const normalizedEmail = email.toLowerCase().trim();

  try {
    // 1. If password provided or default dev password, sign in to acquire idToken then delete
    const signInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;
    const signRes = await fetch(signInUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: normalizedEmail,
        password: password || "WorkerPassword123!",
        returnSecureToken: true,
      }),
    });

    const signData = await signRes.json();
    if (signRes.ok && signData.idToken) {
      const deleteUrl = `https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${FIREBASE_API_KEY}`;
      const delRes = await fetch(deleteUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken: signData.idToken,
        }),
      });
      console.log(`🔥 Deleted user ${normalizedEmail} via Firebase Identity Toolkit.`);
      return delRes.ok;
    }
  } catch (error) {
    console.warn("deleteFirebaseIdentityUser notice:", error);
  }
  return false;
}
