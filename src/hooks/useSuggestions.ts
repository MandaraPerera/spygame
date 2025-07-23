import {useMutation, useQueryClient} from "@tanstack/react-query";
import {SuggestionData} from "@/model";
import {createSuggestion, deleteSuggestion} from "@/services/firestore";

export function useSuggestions() {
    const queryClient = useQueryClient()

    const addSuggestion = useMutation({
        mutationFn: (suggestionData: SuggestionData) => createSuggestion(suggestionData),
        onSuccess: async (suggestion) => {
            await queryClient.invalidateQueries({queryKey: ['suggestions']})
            await queryClient.invalidateQueries({queryKey: ['suggestions', suggestion.id]})
        },
        onError: async (error) => {
            console.error(error)
        }
    })

    const removeSuggestion = useMutation({
        mutationFn: (suggestionId: string) => deleteSuggestion(suggestionId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['suggestions']})
        }
    })

    return {
        addSuggestion,
        removeSuggestion
    }
}