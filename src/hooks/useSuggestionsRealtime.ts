import {type InfiniteData, useInfiniteQuery, useQueryClient} from "@tanstack/react-query";
import type {QueryDocumentSnapshot} from "firebase/firestore";
import {useEffect} from "react";
import {statsKeys, suggestionKeys, SUGGESTIONS_PAGE_SIZE} from "@/config";
import type {PaginatedSuggestions} from "@/model";
import {listenNewSuggestions, readSuggestionsPaginated} from "@/services";

export function useSuggestionsRealtime() {
    const queryClient = useQueryClient()

    const getSuggestionsPaginated = useInfiniteQuery<
        PaginatedSuggestions,
        Error,
        InfiniteData<PaginatedSuggestions>,
        typeof suggestionKeys.paginated,
        QueryDocumentSnapshot | undefined
    >({
        queryKey: suggestionKeys.paginated,
        initialPageParam: undefined,
        queryFn: ({pageParam}) => readSuggestionsPaginated(SUGGESTIONS_PAGE_SIZE, pageParam),
        getNextPageParam: (lastPage) => lastPage.cursor ?? undefined,
        staleTime: 1000 * 60 * 5
    })

    // One listener for the lifetime of the page; it only refetches when another device adds a suggestion.
    useEffect(() => {
        return listenNewSuggestions(
            () => {
                void queryClient.invalidateQueries({queryKey: suggestionKeys.paginated})
                void queryClient.invalidateQueries({queryKey: statsKeys.all})
            },
            (error) => console.error("Suggestions listener failed:", error)
        )
    }, [queryClient]);

    return {getSuggestionsPaginated}
}
