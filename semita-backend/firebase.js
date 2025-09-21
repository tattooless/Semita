import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA4lTP0tBQWmfYPs-UJ6x2PaFbjoreHyi0",
  authDomain: "semita-208db.firebaseapp.com",
  projectId: "semita-208db",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
