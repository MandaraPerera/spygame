import {ReactNode} from "react";
import {useLocalStorage} from "usehooks-ts";
import {Category} from "@/model";
import {SettingsContext} from "./";

interface SettingsContextProviderProps {
    children: ReactNode;
}

export function SettingsContextProvider({children}: SettingsContextProviderProps) {
    const [amountOfPlayers, setAmountOfPlayers] = useLocalStorage('amountOfPlayers', 3)
    const [amountOfSpies, setAmountOfSpies] = useLocalStorage('amountOfSpies', 1)
    const [selectedCategories, setSelectedCategories] = useLocalStorage<Category[]>('selectedCategories', [])

    return (
        <SettingsContext.Provider
            value={{
                amountOfPlayers, setAmountOfPlayers,
                amountOfSpies, setAmountOfSpies,
                selectedCategories, setSelectedCategories
            }}
        >
            {children}
        </SettingsContext.Provider>
    )
}