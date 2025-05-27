import {initializeApp} from "firebase/app";
import {getFirestore} from "firebase/firestore";
import {getAuth} from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyD6PrJ-zIsE8GmLtZ5Rks_4hYraYSltscY",
    authDomain: "the-spygame.firebaseapp.com",
    projectId: "the-spygame",
    storageBucket: "the-spygame.firebasestorage.app",
    messagingSenderId: "652474821023",
    appId: "1:652474821023:web:0fe7933f9f2ec5043cf5aa"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);