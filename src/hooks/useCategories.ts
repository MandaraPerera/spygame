import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useCallback, useState} from "react";
import {categoryKeys} from "@/config";
import type {CategoryData} from "@/model";
import {createCategory, readCategories, readCategoryIdByName} from "@/services";

export function useCategories() {
    const queryClient = useQueryClient()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isError, setIsError] = useState<string | null>(null)

    const addCategory = useMutation({
        mutationFn: (categoryData: CategoryData) => createCategory(categoryData),
        onSuccess: async (category) => {
            await queryClient.invalidateQueries({queryKey: categoryKeys.all})
            await queryClient.invalidateQueries({queryKey: categoryKeys.detail(category.id)})
        }
    })

    const getCategoryIdByName = useCallback(async (categoryName: string) => {
        setIsLoading(true)
        try {
            return await readCategoryIdByName(categoryName)
        } catch (e) {
            setIsError((e as Error).message)
        } finally {
            setIsLoading(false)
        }
    }, []);

    const getCategories = useQuery({
        queryKey: categoryKeys.all,
        queryFn: readCategories,
        staleTime: 5 * 60 * 1000
    })

    return {
        isLoading, isError,
        addCategory,
        getCategoryIdByName,
        getCategories
    }
}
