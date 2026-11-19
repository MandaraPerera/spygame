/// <reference types="vite/client" />

interface ImportMetaEnv {
    // Development only: an App Check debug token registered in the Firebase console (see README).
    readonly VITE_FIREBASE_APPCHECK_DEBUG_TOKEN?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

// Read by the App Check SDK when it is set before initializeAppCheck.
// eslint-disable-next-line no-var
declare var FIREBASE_APPCHECK_DEBUG_TOKEN: string | boolean | undefined
