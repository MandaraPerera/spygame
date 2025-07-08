import {ReactNode, useContext, useEffect, useState} from "react";
import {AuthContext} from "@/context";
import {Error, Loading} from "@/components/Util";

interface ProtectedRouteProps {
    children: ReactNode;
}

export function ProtectedRoute({children}: ProtectedRouteProps) {
    const {user, isLoading} = useContext(AuthContext);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

    useEffect(() => {
        if (!user) {
            setIsAuthorized(false)
            return
        }

        user.getIdTokenResult()
            .then((idTokenResult) => {
                setIsAuthorized(!!idTokenResult.claims.admin)
            })
            .catch((error) => {
                console.error("Token error:", error)
                setIsAuthorized(false)
            })
    }, [user]);

    if (isLoading || isAuthorized === null) {
        return <Loading text={"Checking authorization"}/>
    }

    if (!isAuthorized) {
        return <Error text={"Not Authorized"}/>
    }

    return children
}