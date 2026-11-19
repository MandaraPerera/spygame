import {createListCollection, Portal, Select, Skeleton, Text, VStack} from "@chakra-ui/react";
import {useState} from "react";
import {EditableRow} from "@/components/data";
import {toaster} from "@/components/ui";
import {AlertMessage, PageHeader} from "@/components/util";
import {useCategories, useTerms} from "@/hooks";
import type {Category, Term} from "@/model";
import {checkLength, nameKey, normalizeName} from "@/utils";

function toMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Something went wrong. Please try again."
}

interface TermListProps {
    category: Category
}

function TermList({category}: TermListProps) {
    const {getTerms: {data: terms, isPending, isError, refetch}, renameTerm, removeTerm} = useTerms([category.id])
    const isBusy = renameTerm.isPending || removeTerm.isPending

    const rename = async (term: Term, rawValue: string): Promise<boolean> => {
        const value = normalizeName(rawValue)
        const isDuplicate = (terms ?? []).some((other) => other.id !== term.id && nameKey(other.value) === nameKey(value))
        const error = checkLength(value, "A term") ?? (isDuplicate ? `"${value}" is already in ${category.value}` : null)

        if (error) {
            toaster.create({type: "error", title: error})
            return false
        }

        try {
            await renameTerm.mutateAsync({term, value, categoryName: category.value})
            toaster.create({type: "success", title: "Term renamed", description: value})
            return true
        } catch (renameError) {
            toaster.create({type: "error", title: "Could not rename the term", description: toMessage(renameError)})
            return false
        }
    }

    const remove = async (term: Term) => {
        try {
            await removeTerm.mutateAsync({term, categoryName: category.value})
            toaster.create({type: "info", title: "Term deleted", description: term.value})
        } catch (deleteError) {
            toaster.create({type: "error", title: "Could not delete the term", description: toMessage(deleteError)})
        }
    }

    if (isError) {
        return (
            <AlertMessage status="error" title="Error" text="The terms could not be loaded."
                          action={{label: "Try again", onClick: () => refetch()}}/>
        )
    }

    if (isPending) {
        return Array.from({length: 4}, (_, index) => <Skeleton key={index} w="100%" h="10"/>)
    }

    if (terms.length === 0) {
        return <Text>{category.value} has no terms yet.</Text>
    }

    return terms
        .slice()
        .sort((a, b) => a.value.localeCompare(b.value))
        .map((term) => (
            <EditableRow key={term.id}
                         value={term.value}
                         badge={term.isOriginal ? undefined : "Community"}
                         deleteTitle={`Delete "${term.value}"?`}
                         deleteText={`The term will be removed from ${category.value}. This cannot be undone.`}
                         isBusy={isBusy}
                         onRename={(value) => rename(term, value)}
                         onDelete={() => remove(term)}/>
        ))
}

export function Terms() {
    const {getCategories: {data: categories, isPending, isError, refetch}} = useCategories()
    const [categoryId, setCategoryId] = useState<string | null>(null)

    const sortedCategories = (categories ?? []).slice().sort((a, b) => a.value.localeCompare(b.value))
    const category = sortedCategories.find((item) => item.id === categoryId) ?? null
    const categoriesCollection = createListCollection({
        items: sortedCategories,
        itemToString: (item) => item.value,
        itemToValue: (item) => item.id
    })

    const renderContent = () => {
        if (isError) {
            return (
                <AlertMessage status="error" title="Error" text="The categories could not be loaded."
                              action={{label: "Try again", onClick: () => refetch()}}/>
            )
        }

        if (isPending) {
            return <Skeleton w="100%" h="10"/>
        }

        return (
            <>
                <Select.Root size="sm" w="100%" mb={4} collection={categoriesCollection}
                             value={categoryId ? [categoryId] : []}
                             onValueChange={(e) => setCategoryId(e.value[0] ?? null)}>
                    <Select.HiddenSelect/>
                    <Select.Label srOnly>Category</Select.Label>
                    <Select.Control>
                        <Select.Trigger>
                            <Select.ValueText placeholder="Select a category"/>
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                            <Select.Indicator/>
                        </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                        <Select.Positioner>
                            <Select.Content>
                                {categoriesCollection.items.map((item) => (
                                    <Select.Item item={item} key={item.id}>
                                        {item.value}
                                        <Select.ItemIndicator/>
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Positioner>
                    </Portal>
                </Select.Root>
                {category ? <TermList key={category.id} category={category}/> : null}
            </>
        )
    }

    return (
        <VStack maxW="500px" w="90%" flex={1} gap={2}>
            <PageHeader title="Terms" backTo="/manage-data"/>
            {renderContent()}
        </VStack>
    )
}
