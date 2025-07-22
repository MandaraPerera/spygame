import {useEffect, useState} from "react";
import {getAmountOfCategories, getAmountOfLogs, getAmountOfSuggestions, getAmountOfTerms} from "@/services/firestore";

export function useStats() {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [categories, setCategories] = useState<number | null>(null)
    const [terms, setTerms] = useState<number | null>(null)
    const [suggestions, setSuggestions] = useState<number | null>(null)
    const [logs, setLogs] = useState<number | null>(null)

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true)

            try {
                await getAmountOfCategories().then(setCategories)
                await getAmountOfTerms().then(setTerms)
                await getAmountOfSuggestions().then(setSuggestions)
                await getAmountOfLogs().then(setLogs)
            } catch (error) {
                console.error(error)
            }
        }

        fetchStats().then(() => setIsLoading(false))
    }, []);

    return {
        isLoading,
        categories,
        terms,
        suggestions,
        logs
    }
}