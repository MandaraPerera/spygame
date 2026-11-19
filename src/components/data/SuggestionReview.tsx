import {Alert, Badge, Button, Checkbox, HStack, SimpleGrid, Text} from "@chakra-ui/react";
import {useState} from "react";
import {FaCheck, FaTimes} from "react-icons/fa";
import {toaster} from "@/components/ui";
import {ConfirmDialog} from "@/components/util";
import {useCategories, useSuggestions, useTerms} from "@/hooks";
import type {Suggestion} from "@/model";
import {errorMessage, findCategoryByName, formatDate, nameKey, normalizeName, pluralize} from "@/utils";

interface SuggestionReviewProps {
    suggestion: Suggestion
}

type TermRow = {
    term: string
    key: string
    isExisting: boolean
    isSelected: boolean
}

function describeTarget(suggestion: Suggestion, categoryExists: boolean | null): string {
    const name = normalizeName(suggestion.category)
    if (categoryExists === null) return `Category: ${name}`
    if (suggestion.isNewCategory) {
        return categoryExists ? `${name} exists by now; the terms are added to it.` : `Creates the new category ${name}.`
    }
    return categoryExists ? `Adds terms to ${name}.` : `${name} no longer exists, so this suggestion can only be denied.`
}

// The body of an open suggestion: pick the terms to approve, or deny it. Rendered only once the row is opened,
// so the category's terms are only read for suggestions the admin looks at.
export function SuggestionReview({suggestion}: SuggestionReviewProps) {
    const {approveSuggestion, denySuggestion} = useSuggestions()
    const {getCategories: {data: categories}} = useCategories()
    const category = categories ? findCategoryByName(categories, suggestion.category) ?? null : undefined
    const {getTerms: {data: existingTerms}} = useTerms(category ? [category.id] : [])

    const [excludedKeys, setExcludedKeys] = useState<string[]>([])
    const [error, setError] = useState<string | null>(null)
    const [isDenyDialogOpen, setIsDenyDialogOpen] = useState<boolean>(false)
    const isBusy = approveSuggestion.isPending || denySuggestion.isPending

    const existingKeys = new Set((existingTerms ?? []).map((term) => nameKey(term.value)))
    const rows: TermRow[] = suggestion.terms.map((term) => {
        const key = nameKey(term)
        const isExisting = existingKeys.has(key)
        return {term, key, isExisting, isSelected: !isExisting && !excludedKeys.includes(key)}
    })
    const selectableRows = rows.filter((row) => !row.isExisting)
    const selectedTerms = rows.filter((row) => row.isSelected).map((row) => row.term)
    const isOrphan = !suggestion.isNewCategory && category === null
    const canApprove = suggestion.isValid && !isOrphan && selectedTerms.length > 0

    const toggle = (key: string, isSelected: boolean) => {
        setExcludedKeys((keys) => isSelected ? keys.filter((other) => other !== key) : [...keys, key])
    }

    const toggleAll = () => {
        setExcludedKeys(selectedTerms.length > 0 ? selectableRows.map((row) => row.key) : [])
    }

    const handleApprove = async () => {
        setError(null)

        try {
            await approveSuggestion.mutateAsync({suggestion, terms: selectedTerms})
            toaster.create({
                type: "success",
                title: "Suggestion approved",
                description: `${selectedTerms.length} ${pluralize(selectedTerms.length, "term", "terms")} for ${suggestion.category}`
            })
        } catch (approveError) {
            setError(errorMessage(approveError))
        }
    }

    const handleDeny = async () => {
        setError(null)

        try {
            await denySuggestion.mutateAsync(suggestion)
            toaster.create({type: "info", title: "Suggestion denied", description: suggestion.category})
        } catch (denyError) {
            setError(errorMessage(denyError))
        } finally {
            setIsDenyDialogOpen(false)
        }
    }

    return (
        <>
            {error ? (
                <Alert.Root status="error" size="sm" mb={2}>
                    <Alert.Indicator/>
                    <Alert.Description>{error}</Alert.Description>
                </Alert.Root>
            ) : null}

            <Text fontSize="xs" fontWeight="light">Suggested {formatDate(suggestion.timestamp)}</Text>

            {suggestion.isValid ? (
                <>
                    <Text fontSize="sm" mb={2}>{describeTarget(suggestion, category === undefined ? null : category !== null)}</Text>
                    <HStack justify="space-between" mb={1}>
                        <Text fontSize="sm" fontWeight="semibold">
                            Approve {selectedTerms.length} of {rows.length} {pluralize(rows.length, "term", "terms")}
                        </Text>
                        {selectableRows.length > 1 ? (
                            <Button size="xs" variant="ghost" disabled={isBusy || isOrphan} onClick={toggleAll}>
                                {selectedTerms.length > 0 ? "Select none" : "Select all"}
                            </Button>
                        ) : null}
                    </HStack>
                    <SimpleGrid columns={{base: 1, sm: 2}} gapX={4} gapY={1} mb={3}>
                        {rows.map((row, index) => (
                            <HStack key={`${row.key}-${index}`} gap={2} minW={0}>
                                <Checkbox.Root size="sm" minW={0} checked={row.isSelected}
                                               disabled={row.isExisting || isBusy || isOrphan}
                                               onCheckedChange={(e) => toggle(row.key, e.checked === true)}>
                                    <Checkbox.HiddenInput/>
                                    <Checkbox.Control/>
                                    <Checkbox.Label truncate
                                                    textDecoration={row.isExisting ? "line-through" : undefined}>
                                        {row.term}
                                    </Checkbox.Label>
                                </Checkbox.Root>
                                {row.isExisting ? <Badge size="sm" flexShrink={0}>In game</Badge> : null}
                            </HStack>
                        ))}
                    </SimpleGrid>
                </>
            ) : (
                <Text fontSize="sm" my={2}>This suggestion is malformed and can only be denied.</Text>
            )}

            <HStack>
                <Button flex={1} size="sm" onClick={handleApprove}
                        loading={approveSuggestion.isPending}
                        disabled={isBusy || !canApprove}><FaCheck/>Approve</Button>
                <Button flex={1} size="sm" onClick={() => setIsDenyDialogOpen(true)}
                        disabled={isBusy}><FaTimes/>Deny</Button>
            </HStack>

            <ConfirmDialog open={isDenyDialogOpen} setOpen={setIsDenyDialogOpen}
                           title="Deny suggestion?"
                           text={`"${suggestion.category}" and its ${suggestion.terms.length} ${pluralize(suggestion.terms.length, "term", "terms")} will be deleted. This cannot be undone.`}
                           confirmLabel="Deny" isDestructive
                           isPending={denySuggestion.isPending}
                           onConfirm={handleDeny}/>
        </>
    )
}
