import {initializeApp} from "firebase/app";
import {initializeAppCheck, ReCaptchaEnterpriseProvider} from "firebase/app-check";
import {browserSessionPersistence, connectAuthEmulator, initializeAuth} from "firebase/auth";
import {connectFirestoreEmulator, getFirestore} from "firebase/firestore";

// `npm run dev:emulators` only (see README §6). Production builds replace import.meta.env.DEV with false and drop
// every branch below that depends on it.
const useEmulators = import.meta.env.DEV && import.meta.env.VITE_FIREBASE_EMULATORS === "true"

const firebaseConfig = {
    apiKey: "AIzaSyD6PrJ-zIsE8GmLtZ5Rks_4hYraYSltscY",
    authDomain: "the-spygame.firebaseapp.com",
    // A `demo-` project id can never reach a live project, so emulator mode cannot touch production data.
    projectId: useEmulators ? "demo-spygame" : "the-spygame",
    storageBucket: "the-spygame.firebasestorage.app",
    messagingSenderId: "652474821023",
    appId: "1:652474821023:web:0fe7933f9f2ec5043cf5aa",
    measurementId: "G-BQ0V44L4ZF"
};

export const app = initializeApp(firebaseConfig);

// Development builds only, so the token never reaches the public bundle (checked by `npm run check:bundle`).
if (import.meta.env.DEV && import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN) {
    globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN;
}

// The emulators do not check App Check, and reCAPTCHA would only fail on a demo project.
if (!useEmulators) {
    initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider("6LcwHEwrAAAAAN_6-qT1xHggsOrxDe9AtdaLfpAv"),
        isTokenAutoRefreshEnabled: true,
    })
}

// The phone is passed between players, so an admin session ends when the tab is closed.
export const auth = initializeAuth(app, {persistence: browserSessionPersistence});
export const db = getFirestore(app);

if (useEmulators) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", {disableWarnings: true})
    connectFirestoreEmulator(db, "127.0.0.1", 8181)
}
