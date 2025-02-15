import {ReactNode, useEffect, useState} from "react";
import {onAuthStateChanged, User} from "firebase/auth";
import {AuthContext} from "@/context";
import {auth} from "@/services/firebase.ts";

interface AuthContextProviderProps {
    children: ReactNode;
}

export function AuthContextProvider({children}: AuthContextProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setIsLoading(true);
            setUser(currentUser);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user, isLoading
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}