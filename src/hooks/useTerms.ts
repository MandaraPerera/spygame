import {useQuery} from "@tanstack/react-query";
import {getAllTermsByCategoryId} from "@/services/firestore";

export const useTerms = (categoryIds: string[]) => {
    const getTerms = useQuery({
        queryKey: ["terms", categoryIds],
        queryFn: () => getAllTermsByCategoryId(categoryIds),
        staleTime: 1000 * 60 * 5,
        enabled: !!categoryIds
    })

    return {
        getTerms
    }
}