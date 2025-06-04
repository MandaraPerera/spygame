import {useMutation, useQueryClient} from "@tanstack/react-query";
import {SuggestedContentData} from "@/model";
import {createSuggestedContent} from "@/services/firestore";

export function useSuggestedContent() {
    const queryClient = useQueryClient()

    const addSuggestedContent = useMutation({
        mutationFn: (suggestedContentData: SuggestedContentData) => createSuggestedContent(suggestedContentData),
        onSuccess: async (suggestedContent) => {
            await queryClient.invalidateQueries({queryKey: ['suggestedContent']})
            await queryClient.invalidateQueries({queryKey: ['suggestedContent', suggestedContent.id]})
        },
        onError: async (error) => {
            console.error(error)
        }
    })

    return {
        addSuggestedContent
    }
}