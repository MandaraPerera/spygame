import {
    Button,
    createListCollection,
    HStack,
    Input,
    InputGroup,
    Portal,
    Select,
    Skeleton,
    Text,
    VStack
} from "@chakra-ui/react";
import {useState} from "react";
import {FaPlus} from "react-icons/fa";
import {LuSearch} from "react-icons/lu";
import {useSearchParams} from "react-router-dom";
import {AddTermsDialog, EditableRow} from "@/components/data";
import {toaster} from "@/components/ui";
import {AlertMessage, PageHeader} from "@/components/util";
import {useCategories, useTerms} from "@/hooks";
import type {Category, Term} from "@/model";
import {checkLength, errorMessage, nameKey, normalizeName, pluralize} from "@/utils";

interface TermListProps {
    category: Category
}

function TermList({category}: TermListProps) {
    const {getTerms: {data: terms, isPending, isError, refetch}, renameTerm, removeTerm} = useTerms([category.id])
    const [filter, setFilter] = useState<string>("")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false)
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
            toaster.create({type: "error", title: "Could not rename the term", description: errorMessage(renameError)})
            return false
        }
    }

    const remove = async (term: Term) => {
        try {
            await removeTerm.mutateAsync({term, categoryName: category.value})
            toaster.create({type: "info", title: "Term deleted", description: term.value})
        } catch (deleteError) {
            toaster.create({type: "error", title: "Could not delete the term", description: errorMessage(deleteError)})
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

    const filterKey = nameKey(filter)
    const visibleTerms = terms
        .filter((term) => nameKey(term.value).includes(filterKey))
        .sort((a, b) => a.value.localeCompare(b.value))

    const renderTerms = () => {
        if (terms.length === 0) {
            return <Text w="100%">{category.value} has no terms yet, so players cannot pick it. Add some above.</Text>
        }

        if (visibleTerms.length === 0) {
            return <Text w="100%">No term matches “{normalizeName(filter)}”.</Text>
        }

        return visibleTerms.map((term) => (
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

    return (
        <>
            <HStack w="100%">
                <InputGroup flex={1} startElement={<LuSearch/>}>
                    <Input value={filter} placeholder="Filter terms" aria-label={`Filter the terms of ${category.value}`}
                           onChange={(e) => setFilter(e.target.value)}/>
                </InputGroup>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
                    <FaPlus/> Add terms
                </Button>
            </HStack>
            <Text w="100%" fontSize="sm" fontWeight="light" mb={2}>
                {filterKey ? `${visibleTerms.length} of ` : ""}{terms.length} {pluralize(terms.length, "term", "terms")}
            </Text>
            {renderTerms()}

            <AddTermsDialog open={isAddDialogOpen} setOpen={setIsAddDialogOpen} category={category}/>
        </>
    )
}

export function Terms() {
    const {getCategories: {data: categories, isPending, isError, refetch}} = useCategories()
    // The selected category is part of the URL, so the Categories page can link to it and a reload keeps it.
    const [searchParams, setSearchParams] = useSearchParams()
    const categoryId = searchParams.get("category")

    const sortedCategories = (categories ?? []).slice().sort((a, b) => a.value.localeCompare(b.value))
    const category = sortedCategories.find((item) => item.id === categoryId) ?? null
    const categoriesCollection = createListCollection({
        items: sortedCategories,
        itemToString: (item) => item.value,
        itemToValue: (item) => item.id
    })

    const selectCategory = (id: string | null) => {
        setSearchParams(id ? {category: id} : {}, {replace: true})
    }

    const renderSelection = () => {
        if (category) {
            return <TermList key={category.id} category={category}/>
        }

        if (categoryId) {
            return <Text w="100%">This category no longer exists. Select another one.</Text>
        }

        return <Text w="100%">Select a category to see, add, rename and delete its terms.</Text>
    }

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
                             value={category ? [category.id] : []}
                             onValueChange={(e) => selectCategory(e.value[0] ?? null)}>
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
                {renderSelection()}
            </>
        )
    }

    return (
        <VStack maxW="500px" w="90%" flex={1} gap={2}>
            <PageHeader title="Terms" backTo="/manage-data" mb={6}/>
            {renderContent()}
        </VStack>
    )
}
