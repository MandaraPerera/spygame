import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    type User
} from "firebase/auth";
import {auth} from "./firebase";

export async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password)
}

export async function signOut() {
    await firebaseSignOut(auth)
}

export function listenAuthState(onChange: (user: User | null) => void) {
    return onAuthStateChanged(auth, onChange)
}

// The claim is set with `scripts/set-admin.cjs`; the Firestore rules check the same claim.
export async function readIsAdmin(user: User): Promise<boolean> {
    const tokenResult = await user.getIdTokenResult()
    return tokenResult.claims.admin === true
}

export function readCurrentUserId(): string {
    const user = auth.currentUser
    if (!user) {
        throw new Error("You are not signed in.")
    }
    return user.uid
}
