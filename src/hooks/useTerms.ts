import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {createTerm, getAllTermsByCategoryId} from "@/services/firestore";
import {TermData} from "@/model";

export const useTerms = (categoryIds?: string[]) => {
    const queryClient = useQueryClient()

    const addTerm = useMutation({
        mutationFn: (termData: TermData) => createTerm(termData),
        onSuccess: async (term) => {
            await queryClient.invalidateQueries({queryKey: ['terms']})
            await queryClient.invalidateQueries({queryKey: ['terms', term.id]})
        }
    })

    const getTerms = useQuery({
        queryKey: ["terms", categoryIds!],
        queryFn: () => getAllTermsByCategoryId(categoryIds!),
        staleTime: 1000 * 60 * 5,
        enabled: !!categoryIds
    })

    return {
        addTerm,
        getTerms
    }
}