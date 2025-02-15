import {User} from "firebase/auth";
import {createContext} from "react";

export interface IAuthContext {
    user: User | null;
    isLoading: boolean;
}

export const AuthContext = createContext<IAuthContext>({
    user: null,
    isLoading: true
});