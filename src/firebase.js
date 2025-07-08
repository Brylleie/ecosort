// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // ✅ ADD THIS

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDWRvunKHCqs3maebTRr1dICfxb04XGW6A",
  authDomain: "ecosort-51471.firebaseapp.com",
  projectId: "ecosort-51471",
  storageBucket: "ecosort-51471.appspot.com", // ✅ FIXED (.app ➝ .app**spot.com**)
  messagingSenderId: "296718734304",
  appId: "1:296718734304:web:852095c72930c6b61a1185",
  measurementId: "G-31NRJCYK8P"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // ✅ ADD THIS
