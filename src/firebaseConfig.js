// src/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // ✅ Add this line!

const firebaseConfig = {
  apiKey: "AIzaSyDvszyysrWYMq5CRviCFRKCchGPiZ4_Dpc",
  authDomain: "grievance-sys-2025.firebaseapp.com",
  projectId: "grievance-sys-2025",
  storageBucket: "grievance-sys-2025.firebasestorage.app",
  messagingSenderId: "4942010481",
  appId: "1:4942010481:web:5fdbdbce6c61ac6ffea3d0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ✅ This will now work
const db = getFirestore(app);

export { db };
