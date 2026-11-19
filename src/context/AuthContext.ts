import type {User} from "firebase/auth";
import {createContext} from "react";

export interface IAuthContext {
    user: User | null;
    isAdmin: boolean;
    isLoading: boolean;
}

export const AuthContext = createContext<IAuthContext>({
    user: null,
    isAdmin: false,
    isLoading: true
});
