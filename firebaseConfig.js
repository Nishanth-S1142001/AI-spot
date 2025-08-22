import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDGUeGo8pYFCbkS2bVrodkDci1pfXu5QZg",
  authDomain: "project-anamika.firebaseapp.com",
  projectId: "project-anamika",
  storageBucket: "project-anamika.firebasestorage.app",
  messagingSenderId: "567273550356",
  appId: "1:567273550356:web:e8ef99939e4b4c02fb6d01",
  measurementId: "G-5B8YXS4DBG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { app, auth };