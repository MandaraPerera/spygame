import {createContext} from "react";
import {Category} from "@/model";

interface ISettingsContext {
    players: string[];
    setPlayers: (players: string[]) => void;
    amountOfSpies: number;
    setAmountOfSpies: (amountOfSpies: number) => void;
    selectedCategories: Category[];
    setSelectedCategories: (selectedCategories: Category[]) => void;
}

export const SettingsContext = createContext<ISettingsContext>({
    players: [],
    setPlayers: () => {
    },
    amountOfSpies: 1,
    setAmountOfSpies: () => {
    },
    selectedCategories: [],
    setSelectedCategories: () => {
    }
});