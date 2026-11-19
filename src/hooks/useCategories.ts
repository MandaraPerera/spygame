import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {categoryKeys, logKeys, statsKeys, termKeys} from "@/config";
import type {Category} from "@/model";
import {deleteCategory, readCategories, updateCategory} from "@/services";

export function useCategories() {
    const queryClient = useQueryClient()

    const invalidate = async () => {
        await Promise.all([categoryKeys.all, termKeys.all, statsKeys.all, logKeys.all]
            .map((queryKey) => queryClient.invalidateQueries({queryKey})))
    }

    const getCategories = useQuery({
        queryKey: categoryKeys.all,
        queryFn: readCategories,
        staleTime: 5 * 60 * 1000
    })

    const renameCategory = useMutation({
        mutationFn: ({category, value}: { category: Category, value: string }) => updateCategory(category, value),
        onSuccess: invalidate
    })

    const removeCategory = useMutation({
        mutationFn: (category: Category) => deleteCategory(category),
        onSuccess: invalidate
    })

    return {
        getCategories,
        renameCategory,
        removeCategory
    }
}
