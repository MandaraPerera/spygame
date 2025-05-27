import {ReactNode, useEffect, useRef, useState} from "react";
import {onAuthStateChanged, User} from "firebase/auth";
import {AuthContext} from "@/context";
import {auth} from "@/services/firebase.ts";
import {toaster} from "@/components/ui";

interface AuthContextProviderProps {
    children: ReactNode;
}

export function AuthContextProvider({children}: AuthContextProviderProps) {
    const isFirstRender = useRef<boolean>(true);
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setIsLoading(true);
            setUser(currentUser);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }

        if (user) {
            queueMicrotask(() => {
                toaster.create({
                    title: "Welcome!",
                    description: user.email,
                    type: "success",
                })
            })
        } else {
            queueMicrotask(() => {
                toaster.create({
                    title: "Signed Out!",
                    type: "warning",
                })
            })
        }
    }, [user]);

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