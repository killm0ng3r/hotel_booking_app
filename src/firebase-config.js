import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, doc, setDoc, updateDoc, getDoc, onSnapshot } from 'firebase/firestore';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// This serves as a placeholder for your firebase configuration / set-up
const firebaseConfig = { 
  apiKey: "new-api-key", 
  authDomain: "hotel-booking-app-secure-123.firebaseapp.com", 
  projectId: "hotel-booking-app-secure-123", 
  storageBucket: "hotel-booking-app-secure-123.appspot.com", 
  messagingSenderId: "new-sender-id", 
  appId: "new-app-id" };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// Set persistence to local (persists across browser restarts)
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Auth persistence set to local");
  })
  .catch((error) => {
    console.error("Error setting auth persistence:", error);
  });

export { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, collection, query, where, getDocs, doc, setDoc, updateDoc, getDoc, onSnapshot };