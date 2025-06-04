import {initializeApp} from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import {initializeAppCheck, ReCaptchaEnterpriseProvider} from "firebase/app-check";

const firebaseConfig = {
    apiKey: "AIzaSyD6PrJ-zIsE8GmLtZ5Rks_4hYraYSltscY",
    authDomain: "the-spygame.firebaseapp.com",
    projectId: "the-spygame",
    storageBucket: "the-spygame.firebasestorage.app",
    messagingSenderId: "652474821023",
    appId: "1:652474821023:web:0fe7933f9f2ec5043cf5aa"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
self.FIREBASE_APPCHECK_DEBUG_TOKEN = true
export const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider("6LcwHEwrAAAAAN_6-qT1xHggsOrxDe9AtdaLfpAv"),
    isTokenAutoRefreshEnabled: true,
})