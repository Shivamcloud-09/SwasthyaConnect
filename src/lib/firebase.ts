
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// ✅ Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// ✅ Define initialized variables (non-nullable for safe export)
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let storage: FirebaseStorage;
let googleProvider: GoogleAuthProvider;

// ✅ Safely initialize Firebase only once
if (!getApps().length) {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    try {
      app = initializeApp(firebaseConfig);
    } catch (e) {
      console.error("Firebase initialization error:", e);
      throw e;
    }
  } else {
    console.warn("Missing Firebase configuration.");
    throw new Error("Missing Firebase environment variables.");
  }
} else {
  app = getApp();
}

// ✅ Initialize all services
db = getFirestore(app);
auth = getAuth(app);
storage = getStorage(app);
googleProvider = new GoogleAuthProvider();

// ✅ Export (non-nullable for safe usage)
export { app, db, auth, storage, googleProvider };
