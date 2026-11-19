import {type InfiniteData, useInfiniteQuery, useQueryClient} from "@tanstack/react-query";
import type {QueryDocumentSnapshot} from "firebase/firestore";
import {useEffect, useRef} from "react";
import {suggestionKeys} from "@/config";
import type {PaginatedSuggestions} from "@/model";
import {listenSuggestions, readSuggestionsPaginated} from "@/services";

const PAGE_SIZE = 10

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
        queryFn: ({pageParam}) => readSuggestionsPaginated(PAGE_SIZE, pageParam),
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
            () => queryClient.invalidateQueries({queryKey: suggestionKeys.paginated})
        )

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current()
            }
        }
    }, [getSuggestionsPaginated.data?.pages.length, queryClient]);

    return {getSuggestionsPaginated}
}
