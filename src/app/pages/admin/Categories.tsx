import {Skeleton, Text, VStack} from "@chakra-ui/react";
import {EditableRow} from "@/components/data";
import {toaster} from "@/components/ui";
import {AlertMessage, PageHeader} from "@/components/util";
import {useCategories} from "@/hooks";
import type {Category} from "@/model";
import {checkLength, findCategoryByName, normalizeName} from "@/utils";

function toMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Something went wrong. Please try again."
}

export function Categories() {
    const {getCategories: {data: categories, isPending, isError, refetch}, renameCategory, removeCategory} = useCategories()
    const isBusy = renameCategory.isPending || removeCategory.isPending

    const rename = async (category: Category, rawValue: string): Promise<boolean> => {
        const value = normalizeName(rawValue)
        const otherCategories = (categories ?? []).filter((other) => other.id !== category.id)
        const error = checkLength(value, "Category")
            ?? (findCategoryByName(otherCategories, value) ? `"${value}" already exists` : null)

        if (error) {
            toaster.create({type: "error", title: error})
            return false
        }

        try {
            await renameCategory.mutateAsync({category, value})
            toaster.create({type: "success", title: "Category renamed", description: value})
            return true
        } catch (renameError) {
            toaster.create({type: "error", title: "Could not rename the category", description: toMessage(renameError)})
            return false
        }
    }

    const remove = async (category: Category) => {
        try {
            await removeCategory.mutateAsync(category)
            toaster.create({type: "info", title: "Category deleted", description: category.value})
        } catch (deleteError) {
            toaster.create({type: "error", title: "Could not delete the category", description: toMessage(deleteError)})
        }
    }

    const renderContent = () => {
        if (isError) {
            return (
                <AlertMessage status="error" title="Error" text="The categories could not be loaded."
                              action={{label: "Try again", onClick: () => refetch()}}/>
            )
        }

        if (isPending) {
            return Array.from({length: 4}, (_, index) => <Skeleton key={index} w="100%" h="10"/>)
        }

        if (categories.length === 0) {
            return <Text>There are no categories yet.</Text>
        }

        return categories
            .slice()
            .sort((a, b) => a.value.localeCompare(b.value))
            .map((category) => (
                <EditableRow key={category.id}
                             value={category.value}
                             badge={category.isOriginal ? "Original" : "Community"}
                             deleteTitle={`Delete "${category.value}"?`}
                             deleteText="The category and all of its terms will be deleted. This cannot be undone."
                             isBusy={isBusy}
                             onRename={(value) => rename(category, value)}
                             onDelete={() => remove(category)}/>
            ))
    }

    return (
        <VStack maxW="500px" w="90%" flex={1} gap={2}>
            <PageHeader title="Categories" backTo="/manage-data"/>
            {renderContent()}
        </VStack>
    )
}
