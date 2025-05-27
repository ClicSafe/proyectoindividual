import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB42WAnMtTd_r8iDGxjMDxqv7HRPWHM4zY",
  authDomain: "proyectoindividual-2c78e.firebaseapp.com",
  projectId: "proyectoindividual-2c78e",
  storageBucket: "proyectoindividual-2c78e.firebasestorage.app",
  messagingSenderId: "239196645088",
  appId: "1:239196645088:web:dcfeb63d0458d6acbc9285",
  measurementId: "G-GDKXGM13RZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Analytics only on the client side
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, auth, db, analytics };
