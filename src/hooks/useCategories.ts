import {useQuery} from "@tanstack/react-query";
import {getAllCategories} from "@/services/firestore";

export const useCategories = () => {
    const getCategories = useQuery({
        queryKey: ["categories"],
        queryFn: getAllCategories,
        staleTime: 5 * 60 * 1000
    })

    return {
        getCategories
    }
}