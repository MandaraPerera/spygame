import {useMutation, useQueryClient} from "@tanstack/react-query";
import {suggestionKeys} from "@/config";
import type {SuggestionData} from "@/model";
import {createSuggestion, deleteSuggestion} from "@/services";

export function useSuggestions() {
    const queryClient = useQueryClient()

    const addSuggestion = useMutation({
        mutationFn: (suggestionData: SuggestionData) => createSuggestion(suggestionData),
        onSuccess: async (suggestion) => {
            await queryClient.invalidateQueries({queryKey: suggestionKeys.all})
            await queryClient.invalidateQueries({queryKey: suggestionKeys.detail(suggestion.id)})
        },
        onError: async (error) => {
            console.error(error)
        }
    })

    const removeSuggestion = useMutation({
        mutationFn: (suggestionId: string) => deleteSuggestion(suggestionId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: suggestionKeys.all})
        }
    })

    return {
        addSuggestion,
        removeSuggestion
    }
}
