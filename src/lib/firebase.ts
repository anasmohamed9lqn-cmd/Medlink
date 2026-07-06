import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import config from "../../firebase-applet-config.json";

// Your custom Firebase project configuration provided to resolve the storing issue
export const userFirebaseConfig = {
  apiKey: "AIzaSyAAQKy7M3ctS8I_CT5FU4ZFER-XvVepW00",
  authDomain: "graduation-project-ed7ea.firebaseapp.com",
  projectId: "graduation-project-ed7ea",
  storageBucket: "graduation-project-ed7ea.firebasestorage.app",
  messagingSenderId: "311419942700",
  appId: "1:311419942700:web:d12c16ea9ca0e73277de89"
};

// Sandbox system-managed Firebase configuration
export const sandboxFirebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId
};

// Get active Firebase connection mode ('sandbox' or 'production')
export const getActiveFirebaseMode = (): "sandbox" | "production" => {
  return "production";
};

// Set and switch selected active Firebase connection mode
export const setActiveFirebaseMode = (mode: "sandbox" | "production") => {
  window.location.reload();
};

const mode = getActiveFirebaseMode();
const activeConfig = mode === "production" ? userFirebaseConfig : sandboxFirebaseConfig;

// Initialize Firebase App
const appName = "medlink_app";
const app = getApps().find(a => a.name === appName) || initializeApp(activeConfig, appName);

export const auth = getAuth(app);

// Use correct database ID based on target (production defaults to "(default)", sandbox uses dynamic applet db ID)
const activeDatabaseId = mode === "production" ? "(default)" : (config.firestoreDatabaseId || "(default)");

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
}, activeDatabaseId);

