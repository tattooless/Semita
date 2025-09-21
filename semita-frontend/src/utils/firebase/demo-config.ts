// Demo configuration for Firebase
// In a real deployment, you would replace these with your actual Firebase project values

export const DEMO_FIREBASE_CONFIG = {
  apiKey: "demo-api-key",
  authDomain: "semita-demo.firebaseapp.com",
  projectId: "semita-demo", 
  storageBucket: "semita-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:demo-app-id"
};

export const isDemoMode = () => {
  return DEMO_FIREBASE_CONFIG.apiKey === "demo-api-key";
};

// Instructions for setting up real Firebase config
export const FIREBASE_SETUP_INSTRUCTIONS = `
To connect to your real Firebase project:

1. Create a new Firebase project at https://console.firebase.google.com
2. Enable Firestore Database and Authentication
3. Get your project configuration from Project Settings
4. Replace the values in /utils/firebase/config.ts with your actual Firebase project values

Example configuration:
{
  apiKey: "AIzaSyC...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com", 
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
}
`;

export default DEMO_FIREBASE_CONFIG;