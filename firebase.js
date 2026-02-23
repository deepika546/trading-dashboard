import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC1dP5Num9GIx1e7hVXMupuVbwLH38OS9Y",
  authDomain: "trading-dashboard-9ca2d.firebaseapp.com",
  projectId: "trading-dashboard-9ca2d",
  storageBucket: "trading-dashboard-9ca2d.firebasestorage.app",
  messagingSenderId: "748650828000",
  appId: "1:748650828000:web:3e0164377c40772ff24085",
  measurementId: "G-XPNB55L084"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
