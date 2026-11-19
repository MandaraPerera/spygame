import type {ReactNode} from "react";
import {useLocalStorage} from "usehooks-ts";
import {MIN_PLAYERS, MIN_SPIES} from "@/config";
import {clampPlayers, clampSpies} from "@/utils";
import {SettingsContext} from "./SettingsContext";

interface SettingsContextProviderProps {
    children: ReactNode;
}

const LEGACY_CATEGORIES_KEY = 'selectedCategories'

// Earlier versions stored whole Category objects; keep the selection of returning players.
function readLegacyCategoryIds(): string[] {
    try {
        const stored = window.localStorage.getItem(LEGACY_CATEGORIES_KEY)
        const parsed: unknown = stored ? JSON.parse(stored) : []
        if (!Array.isArray(parsed)) return []

        return parsed.flatMap((category: unknown) =>
            typeof category === "object" && category !== null && "id" in category && typeof category.id === "string"
                ? [category.id]
                : [])
    } catch {
        return []
    }
}

export function SettingsContextProvider({children}: SettingsContextProviderProps) {
    const [storedPlayers, setStoredPlayers] = useLocalStorage<number>('amountOfPlayers', MIN_PLAYERS)
    const [storedSpies, setStoredSpies] = useLocalStorage<number>('amountOfSpies', MIN_SPIES)
    const [selectedCategoryIds, setSelectedCategoryIds] =
        useLocalStorage<string[]>('selectedCategoryIds', readLegacyCategoryIds)

    // localStorage is input: clamp on every read, so a stale or edited value can never break a game.
    const amountOfPlayers = clampPlayers(storedPlayers)
    const amountOfSpies = clampSpies(amountOfPlayers, storedSpies)

    const setAmountOfPlayers = (players: number) => {
        const nextPlayers = clampPlayers(players)
        setStoredPlayers(nextPlayers)
        setStoredSpies(clampSpies(nextPlayers, amountOfSpies))
    }

    const setAmountOfSpies = (spies: number) => {
        setStoredSpies(clampSpies(amountOfPlayers, spies))
    }

    return (
        <SettingsContext.Provider
            value={{
                amountOfPlayers, setAmountOfPlayers,
                amountOfSpies, setAmountOfSpies,
                selectedCategoryIds, setSelectedCategoryIds
            }}
        >
            {children}
        </SettingsContext.Provider>
    )
}
