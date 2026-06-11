import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDyLvINfBA1oqedb_yHNxq4LR7WBmLVZNc",
  authDomain: "entrenamiento-cerebral.firebaseapp.com",
  projectId: "entrenamiento-cerebral",
  storageBucket: "entrenamiento-cerebral.firebasestorage.app",
  messagingSenderId: "121258466683",
  appId: "1:121258466683:web:880ec318374158c1a771de",
  measurementId: "G-MLP3DKV4HG"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
