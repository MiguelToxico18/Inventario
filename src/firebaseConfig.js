import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB_lgeYug4TO9ikI3rrMwGyBHAlvgP9J5s",
  authDomain: "inventario-f4cd6.firebaseapp.com",
  projectId: "inventario-f4cd6",
  storageBucket: "inventario-f4cd6.appspot.com",
  messagingSenderId: "621395826277",
  appId: "1:621395826277:web:904e4c72da7f48bfe2d88c",
  measurementId: "G-B8SED5MWSW"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);  // Inicializa Firestore

export { db };
