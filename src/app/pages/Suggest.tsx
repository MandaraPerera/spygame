import {
    Box,
    Button,
    createListCollection,
    Heading,
    HStack,
    IconButton,
    Input,
    Portal,
    Select,
    Separator,
    Spacer,
    Switch,
    VStack
} from "@chakra-ui/react";
import {useState} from "react";
import {FaPlus, FaTrash} from "react-icons/fa";
import {useNavigate} from "react-router-dom";
import {v4 as uuid} from 'uuid';
import {SuggestIntro, SuggestSkeleton} from "@/components/suggest";
import {toaster} from "@/components/ui";
import {AlertMessage, ConfirmDialog, PageHeader} from "@/components/util";
import {MAX_TERMS_PER_SUGGESTION, NAME_MAX_LENGTH} from "@/config";
import {useCategories, useSuggestions} from "@/hooks";
import type {SuggestionData} from "@/model";
import {validateSuggestion} from "@/utils";

type TermField = {
    id: string
    value: string
}

const emptyTerm = (): TermField => ({id: uuid(), value: ""})

export function Suggest() {
    const navigate = useNavigate()
    const {getCategories: {data: categories, isPending, isError, refetch}} = useCategories()
    const {addSuggestion} = useSuggestions()

    // Each mode keeps its own value, so switching modes never submits what the screen no longer shows.
    const [isNewCategory, setIsNewCategory] = useState<boolean>(false)
    const [newCategory, setNewCategory] = useState<string>("")
    const [existingCategoryId, setExistingCategoryId] = useState<string | null>(null)
    const [terms, setTerms] = useState<TermField[]>(() => [emptyTerm()])
    const [pendingSuggestion, setPendingSuggestion] = useState<SuggestionData | null>(null)

    const sortedCategories = (categories ?? []).slice().sort((a, b) => a.value.localeCompare(b.value))
    const categoriesCollection = createListCollection({
        items: sortedCategories,
        itemToString: (category) => category.value,
        itemToValue: (category) => category.id
    })

    const showErrorToast = (text: string) => {
        toaster.create({type: "error", title: text})
    }

    const addTerm = () => {
        if (terms.length >= MAX_TERMS_PER_SUGGESTION) {
            toaster.create({
                type: "error",
                title: `Maximum of ${MAX_TERMS_PER_SUGGESTION} terms per suggestion`,
                description: "Add more when these get approved.",
            })
            return
        }

        setTerms((previousTerms) => [...previousTerms, emptyTerm()])
    }

    const updateTerm = (id: string, value: string) => {
        setTerms((previousTerms) => previousTerms.map((term) => term.id === id ? {...term, value} : term))
    }

    const deleteTerm = (id: string) => {
        setTerms((previousTerms) => previousTerms.filter((term) => term.id !== id))
    }

    const reviewSuggestion = () => {
        const result = validateSuggestion({
            isNewCategory,
            newCategory,
            existingCategoryId,
            terms: terms.map((term) => term.value)
        }, categories ?? [])

        if (!result.ok) {
            showErrorToast(result.error)
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
                title: "Content Submitted",
                description: "Once it gets approved it will appear in the game!",
                duration: 5000,
            })
        } catch {
            showErrorToast("Your suggestion could not be sent. Check your connection and try again.")
        }
    }

    if (isPending) {
        return <SuggestSkeleton/>
    }

    if (isError) {
        return (
            <AlertMessage status="error" title="Error" text="Error loading categories"
                          action={{label: "Try again", onClick: () => refetch()}}/>
        )
    }

    return (
        <VStack maxW="500px" w="90%" flex={1}>
            <PageHeader title="Suggest Content" closeTo="/" mb={2}/>
            <SuggestIntro/>
            <HStack mt={6} w="100%">
                <Heading>Category</Heading>
                <Spacer/>
                <Switch.Root checked={isNewCategory} onCheckedChange={(e) => setIsNewCategory(e.checked)}>
                    <Switch.HiddenInput/>
                    <Switch.Label>New category</Switch.Label>
                    <Switch.Control>
                        <Switch.Thumb/>
                    </Switch.Control>
                </Switch.Root>
            </HStack>
            <Box w="100%">
                {isNewCategory ? (
                    <Input value={newCategory} placeholder="New category" maxLength={NAME_MAX_LENGTH}
                           aria-label="New category name"
                           onChange={(e) => setNewCategory(e.target.value)}/>
                ) : (
                    <Select.Root size="sm" minW="170px" width="50%" collection={categoriesCollection}
                                 value={existingCategoryId ? [existingCategoryId] : []}
                                 onValueChange={(e) => setExistingCategoryId(e.value[0] ?? null)}>
                        <Select.HiddenSelect/>
                        <Select.Label srOnly>Existing category</Select.Label>
                        <Select.Control>
                            <Select.Trigger>
                                <Select.ValueText placeholder="Select category"/>
                            </Select.Trigger>
                            <Select.IndicatorGroup>
                                <Select.Indicator/>
                            </Select.IndicatorGroup>
                        </Select.Control>
                        <Portal>
                            <Select.Positioner>
                                <Select.Content>
                                    {categoriesCollection.items.map((category) => (
                                        <Select.Item item={category} key={category.id}>
                                            {category.value}
                                            <Select.ItemIndicator/>
                                        </Select.Item>
                                    ))}
                                </Select.Content>
                            </Select.Positioner>
                        </Portal>
                    </Select.Root>
                )}
            </Box>
            <Separator w="100%"/>
            <Heading w="100%" mt={4}>Terms</Heading>
            {terms.map((term, index) => (
                <HStack key={term.id} w="100%">
                    <Input value={term.value} placeholder="Term" maxLength={NAME_MAX_LENGTH}
                           aria-label={`Term ${index + 1}`}
                           onChange={(e) => updateTerm(term.id, e.target.value)}/>
                    <IconButton variant="outline" aria-label={`Remove term ${index + 1}`}
                                onClick={() => deleteTerm(term.id)}>
                        <FaTrash/>
                    </IconButton>
                </HStack>
            ))}
            <Button size="sm" variant="outline" alignSelf="start" onClick={addTerm}>
                <FaPlus/> Add term
            </Button>
            <Separator w="100%"/>
            <Button alignSelf="end" w="100px" mt={4} onClick={reviewSuggestion}>
                Submit
            </Button>

            <ConfirmDialog open={pendingSuggestion !== null}
                           setOpen={(open) => !open && setPendingSuggestion(null)}
                           title="Submit Content?"
                           text="Are you sure you want to submit? Double check your content before submitting. It needs to be approved before you will see it in the game."
                           confirmLabel="Submit"
                           isPending={addSuggestion.isPending}
                           onConfirm={submitSuggestion}/>
        </VStack>
    )
}
