import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Unsubscribe,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./config";

/**
 * Subscribe to real-time updates for a given Firestore collection
 */
export function subscribeToCollection<T = any>(
  colName: string,
  callback: (items: (T & { id: string })[]) => void,
  orderField?: string,
  orderDir: "asc" | "desc" = "desc"
): Unsubscribe {
  if (!isFirebaseConfigured) {
    // Return empty unsubscribe function
    return () => {};
  }

  const colRef = collection(db, colName);
  const q = orderField ? query(colRef, orderBy(orderField, orderDir)) : query(colRef);

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as (T & { id: string })[];
      callback(items);
    },
    (err) => {
      console.error(`Firestore real-time subscription error on ${colName}:`, err);
    }
  );
}

/**
 * Add or overwrite document in Firestore
 */
export async function saveDocument<T extends object>(
  colName: string,
  docId: string,
  data: T
): Promise<void> {
  if (!isFirebaseConfigured) return;
  const docRef = doc(db, colName, docId);
  await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

/**
 * Update document fields in Firestore
 */
export async function updateDocumentFields(
  colName: string,
  docId: string,
  data: Record<string, any>
): Promise<void> {
  if (!isFirebaseConfigured) return;
  const docRef = doc(db, colName, docId);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
}

/**
 * Delete document from Firestore
 */
export async function removeDocument(colName: string, docId: string): Promise<void> {
  if (!isFirebaseConfigured) return;
  const docRef = doc(db, colName, docId);
  await deleteDoc(docRef);
}

/**
 * Get section access & locking rules document from Firestore
 */
export async function getFirebaseAccessRules(): Promise<
  Record<string, Record<string, "accessible" | "locked" | "hidden">>
> {
  if (!isFirebaseConfigured) return {};
  try {
    const docRef = doc(db, "systemSettings", "worker_section_access_rules");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return (snap.data()?.rules || {}) as Record<
        string,
        Record<string, "accessible" | "locked" | "hidden">
      >;
    }
  } catch (e) {
    console.error("Failed to fetch Firebase access rules:", e);
  }
  return {};
}

/**
 * Save section access & locking rules matrix to Firestore
 */
export async function saveFirebaseAccessRules(
  rules: Record<string, Record<string, "accessible" | "locked" | "hidden">>
): Promise<void> {
  if (!isFirebaseConfigured) return;
  const docRef = doc(db, "systemSettings", "worker_section_access_rules");
  await setDoc(docRef, { rules, updatedAt: serverTimestamp() }, { merge: true });
}
