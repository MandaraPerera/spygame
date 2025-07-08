import {createContext} from "react";
import {Category} from "@/model";

interface ISettingsContext {
    amountOfPlayers: number;
    setAmountOfPlayers: (players: number) => void;
    amountOfSpies: number;
    setAmountOfSpies: (amountOfSpies: number) => void;
    selectedCategories: Category[];
    setSelectedCategories: (selectedCategories: Category[]) => void;
}

export const SettingsContext = createContext<ISettingsContext>({
    amountOfPlayers: 3,
    setAmountOfPlayers: () => {
    },
    amountOfSpies: 1,
    setAmountOfSpies: () => {
    },
    selectedCategories: [],
    setSelectedCategories: () => {
    }
});