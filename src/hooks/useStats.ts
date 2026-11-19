import {useQuery} from "@tanstack/react-query";
import {statsKeys} from "@/config";
import {readAmountOfCategories, readAmountOfLogs, readAmountOfSuggestions, readAmountOfTerms} from "@/services";

async function readStats() {
    const [categories, terms, suggestions, logs] = await Promise.all([
        readAmountOfCategories(),
        readAmountOfTerms(),
        readAmountOfSuggestions(),
        readAmountOfLogs()
    ])

    return {categories, terms, suggestions, logs}
}

export function useStats() {
    return useQuery({
        queryKey: statsKeys.all,
        queryFn: readStats,
        staleTime: 60 * 1000
    })
}
