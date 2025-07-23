import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useCallback, useState} from "react";
import {createCategory, getAllCategories, getCategoryIdByName} from "@/services/firestore";
import {CategoryData} from "@/model";

export const useCategories = () => {
    const queryClient = useQueryClient()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isError, setIsError] = useState<string | null>(null)

    const addCategory = useMutation({
        mutationFn: (categoryData: CategoryData) => createCategory(categoryData),
        onSuccess: async (category) => {
            await queryClient.invalidateQueries({queryKey: ['categories']})
            await queryClient.invalidateQueries({queryKey: ['categories', category.id]})
        }
    })

    const getCategoryIdOnName = useCallback(async (categoryName: string) => {
        setIsLoading(true)
        try {
            return await getCategoryIdByName(categoryName)
        } catch (e) {
            setIsError((e as Error).message)
        } finally {
            setIsLoading(false)
        }
    }, []);

    const getCategories = useQuery({
        queryKey: ["categories"],
        queryFn: getAllCategories,
        staleTime: 5 * 60 * 1000
    })

    return {
        isLoading, isError,
        addCategory,
        getCategoryIdByName: getCategoryIdOnName,
        getCategories
    }
}