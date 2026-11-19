import {initializeApp} from "firebase/app";
import {initializeAppCheck, ReCaptchaEnterpriseProvider} from "firebase/app-check";
import {browserSessionPersistence, initializeAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyD6PrJ-zIsE8GmLtZ5Rks_4hYraYSltscY",
    authDomain: "the-spygame.firebaseapp.com",
    projectId: "the-spygame",
    storageBucket: "the-spygame.firebasestorage.app",
    messagingSenderId: "652474821023",
    appId: "1:652474821023:web:0fe7933f9f2ec5043cf5aa",
    measurementId: "G-BQ0V44L4ZF"
};

export const app = initializeApp(firebaseConfig);

// Development builds only. Production builds replace import.meta.env.DEV with false and drop this branch,
// so the token never reaches the public bundle (checked by `npm run check:bundle`).
if (import.meta.env.DEV && import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN) {
    globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN;
}

export const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider("6LcwHEwrAAAAAN_6-qT1xHggsOrxDe9AtdaLfpAv"),
    isTokenAutoRefreshEnabled: true,
})

// The phone is passed between players, so an admin session ends when the tab is closed.
export const auth = initializeAuth(app, {persistence: browserSessionPersistence});
export const db = getFirestore(app);
