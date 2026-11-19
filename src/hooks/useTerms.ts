import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {termKeys} from "@/config";
import type {TermData} from "@/model";
import {createTerm, readTermsByCategoryIds} from "@/services";

export function useTerms(categoryIds?: string[]) {
    const queryClient = useQueryClient()

    const addTerm = useMutation({
        mutationFn: (termData: TermData) => createTerm(termData),
        onSuccess: async (term) => {
            await queryClient.invalidateQueries({queryKey: termKeys.all})
            await queryClient.invalidateQueries({queryKey: termKeys.detail(term.id)})
        }
    })

    const getTerms = useQuery({
        queryKey: termKeys.categories(categoryIds!),
        queryFn: () => readTermsByCategoryIds(categoryIds!),
        staleTime: 1000 * 60 * 5,
        enabled: !!categoryIds
    })

    return {
        addTerm,
        getTerms
    }
}
