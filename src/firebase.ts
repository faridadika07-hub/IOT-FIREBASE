import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDXlt6hccFdWgjldt-3z4yVyhfJ756yBDQ",
  authDomain: "iot-firebase-6f3eb.firebaseapp.com",
  databaseURL: "https://iot-firebase-6f3eb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "iot-firebase-6f3eb",
  storageBucket: "iot-firebase-6f3eb.firebasestorage.app",
  messagingSenderId: "779512841828",
  appId: "1:779512841828:web:9d623071b3fe759e114171",
  measurementId: "G-K3N0N1D1XK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const rtdb = getDatabase(app);
export const auth = getAuth(app);
