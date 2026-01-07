// assets/js/firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBa7tmcsjgNJExZN_2hZnhCp0EL6m7_Baw",
  authDomain: "itc-event-management.firebaseapp.com",
  projectId: "itc-event-management",
  storageBucket: "itc-event-management.firebasestorage.app",
  messagingSenderId: "534798036626",
  appId: "1:534798036626:web:6b431ca447b91e6f4e404b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
