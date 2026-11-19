import {useQuery} from "@tanstack/react-query";
import {termKeys} from "@/config";
import {readTermCounts} from "@/services";

// Admin only: how many terms each category has. Invalidated with every other terms query.
export function useTermCounts(categoryIds: string[]) {
    return useQuery({
        queryKey: termKeys.counts(categoryIds),
        queryFn: () => readTermCounts(categoryIds),
        staleTime: 60 * 1000,
        enabled: categoryIds.length > 0
    })
}
