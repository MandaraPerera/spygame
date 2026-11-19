import type {User} from "firebase/auth";
import {type ReactNode, useEffect, useRef, useState} from "react";
import {toaster} from "@/components/ui";
import {listenAuthState, readIsAdmin} from "@/services";
import {AuthContext, type IAuthContext} from "./AuthContext";

interface AuthContextProviderProps {
    children: ReactNode;
}

// Toasts only on a real sign-in or sign-out, not when a session is restored on page load.
function announceAuthChange(previousUserId: string | null | undefined, user: User | null) {
    const userId = user?.uid ?? null
    if (previousUserId === undefined || previousUserId === userId) return

    queueMicrotask(() => {
        toaster.create(user
            ? {title: "Welcome!", description: user.email, type: "success"}
            : {title: "Signed Out!", type: "warning"})
    })
}

export function AuthContextProvider({children}: AuthContextProviderProps) {
    // Loading until Firebase reports the first auth state, so a restored session is never shown as signed out.
    const [authState, setAuthState] = useState<IAuthContext>({user: null, isAdmin: false, isLoading: true})
    const previousUserId = useRef<string | null | undefined>(undefined)
    const latestChange = useRef<number>(0)

    useEffect(() => {
        return listenAuthState(async (currentUser) => {
            const change = ++latestChange.current
            const isAdmin = currentUser ? await readIsAdmin(currentUser).catch(() => false) : false
            if (change !== latestChange.current) return

            announceAuthChange(previousUserId.current, currentUser)
            previousUserId.current = currentUser?.uid ?? null
            setAuthState({user: currentUser, isAdmin, isLoading: false})
        });
    }, []);

    return (
        <AuthContext.Provider value={authState}>
            {children}
        </AuthContext.Provider>
    )
}
