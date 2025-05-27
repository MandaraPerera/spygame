import {useCallback, useState} from "react";
import {signInWithEmailAndPassword, signOut} from "firebase/auth";
import {auth} from "@/services/firebase.ts";

export function useAuth() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isError, setIsError] = useState<string | null>();

    const signIn = useCallback(async (email: string, password: string) => {
        setIsLoading(true)
        setIsError(null)

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error: unknown) {
            if (error instanceof Error) {
                let errorMsg = "Something went wrong."
                const firebaseError = error as { code?: string }

                if (firebaseError.code === "auth/invalid-email") {
                    errorMsg = "Invalid email format."
                } else if (firebaseError.code === "auth/invalid-credential") {
                    errorMsg = "Incorrect email or password. Try again."
                } else if (firebaseError.code === "auth/too-many-requests") {
                    errorMsg = "Too many attempts. Please wait and try again later."
                }

                setIsError(errorMsg)
            }
        } finally {
            setIsLoading(false)
        }
    }, []);

    const logOut = useCallback(async () => {
        setIsLoading(true)
        setIsError(null)

        try {
            await signOut(auth)
        } catch (error: unknown) {
            if (error instanceof Error) {
                setIsError(error.message)
            }
        } finally {
            setIsLoading(false)
        }
    }, []);

    return {
        signIn,
        signOut: logOut,
        isLoading,
        isError
    }
}