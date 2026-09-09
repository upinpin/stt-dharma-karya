import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Tempelkan firebaseConfig yang kamu dapatkan saat klik '+ Add app' di Firebase tadi
const firebaseConfig = {
  apiKey: "PASTE_API_KEY_KAMU_DI_SINI",
  authDomain: "web-stt-desa.firebaseapp.com",
  projectId: "web-stt-desa",
  storageBucket: "web-stt-desa.firebasestorage.app",
  messagingSenderId: "PASTE_SENDER_ID_KAMU",
  appId: "PASTE_APP_ID_KAMU"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Database Teks (Firestore) & Tempat Foto (Storage) dibuat terpisah
export const db = getFirestore(app);
export const storage = getStorage(app);