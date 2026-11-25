import {Button, Field, HStack, Input, InputGroup, NativeSelect, Skeleton, Stack, Text} from "@chakra-ui/react";
import {useState} from "react";
import {LuPlus, LuSearch} from "react-icons/lu";
import {useSearchParams} from "react-router-dom";
import {AddTermsDialog, EditableRow} from "@/components/data";
import {toaster} from "@/components/ui";
import {AlertMessage, ListPanel, PageHeader, Screen} from "@/components/util";
import {useCategories, useTerms} from "@/hooks";
import type {Category, Term} from "@/model";
import {checkTermLength, errorMessage, nameKey, normalizeName, pluralize} from "@/utils";

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
        const error = checkTermLength(value, "A term") ?? (isDuplicate ? `"${value}" is already in ${category.value}` : null)

        if (error) {
            toaster.create({type: "error", title: error})
            return false
        }

        try {
            await renameTerm.mutateAsync({term, value, categoryName: category.value})
            toaster.create({type: "success", title: "Term renamed", description: value})
            return true
        } catch (renameError) {
            toaster.create({type: "error", title: "Couldn't rename the term", description: errorMessage(renameError)})
            return false
        }
    }

    const remove = async (term: Term) => {
        try {
            await removeTerm.mutateAsync({term, categoryName: category.value})
            toaster.create({type: "info", title: "Term deleted", description: term.value})
        } catch (deleteError) {
            toaster.create({type: "error", title: "Couldn't delete the term", description: errorMessage(deleteError)})
        }
    }

    if (isError) {
        return (
            <AlertMessage status="error" title="Couldn't load the terms" text="Check your connection and try again."
                          action={{label: "Try again", onClick: () => refetch()}}/>
        )
    }

    if (isPending) {
        return <Skeleton h="20rem" rounded="panel"/>
    }

    const filterKey = nameKey(filter)
    const visibleTerms = terms
        .filter((term) => nameKey(term.value).includes(filterKey))
        .sort((a, b) => a.value.localeCompare(b.value))

    const renderTerms = () => {
        if (terms.length === 0) {
            return (
                <Text color="fg.muted">{category.value} has no terms yet, so players cannot pick it. Add some above.</Text>
            )
        }

        if (visibleTerms.length === 0) {
            return <Text color="fg.muted">No term matches “{normalizeName(filter)}”.</Text>
        }

        return (
            <ListPanel>
                {visibleTerms.map((term) => (
                    <EditableRow key={term.id}
                                 value={term.value}
                                 badge={term.source === "community" ? "Community" : undefined}
                                 deleteTitle={`Delete "${term.value}"?`}
                                 deleteText={`The term will be removed from ${category.value}. This cannot be undone.`}
                                 isBusy={isBusy}
                                 onRename={(value) => rename(term, value)}
                                 onDelete={() => remove(term)}/>
                ))}
            </ListPanel>
        )
    }

    return (
        <Stack gap="3">
            <HStack gap="2">
                <InputGroup flex="1" startElement={<LuSearch/>}>
                    <Input type="search" value={filter} placeholder="Filter terms" enterKeyHint="search"
                           aria-label={`Filter the terms of ${category.value}`}
                           onChange={(e) => setFilter(e.target.value)}/>
                </InputGroup>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
                    <LuPlus/> Add terms
                </Button>
            </HStack>
            <Text textStyle="sm" color="fg.muted">
                {filterKey ? `${visibleTerms.length} of ` : ""}{terms.length} {pluralize(terms.length, "term", "terms")}
            </Text>
            {renderTerms()}

            <AddTermsDialog open={isAddDialogOpen} setOpen={setIsAddDialogOpen} category={category}/>
        </Stack>
    )
}

export function Terms() {
    const {getCategories: {data: categories, isPending, isError, refetch}} = useCategories()
    // The selected category is part of the URL, so the Categories page can link to it and a reload keeps it.
    const [searchParams, setSearchParams] = useSearchParams()
    const categoryId = searchParams.get("category")

    const sortedCategories = (categories ?? []).slice().sort((a, b) => a.value.localeCompare(b.value))
    const category = sortedCategories.find((item) => item.id === categoryId) ?? null

    const selectCategory = (id: string | null) => {
        setSearchParams(id ? {category: id} : {}, {replace: true})
    }

    const renderSelection = () => {
        if (category) {
            return <TermList key={category.id} category={category}/>
        }

        if (categoryId) {
            return <Text color="fg.muted">This category no longer exists. Select another one.</Text>
        }

        return <Text color="fg.muted">Select a category to see, add, rename and delete its terms.</Text>
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
            return <Skeleton h="11" rounded="l2" mt="2"/>
        }

        return (
            <>
                <Field.Root pt="2">
                    <Field.Label srOnly>Category</Field.Label>
                    <NativeSelect.Root size="lg">
                        <NativeSelect.Field placeholder="Select a category" value={category?.id ?? ""}
                                            onChange={(e) => selectCategory(e.target.value || null)}>
                            {sortedCategories.map((item) => (
                                <option key={item.id} value={item.id}>{item.value}</option>
                            ))}
                        </NativeSelect.Field>
                        <NativeSelect.Indicator/>
                    </NativeSelect.Root>
                </Field.Root>
                {renderSelection()}
            </>
        )
    }

    return (
        <Screen header={<PageHeader title="Terms" backTo="/manage-data"/>}>
            {renderContent()}
        </Screen>
    )
}
