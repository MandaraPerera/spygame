import {useMutation, useQueryClient} from "@tanstack/react-query";
import {SuggestionData} from "@/model";
import {createSuggestion} from "@/services/firestore";

export function useSuggestions() {
    const queryClient = useQueryClient()

    const addSuggestion = useMutation({
        mutationFn: (suggestionData: SuggestionData) => createSuggestion(suggestionData),
        onSuccess: async (suggestion) => {
            await queryClient.invalidateQueries({queryKey: ['suggestion']})
            await queryClient.invalidateQueries({queryKey: ['suggestion', suggestion.id]})
        },
        onError: async (error) => {
            console.error(error)
        }
    })

    return {
        addSuggestion,
    }
}