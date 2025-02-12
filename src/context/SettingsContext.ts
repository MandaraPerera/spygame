import {createContext} from "react";

export interface ISettingsContext {
    players: string[];
    setPlayers: (players: string[]) => void;
    amountOfSpies: number;
    setAmountOfSpies: (amountOfSpies: number) => void;
}

export const SettingsContext = createContext<ISettingsContext>({
    players: [],
    setPlayers: () => {
    },
    amountOfSpies: 1,
    setAmountOfSpies: () => {
    }
});