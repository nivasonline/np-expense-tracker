import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBPXs6hlGDIsSk8-xkAs-K3MZ4YZF9c4OI",
  authDomain: "smart-expense-tracker-3d37d.firebaseapp.com",
  projectId: "smart-expense-tracker-3d37d",
  storageBucket: "smart-expense-tracker-3d37d.firebasestorage.app",
  messagingSenderId: "966461308596",
  appId: "1:966461308596:web:16eb6a742037f90a7861e1"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
