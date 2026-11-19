import {type ReactNode, useContext} from "react";
import {Outlet, useNavigate} from "react-router-dom";
import {AuthContext} from "@/context";
import {AlertMessage} from "./AlertMessage";
import {Loading} from "./Loading";

interface ProtectedRouteProps {
    children?: ReactNode;
}

// A layout route: nothing below it renders, and so no admin query starts, until the admin claim is confirmed.
// The Firestore rules are the real control; this only keeps the UI and its reads out of reach.
export function ProtectedRoute({children}: ProtectedRouteProps) {
    const {user, isAdmin, isLoading} = useContext(AuthContext);
    const navigate = useNavigate();

    if (isLoading) {
        return <Loading text="Checking authorization"/>
    }

    if (!user || !isAdmin) {
        return (
            <AlertMessage status="error" title="Not authorized" text="This page is for admins only."
                          action={{label: "Back to home", onClick: () => navigate("/")}}/>
        )
    }

    return children ?? <Outlet/>
}
