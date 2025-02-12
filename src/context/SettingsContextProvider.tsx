import {ReactNode} from "react";
import {useLocalStorage} from "usehooks-ts";
import {SettingsContext} from "./";

interface SettingsContextProviderProps {
    children: ReactNode;
}

export function SettingsContextProvider({children}: SettingsContextProviderProps) {
    const [players, setPlayers] = useLocalStorage('players', ["Player1", "Player2", "Player3", "Player4"])
    const [amountOfSpies, setAmountOfSpies] = useLocalStorage('amountOfSpies', 1)

    return (
        <SettingsContext.Provider
            value={{
                players, setPlayers,
                amountOfSpies, setAmountOfSpies
            }}
        >
            {children}
        </SettingsContext.Provider>
    )
}