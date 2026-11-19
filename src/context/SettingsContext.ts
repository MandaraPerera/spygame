import {createContext} from "react";
import {MIN_PLAYERS, MIN_SPIES} from "@/config";

export interface ISettingsContext {
    amountOfPlayers: number;
    setAmountOfPlayers: (players: number) => void;
    amountOfSpies: number;
    setAmountOfSpies: (amountOfSpies: number) => void;
    selectedCategoryIds: string[];
    setSelectedCategoryIds: (selectedCategoryIds: string[]) => void;
}

export const SettingsContext = createContext<ISettingsContext>({
    amountOfPlayers: MIN_PLAYERS,
    setAmountOfPlayers: () => {
    },
    amountOfSpies: MIN_SPIES,
    setAmountOfSpies: () => {
    },
    selectedCategoryIds: [],
    setSelectedCategoryIds: () => {
    }
});
