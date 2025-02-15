import {useCallback, useState} from "react";
import {signInWithEmailAndPassword, signOut} from "firebase/auth";
import {auth} from "@/services/firebase.ts";

export function useAuth() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isError, setIsError] = useState<string | null>();

    const signIn = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            setIsError("An error occurred. Please try again.")
            if (error.code === "auth/invalid-email") {
                setIsError("Invalid email format.");
            } else if (error.code === "auth/invalid-credential") {
                setIsError("Incorrect email or password. Try again.");
            } else if (error.code === "auth/too-many-requests") {
                setIsError("Too many attempts. Please wait and try again later.");
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logOut = useCallback(async () => {
        setIsLoading(true);
        try {
            await signOut(auth);
        } catch (e) {
            setIsError((e as Error).message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        signIn,
        signOut: logOut,
        isLoading,
        isError
    }
}