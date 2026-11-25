import {Button, Skeleton, Stack, Text} from "@chakra-ui/react";
import {useState} from "react";
import {LuPlus} from "react-icons/lu";
import {useNavigate} from "react-router-dom";
import {EditableRow, NewCategoryDialog} from "@/components/data";
import {toaster} from "@/components/ui";
import {AlertMessage, ListPanel, PageHeader, Screen} from "@/components/util";
import {useCategories, useTermCounts} from "@/hooks";
import type {Category} from "@/model";
import {checkLength, errorMessage, findCategoryByName, normalizeName, pluralize, sourceLabel} from "@/utils";

interface TermCountButtonProps {
    category: Category
    count: number | undefined
}

function countLabel(count: number | undefined): string {
    if (count === undefined) return "Terms"
    if (count === 0) return "No terms"
    return `${count} ${pluralize(count, "term", "terms")}`
}

// Opens the category on the Terms page. A category without terms cannot be played, so it stands out.
function TermCountButton({category, count}: TermCountButtonProps) {
    const navigate = useNavigate()
    const isEmpty = count === 0

    return (
        <Button size="xs" variant="subtle" rounded="full" colorPalette={isEmpty ? "red" : "gray"} flexShrink={0}
                loading={count === undefined}
                aria-label={`Open the terms of ${category.value}`}
                onClick={() => navigate(`/terms?category=${encodeURIComponent(category.id)}`)}>
            {countLabel(count)}
        </Button>
    )
}

export function Categories() {
    const {getCategories: {data: categories, isPending, isError, refetch}, renameCategory, removeCategory} = useCategories()
    const {data: termCounts} = useTermCounts((categories ?? []).map((category) => category.id))
    const [isNewDialogOpen, setIsNewDialogOpen] = useState<boolean>(false)
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
            toaster.create({type: "error", title: "Could not rename the category", description: errorMessage(renameError)})
            return false
        }
    }

    const remove = async (category: Category) => {
        try {
            await removeCategory.mutateAsync(category)
            toaster.create({type: "info", title: "Category deleted", description: category.value})
        } catch (deleteError) {
            toaster.create({type: "error", title: "Could not delete the category", description: errorMessage(deleteError)})
        }
    }

    const renderContent = () => {
        if (isError) {
            return (
                <AlertMessage status="error" title="Couldn't load the categories"
                              text="Check your connection and try again."
                              action={{label: "Try again", onClick: () => refetch()}}/>
            )
        }

        if (isPending) {
            return <Skeleton h="20rem" rounded="panel"/>
        }

        if (categories.length === 0) {
            return (
                <AlertMessage status="info" title="No categories yet"
                              text="Create the first one with its words, and players can pick it right away."/>
            )
        }

        const rows = categories
            .slice()
            .sort((a, b) => a.value.localeCompare(b.value))
            .map((category) => {
                const count = termCounts?.[category.id]
                const itsTerms = count === undefined ? "its terms" : `its ${count} ${pluralize(count, "term", "terms")}`
                return (
                    <EditableRow key={category.id}
                                 value={category.value}
                                 badge={sourceLabel(category.source)}
                                 deleteTitle={`Delete "${category.value}"?`}
                                 deleteText={`The category and ${itsTerms} will be deleted. This cannot be undone.`}
                                 isBusy={isBusy}
                                 onRename={(value) => rename(category, value)}
                                 onDelete={() => remove(category)}>
                        <TermCountButton category={category} count={count}/>
                    </EditableRow>
                )
            })

        return (
            <Stack gap="2" pt="2">
                <Text textStyle="sm" color="fg.muted">
                    {categories.length} {pluralize(categories.length, "category", "categories")}
                </Text>
                <ListPanel>{rows}</ListPanel>
            </Stack>
        )
    }

    return (
        <Screen header={<PageHeader title="Categories" backTo="/manage-data"/>} footer={(
            <Button size="xl" colorPalette="manila" disabled={isPending || isError}
                    onClick={() => setIsNewDialogOpen(true)}>
                <LuPlus/> New category
            </Button>
        )}>
            {renderContent()}

            <NewCategoryDialog open={isNewDialogOpen} setOpen={setIsNewDialogOpen} categories={categories ?? []}/>
        </Screen>
    )
}
