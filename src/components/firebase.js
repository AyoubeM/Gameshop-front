// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Exemple de configuration (remplacez par vos propres clés)
const firebaseConfig = {
  apiKey: "AIzaSyB6icT9XsPYjS_asNJbS_pFo_if7fywk5E",
  authDomain: "gameshop-2255e.firebaseapp.com",
  projectId: "gameshop-2255e",
  storageBucket: "gameshop-2255e.firebasestorage.app",
  messagingSenderId: "743171554029",
  appId: "1:743171554029:web:6a285bcafef54f7a5d6ae4",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
