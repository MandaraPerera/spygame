import {ReactNode, useContext} from "react";
import {AuthContext} from "@/context";
import {Error, Loading} from "@/components/Util";

interface ProtectedRouteProps {
    children: ReactNode;
}

export function ProtectedRoute({children}: ProtectedRouteProps) {
    const {user, isLoading} = useContext(AuthContext);

    if (isLoading) {
        return <Loading text={""}/>
    }

    return user ? (
        <>{children}</>
    ) : (
        <Error text={"Not Authorized"}/>
    )
}