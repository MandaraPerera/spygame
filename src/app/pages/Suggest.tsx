import {
    Button,
    Field,
    Heading,
    HStack,
    IconButton,
    Input,
    NativeSelect,
    SegmentGroup,
    Stack,
    Text
} from "@chakra-ui/react";
import {type KeyboardEvent, useState} from "react";
import {LuPlus, LuTrash2} from "react-icons/lu";
import {useNavigate} from "react-router-dom";
import {v4 as uuid} from 'uuid';
import {SuggestIntro, SuggestSkeleton} from "@/components/suggest";
import {toaster} from "@/components/ui";
import {AlertMessage, ConfirmDialog, PageHeader, Screen} from "@/components/util";
import {MAX_TERMS_PER_SUGGESTION, MIN_TERMS_FOR_NEW_CATEGORY, NAME_MAX_LENGTH, NAME_MIN_LENGTH, TERM_MIN_LENGTH} from "@/config";
import {useCategories, useSuggestions, useTerms} from "@/hooks";
import type {SuggestionData} from "@/model";
import {validateSuggestion} from "@/utils";

type TermField = {
    id: string
    value: string
}

type CategoryMode = "existing" | "new"

const CATEGORY_MODES = [
    {value: "existing", label: "Existing category"},
    {value: "new", label: "New category"}
]

const emptyTerm = (): TermField => ({id: uuid(), value: ""})
const termInputId = (id: string) => `word-${id}`

export function Suggest() {
    const navigate = useNavigate()
    const {getCategories: {data: categories, isPending, isError, refetch}} = useCategories()
    const {addSuggestion} = useSuggestions()

    // Each mode keeps its own value, so switching modes never submits what the screen no longer shows.
    const [isNewCategory, setIsNewCategory] = useState<boolean>(false)
    const [newCategory, setNewCategory] = useState<string>("")
    const [existingCategoryId, setExistingCategoryId] = useState<string | null>(null)
    const [terms, setTerms] = useState<TermField[]>(() => [emptyTerm()])
    const [addedTermId, setAddedTermId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [pendingSuggestion, setPendingSuggestion] = useState<SuggestionData | null>(null)

    // The picked category's terms, so a word it already has is caught before it reaches an admin.
    const checkedCategoryIds = !isNewCategory && existingCategoryId ? [existingCategoryId] : []
    const {getTerms: {data: existingTerms, isFetching: isFetchingTerms}} = useTerms(checkedCategoryIds)

    const sortedCategories = (categories ?? []).slice().sort((a, b) => a.value.localeCompare(b.value))

    const addTerm = () => {
        if (terms.length >= MAX_TERMS_PER_SUGGESTION) {
            setError(`A suggestion can have at most ${MAX_TERMS_PER_SUGGESTION} words. Send more once these are approved.`)
            return
        }

        const term = emptyTerm()
        setTerms((previousTerms) => [...previousTerms, term])
        setAddedTermId(term.id)
        setError(null)
    }

    const updateTerm = (id: string, value: string) => {
        setTerms((previousTerms) => previousTerms.map((term) => term.id === id ? {...term, value} : term))
        setError(null)
    }

    const deleteTerm = (id: string) => {
        setTerms((previousTerms) => previousTerms.filter((term) => term.id !== id))
        setError(null)
    }

    // Enter moves on to the next word, and adds one after the last, so a list can be typed without lifting a thumb.
    const handleTermKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
        if (event.key !== "Enter") return
        event.preventDefault()

        const nextTerm = terms[index + 1]
        if (nextTerm) {
            document.getElementById(termInputId(nextTerm.id))?.focus()
        } else {
            addTerm()
        }
    }

    const reviewSuggestion = () => {
        const result = validateSuggestion({
            isNewCategory,
            newCategory,
            existingCategoryId,
            terms: terms.map((term) => term.value)
        }, categories ?? [], (existingTerms ?? []).map((term) => term.value))

        if (!result.ok) {
            setError(result.error)
            return
        }

        setPendingSuggestion(result.suggestion)
    }

    const submitSuggestion = async () => {
        if (!pendingSuggestion || addSuggestion.isPending) return

        try {
            await addSuggestion.mutateAsync(pendingSuggestion)
            navigate('/')
            toaster.create({
                type: "success",
                title: "Suggestion sent",
                description: "It shows up in the game once an admin approves it.",
                duration: 5000,
            })
        } catch {
            setPendingSuggestion(null)
            toaster.create({
                type: "error",
                title: "Couldn't send your suggestion",
                description: "Check your connection and try again."
            })
        }
    }

    if (isPending) {
        return <SuggestSkeleton/>
    }

    if (isError) {
        return (
            <Screen header={<PageHeader title="Suggest words" backTo="/"/>}>
                <AlertMessage status="error" title="Couldn't load the categories"
                              text="Check your connection and try again."
                              action={{label: "Try again", onClick: () => refetch()}}/>
            </Screen>
        )
    }

    return (
        <Screen header={<PageHeader title="Suggest words" backTo="/"/>} footer={(
            <>
                {error ? (
                    <Text role="alert" textStyle="sm" color="red.fg" textAlign="center">{error}</Text>
                ) : null}
                <Button size="xl" h="14" colorPalette="manila" loading={isFetchingTerms}
                        onClick={reviewSuggestion}>Send suggestion</Button>
            </>
        )}>
            <SuggestIntro/>

            <Stack as="section" gap="3" aria-labelledby="suggest-category">
                <Heading as="h2" id="suggest-category" textStyle="title">Category</Heading>
                <SegmentGroup.Root size="lg" w="100%" value={isNewCategory ? "new" : "existing"}
                                   onValueChange={(e) => {
                                       setIsNewCategory((e.value as CategoryMode) === "new")
                                       setError(null)
                                   }}>
                    <SegmentGroup.Indicator/>
                    <SegmentGroup.Items items={CATEGORY_MODES} flex="1" justifyContent="center"/>
                </SegmentGroup.Root>

                {isNewCategory ? (
                    <Field.Root>
                        <Field.Label>Name</Field.Label>
                        <Input value={newCategory} placeholder="Animals" maxLength={NAME_MAX_LENGTH}
                               autoComplete="off" autoCapitalize="words"
                               onChange={(e) => {
                                   setNewCategory(e.target.value)
                                   setError(null)
                               }}/>
                        <Field.HelperText>
                            {NAME_MIN_LENGTH} to {NAME_MAX_LENGTH} characters. A new category needs at
                            least {MIN_TERMS_FOR_NEW_CATEGORY} words.
                        </Field.HelperText>
                    </Field.Root>
                ) : (
                    <Field.Root>
                        <Field.Label srOnly>Existing category</Field.Label>
                        <NativeSelect.Root size="lg">
                            <NativeSelect.Field placeholder="Pick a category" value={existingCategoryId ?? ""}
                                                onChange={(e) => {
                                                    setExistingCategoryId(e.target.value || null)
                                                    setError(null)
                                                }}>
                                {sortedCategories.map((category) => (
                                    <option key={category.id} value={category.id}>{category.value}</option>
                                ))}
                            </NativeSelect.Field>
                            <NativeSelect.Indicator/>
                        </NativeSelect.Root>
                    </Field.Root>
                )}
            </Stack>

            <Stack as="section" gap="3" aria-labelledby="suggest-words">
                <HStack justify="space-between" align="baseline">
                    <Heading as="h2" id="suggest-words" textStyle="title">Words</Heading>
                    <Text textStyle="sm" color="fg.muted">{TERM_MIN_LENGTH} to {NAME_MAX_LENGTH} characters each</Text>
                </HStack>
                {terms.map((term, index) => (
                    <HStack key={term.id} gap="1">
                        <Input id={termInputId(term.id)} value={term.value} placeholder={`Word ${index + 1}`}
                               maxLength={NAME_MAX_LENGTH} aria-label={`Word ${index + 1}`}
                               autoComplete="off" autoCapitalize="words" autoFocus={term.id === addedTermId}
                               enterKeyHint={index === terms.length - 1 ? "done" : "next"}
                               onKeyDown={(e) => handleTermKeyDown(e, index)}
                               onChange={(e) => updateTerm(term.id, e.target.value)}/>
                        <IconButton variant="ghost" color="fg.muted" aria-label={`Remove word ${index + 1}`}
                                    disabled={terms.length === 1} onClick={() => deleteTerm(term.id)}>
                            <LuTrash2/>
                        </IconButton>
                    </HStack>
                ))}
                <Button variant="outline" alignSelf="start" onClick={addTerm}>
                    <LuPlus/> Add word
                </Button>
            </Stack>

            <ConfirmDialog open={pendingSuggestion !== null}
                           setOpen={(open) => !open && setPendingSuggestion(null)}
                           title="Send this suggestion?"
                           text="Check your spelling first: an admin approves suggestions before they show up in the game."
                           confirmLabel="Send"
                           isPending={addSuggestion.isPending}
                           onConfirm={submitSuggestion}/>
        </Screen>
    )
}
