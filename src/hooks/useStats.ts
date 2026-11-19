import {useEffect, useState} from "react";
import {readAmountOfCategories, readAmountOfLogs, readAmountOfSuggestions, readAmountOfTerms} from "@/services";

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
                await readAmountOfCategories().then(setCategories)
                await readAmountOfTerms().then(setTerms)
                await readAmountOfSuggestions().then(setSuggestions)
                await readAmountOfLogs().then(setLogs)
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