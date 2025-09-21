import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

import { DEMO_FIREBASE_CONFIG, isDemoMode } from './demo-config';

// Firebase configuration - replace with your actual Firebase project values
const firebaseConfig = DEMO_FIREBASE_CONFIG;

// Initialize Firebase
let app: any = null;
let db: any = null;
let auth: any = null;
let functions: any = null;
let isFirebaseInitialized = false;

// Only try to initialize Firebase if not using demo config
if (!isDemoMode()) {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }

    // Initialize services
    db = getFirestore(app);
    auth = getAuth(app);
    functions = getFunctions(app);
    isFirebaseInitialized = true;
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.warn('Firebase initialization failed, running in demo mode:', error);
    // Reset to null for clean fallback
    app = null;
    db = null;
    auth = null;
    functions = null;
    isFirebaseInitialized = false;
  }
} else {
  console.log('Running in demo mode - Firebase not initialized');
}

export { db, auth, functions, isFirebaseInitialized };

// Note: In production, you would connect to emulators in development mode
// For now, we'll skip emulator connection to avoid errors in the demo environment
if (false && typeof window !== 'undefined') {
  try {
    // Only connect to emulators if not already connected
    if (!auth._delegate._config.emulator) {
      connectAuthEmulator(auth, 'http://localhost:9099');
    }
    if (!db._delegate._settings?.host?.includes('localhost')) {
      connectFirestoreEmulator(db, 'localhost', 8080);
    }
    if (!functions._delegate.customDomain) {
      connectFunctionsEmulator(functions, 'localhost', 5001);
    }
  } catch (error) {
    // Emulators might already be connected, ignore errors
    console.log('Firebase emulators connection status:', error?.message);
  }
}

export default app;