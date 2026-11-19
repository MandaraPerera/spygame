import {type ReactNode, useContext, useEffect, useState} from "react";
import {Error, Loading} from "@/components/util";
import {AuthContext} from "@/context";

interface ProtectedRouteProps {
    children: ReactNode;
}

export function ProtectedRoute({children}: ProtectedRouteProps) {
    const {user, isLoading} = useContext(AuthContext);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

    useEffect(() => {
        if (!user) return

        user.getIdTokenResult()
            .then((idTokenResult) => {
                setIsAuthorized(!!idTokenResult.claims.admin)
            })
            .catch((error) => {
                console.error("Token error:", error)
                setIsAuthorized(false)
            })
    }, [user]);

    if (isLoading || (user && isAuthorized === null)) {
        return <Loading text={"Checking authorization"}/>
    }

    if (!user || !isAuthorized) {
        return <Error text={"Not Authorized"}/>
    }

    return children
}