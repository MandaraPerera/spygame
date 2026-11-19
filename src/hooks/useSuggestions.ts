import {useMutation, useQueryClient} from "@tanstack/react-query";
import {categoryKeys, logKeys, statsKeys, suggestionKeys, termKeys} from "@/config";
import type {Suggestion, SuggestionData} from "@/model";
import {approveSuggestion as approve, createSuggestion, denySuggestion as deny} from "@/services";

export function useSuggestions() {
    const queryClient = useQueryClient()

    const invalidate = async (queryKeys: readonly (readonly string[])[]) => {
        await Promise.all(queryKeys.map((queryKey) => queryClient.invalidateQueries({queryKey})))
    }

    // Visitors cannot read suggestions, so a new one invalidates nothing on their device.
    const addSuggestion = useMutation({
        mutationFn: (suggestionData: SuggestionData) => createSuggestion(suggestionData)
    })

    const approveSuggestion = useMutation({
        mutationFn: (suggestion: Suggestion) => approve(suggestion),
        onSuccess: () => invalidate([suggestionKeys.all, categoryKeys.all, termKeys.all, statsKeys.all, logKeys.all])
    })

    const denySuggestion = useMutation({
        mutationFn: (suggestion: Suggestion) => deny(suggestion),
        onSuccess: () => invalidate([suggestionKeys.all, statsKeys.all, logKeys.all])
    })

    return {
        addSuggestion,
        approveSuggestion,
        denySuggestion
    }
}
