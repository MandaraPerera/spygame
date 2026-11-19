import {type InfiniteData, useInfiniteQuery} from "@tanstack/react-query";
import type {QueryDocumentSnapshot} from "firebase/firestore";
import {logKeys, LOGS_PAGE_SIZE} from "@/config";
import type {PaginatedLogs} from "@/model";
import {readLogsPaginated} from "@/services";

export function useLogs() {
    return useInfiniteQuery<
        PaginatedLogs,
        Error,
        InfiniteData<PaginatedLogs>,
        typeof logKeys.paginated,
        QueryDocumentSnapshot | undefined
    >({
        queryKey: logKeys.paginated,
        initialPageParam: undefined,
        queryFn: ({pageParam}) => readLogsPaginated(LOGS_PAGE_SIZE, pageParam),
        getNextPageParam: (lastPage) => lastPage.cursor ?? undefined,
        staleTime: 60 * 1000
    })
}
