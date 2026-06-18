import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// PASTE YOUR CONFIG HERE:
const firebaseConfig = {
  apiKey: "AIzaSyB7sC1FMphGVlD8O2NrBVjTWj-xINQJk9A",
  authDomain: "swu-typing-booth.firebaseapp.com",
  projectId: "swu-typing-booth",
  storageBucket: "swu-typing-booth.firebasestorage.app",
  messagingSenderId: "137103055821",
  appId: "1:137103055821:web:3ae16c46a1db2e1be08284",
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);