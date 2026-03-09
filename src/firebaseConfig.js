import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBe7JjAf67zK5Zq0U-pbrs9wHO_BqN8pcM",
    authDomain: "lifeplanneracademic.firebaseapp.com",
    projectId: "lifeplanneracademic",
    storageBucket: "lifeplanneracademic.firebasestorage.app",
    messagingSenderId: "216125810790",
    appId: "1:216125810790:web:4fa5bf94b78492bd6825a7",
    measurementId: "G-LGNMJK05TX"
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 
export const auth = getAuth(app);    