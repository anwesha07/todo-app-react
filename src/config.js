// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDSWaq4OVWWmAG8TFOkidlWt3OjI7miQ7M",
  authDomain: "todo-app-991da.firebaseapp.com",
  projectId: "todo-app-991da",
  storageBucket: "todo-app-991da.appspot.com",
  messagingSenderId: "311964634953",
  appId: "1:311964634953:web:796bcfd1a00cab3e751498",
  measurementId: "G-NW92SXLZ48",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Authentication
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  login_hint: "user@example.com",
});

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { auth, provider, db };
