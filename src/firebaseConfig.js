// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

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
