import {useQueryClient} from "@tanstack/react-query";
import {useCallback, useState} from "react";
import {logKeys, statsKeys, suggestionKeys} from "@/config";
import {signIn as signInService, signOut as signOutService} from "@/services";

function toSignInMessage(error: unknown): string {
    const code = typeof error === "object" && error !== null && "code" in error ? error.code : undefined

    if (code === "auth/invalid-email") return "Invalid email format."
    if (code === "auth/invalid-credential") return "Incorrect email or password. Try again."
    if (code === "auth/too-many-requests") return "Too many attempts. Please wait and try again later."
    return "Something went wrong."
}

export function useAuth() {
    const queryClient = useQueryClient()
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const signIn = useCallback(async (email: string, password: string) => {
        setIsLoading(true)
        setError(null)

        try {
            await signInService(email, password)
        } catch (signInError: unknown) {
            setError(toSignInMessage(signInError))
        } finally {
            setIsLoading(false)
        }
    }, []);

    // Returns the error message, or null when signed out. Admin data is dropped from the cache.
    const signOut = useCallback(async (): Promise<string | null> => {
        setIsLoading(true)
        setError(null)

        try {
            await signOutService()
            for (const queryKey of [suggestionKeys.all, statsKeys.all, logKeys.all]) {
                queryClient.removeQueries({queryKey})
            }
            return null
        } catch (signOutError: unknown) {
            const message = signOutError instanceof Error ? signOutError.message : "Something went wrong."
            setError(message)
            return message
        } finally {
            setIsLoading(false)
        }
    }, [queryClient]);

    return {
        signIn,
        signOut,
        isLoading,
        error
    }
}
