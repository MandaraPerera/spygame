import {ReactNode} from "react";
import {useLocalStorage} from "usehooks-ts";
import {SettingsContext} from "./";
import {Category} from "@/model";

interface SettingsContextProviderProps {
    children: ReactNode;
}

export function SettingsContextProvider({children}: SettingsContextProviderProps) {
    const [players, setPlayers] = useLocalStorage('players', ["Player 1", "Player 2", "Player 3", "Player 4"])
    const [amountOfSpies, setAmountOfSpies] = useLocalStorage('amountOfSpies', 1)
    const [selectedCategories, setSelectedCategories] = useLocalStorage<Category[]>('selectedCategories', [])

    return (
        <SettingsContext.Provider
            value={{
                players, setPlayers,
                amountOfSpies, setAmountOfSpies,
                selectedCategories, setSelectedCategories
            }}
        >
            {children}
        </SettingsContext.Provider>
    )
}