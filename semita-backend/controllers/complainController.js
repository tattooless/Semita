import { db } from "../firebase.js";
import { collection, query, orderBy, getDocs, where, limit, startAfter } from "firebase/firestore";

// Get all complaints (latest first)
export async function getAllComplaints() {
  const q = query(collection(db, "complaints"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Get open complaints only
export async function getOpenComplaints() {
  const q = query(collection(db, "complaints"), where("status", "==", "open"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Paginated complaints (5 per page)
let lastDoc = null;
export async function getComplaintsPage() {
  let q;
  if (lastDoc) {
    q = query(collection(db, "complaints"), orderBy("createdAt", "desc"), startAfter(lastDoc), limit(5));
  } else {
    q = query(collection(db, "complaints"), orderBy("createdAt", "desc"), limit(5));
  }

  const snapshot = await getDocs(q);
  lastDoc = snapshot.docs[snapshot.docs.length - 1];
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getComplaintsByStatus(status) {
    const validStatuses = ["open", "problem resolved", "in progress"];
    if (!validStatuses.includes(status)) {
        throw new Error("Invalid status");
    }
    const q = query(collection(db, "complaints"), where("status", "==", status));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}