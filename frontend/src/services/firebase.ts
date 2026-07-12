import { initializeApp, getApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Firebase configurations loaded via Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Safely initialize Firebase App to prevent re-initialization errors in hot-reloads
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// Reusable instances for Firestore and Storage
const db = getFirestore(app)
const storage = getStorage(app)

export { app, db, storage }
