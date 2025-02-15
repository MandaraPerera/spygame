import {initializeApp} from "firebase/app";
import {getFirestore} from "firebase/firestore";
import {getAuth} from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDBCI-gWDTlrhUV8wPaI23ZML-wumwJTlc",
    authDomain: "betterspy-50c8c.firebaseapp.com",
    projectId: "betterspy-50c8c",
    storageBucket: "betterspy-50c8c.firebasestorage.app",
    messagingSenderId: "48226132790",
    appId: "1:48226132790:web:9787bb721e8a6e7fce0997"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);