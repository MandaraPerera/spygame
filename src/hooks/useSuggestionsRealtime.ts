import {InfiniteData, useInfiniteQuery, useQueryClient} from "@tanstack/react-query";
import {QueryDocumentSnapshot} from "firebase/firestore";
import {useEffect, useRef} from "react";
import {getAllSuggestionsPaginated, listenSuggestions, PaginatedSuggestions} from "@/services/firestore";

const PAGE_SIZE = 10

export function useSuggestionsRealtime() {
    const queryClient = useQueryClient()

    const getSuggestionsPaginated = useInfiniteQuery<
        PaginatedSuggestions,
        Error,
        InfiniteData<PaginatedSuggestions>,
        ['suggestions', 'paginated'],
        QueryDocumentSnapshot | undefined
    >({
        queryKey: ['suggestions', 'paginated'],
        initialPageParam: undefined,
        queryFn: ({pageParam}) => getAllSuggestionsPaginated(PAGE_SIZE, pageParam),
        getNextPageParam: (lastPage) => lastPage.cursor ?? undefined,
        staleTime: 1000 * 60 * 5
    })

    const unsubscribeRef = useRef<() => void>(() => {
    })

    useEffect(() => {
        const totalSize = PAGE_SIZE * (getSuggestionsPaginated.data?.pages.length ?? 1)

        if (unsubscribeRef.current) {
            unsubscribeRef.current()
        }

        unsubscribeRef.current = listenSuggestions(
            totalSize,
            () => queryClient.invalidateQueries({queryKey: ['suggestions', 'paginated']})
        )

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current()
            }
        }
    }, [getSuggestionsPaginated.data?.pages.length, queryClient]);

    return {getSuggestionsPaginated}
}