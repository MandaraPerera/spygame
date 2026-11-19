import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {logKeys, statsKeys, termKeys} from "@/config";
import type {Term} from "@/model";
import {deleteTerm, readTermsByCategoryIds, updateTerm} from "@/services";

type TermChange = {
    term: Term
    categoryName: string
}

export function useTerms(categoryIds: string[] = []) {
    const queryClient = useQueryClient()

    const invalidate = async () => {
        await Promise.all([termKeys.all, statsKeys.all, logKeys.all]
            .map((queryKey) => queryClient.invalidateQueries({queryKey})))
    }

    // Terms only change when an admin approves or edits content, so they can stay cached for a game session.
    const getTerms = useQuery({
        queryKey: termKeys.byCategories(categoryIds),
        queryFn: () => readTermsByCategoryIds(categoryIds),
        staleTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        enabled: categoryIds.length > 0
    })

    const renameTerm = useMutation({
        mutationFn: ({term, categoryName, value}: TermChange & { value: string }) =>
            updateTerm(term, value, categoryName),
        onSuccess: invalidate
    })

    const removeTerm = useMutation({
        mutationFn: ({term, categoryName}: TermChange) => deleteTerm(term, categoryName),
        onSuccess: invalidate
    })

    return {
        getTerms,
        renameTerm,
        removeTerm
    }
}
