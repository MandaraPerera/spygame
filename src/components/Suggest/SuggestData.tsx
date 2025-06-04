import {
    Box,
    Button,
    createListCollection,
    Dialog,
    Editable,
    Flex,
    Heading,
    HStack,
    IconButton,
    Link,
    ListCollection,
    Portal,
    Select,
    Separator,
    SimpleGrid,
    Spacer,
    Switch,
    Text,
    VStack
} from "@chakra-ui/react";
import {useEffect, useState} from "react";
import {LuCheck, LuPencilLine, LuX} from "react-icons/lu";
import {FaPlus, FaTimes, FaTrash} from "react-icons/fa";
import {v4 as uuid} from 'uuid';
import {useNavigate} from "react-router-dom";
import {Category, SuggestedContentData} from "@/model";
import {toaster} from "@/components/ui";
import {useCategories} from "@/hooks";
import {Error} from "@/components/Util";
import {SuggestDataSkeleton} from "@/components/Suggest/SuggestDataSkeleton.tsx";
import {useSuggestedContent} from "@/hooks/useSuggestedContent.ts";

export function SuggestData() {
    const navigate = useNavigate()
    const {getCategories: {data: categories, isLoading, isError}} = useCategories()
    const {addSuggestedContent} = useSuggestedContent()

    const [category, setCategory] = useState<string>("New category...")
    const [terms, setTerms] = useState<Map<string, string>>(new Map<string, string>([[uuid(), "Term"]]))
    const [isNewCategory, setIsNewCategory] = useState<boolean>(false)

    const [open, setOpen] = useState<boolean>(false)

    const [categoriesCollection, setCategoriesCollection] = useState<ListCollection<Category> | null>(null)

    useEffect(() => {
        if (categories) {
            setCategoriesCollection(createListCollection({items: [...categories]}))
        }
    }, [categories]);

    const addTerm = () => {
        if (terms.size === 50) {
            toaster.create({
                type: "error",
                title: "Maximum of 50 terms per suggestion",
                description: "Add more when these get approved.",
            })
            return
        }

        setTerms(prevState => {
            return new Map([
                ...prevState,
                [uuid(), "Term"]
            ])
        })
    }

    const updateTerm = (id: string, newTerm: string) => {
        setTerms(prevState => {
            const newTerms = new Map(prevState)
            newTerms.set(id, newTerm)
            return newTerms
        })
    }

    const deleteTerm = (id: string) => {
        setTerms(prevState => {
            const newTerms = new Map(prevState)
            newTerms.delete(id)
            return newTerms
        })
    }

    const showErrorToast = (text: string) => {
        toaster.create({
            type: "error",
            title: text
        })
    }

    const checkContent = () => {
        if (category === "New category..." && isNewCategory) {
            showErrorToast("Category is not set")
            return
        }

        if (category === "New category..." && !isNewCategory) {
            showErrorToast("Category is not selected")
            return
        }

        if (category.length < 4) {
            showErrorToast("Category needs a minimum of 4 characters")
            return
        }

        if (category.length > 20) {
            showErrorToast("Category can have a maximum of 20 characters")
            return
        }

        if (terms.size < 1) {
            showErrorToast("Terms are not set")
            return
        }

        if (isNewCategory && terms.size < 5) {
            showErrorToast("For a new category, submit at least 5 terms")
            return
        }

        for (const value of terms.values()) {
            if (value === "Term") {
                showErrorToast("'Term' is not a valid entry")
                return
            }

            if (value.length < 4) {
                showErrorToast("A term needs a minimum of 4 characters")
                return
            }

            if (value.length > 20) {
                showErrorToast("A term can have a maximum of 20 characters")
                return
            }
        }

        setOpen(true)
    }

    const onSubmit = () => {
        const content: SuggestedContentData = {
            category,
            terms: Array.from(terms.values()),
            isNewCategory
        }

        addSuggestedContent.mutate(content, {
            onSuccess: () => {
                navigate('/')
                toaster.create({
                    type: "success",
                    title: "Content Submitted",
                    description: "Once it gets approved it will appear in the game!",
                    duration: 5000,
                })
            }
        })
    }

    if (isLoading) {
        return (
            <SuggestDataSkeleton/>
        )
    }

    if (isError || !categories) {
        return <Error text={"Error loading categories"}/>
    }

    return (
        <>
            <VStack maxW="500px" w="90%" flex={1}>
                <HStack justify="space-between" w="100%" mb={2}>
                    <Box flex={1}/>
                    <Heading size="3xl">Suggest Content</Heading>
                    <Flex flex={1} justify="end">
                        <IconButton variant="plain" mr="-10px" onClick={() => navigate("/")}>
                            <FaTimes/>
                        </IconButton>
                    </Flex>
                </HStack>
                <Text fontSize={"sm"} textAlign="justify" w="full">
                    Here you can suggest categories and terms that you would like to see in the game. Once they are
                    approved, you will see your content in the game! Add to an existing category using the dropdown, or
                    add
                    your own by setting the toggle from <span style={{fontStyle: "italic"}}>Existing</span> to
                    <span style={{fontStyle: "italic"}}> New</span>.
                </Text>
                <HStack mt={6} w="100%">
                    <Heading>Category</Heading>
                    <Spacer/>
                    <Text>{isNewCategory ? "New" : "Existing"}</Text>
                    <Switch.Root gap={0} checked={isNewCategory}
                                 onCheckedChange={(e) => setIsNewCategory(e.checked)}>
                        <Switch.HiddenInput/>
                        <Switch.Control>
                            <Switch.Thumb/>
                        </Switch.Control>
                        <Switch.Label/>
                    </Switch.Root>
                </HStack>
                <Box w="100%">
                    {isNewCategory ? (
                        <Editable.Root defaultValue={category}
                                       onValueCommit={(e) => setCategory(e.value)}>
                            <Editable.Preview/>
                            <Editable.Input/>
                            <Editable.Control>
                                <Editable.EditTrigger asChild>
                                    <IconButton variant="ghost" size="xs">
                                        <LuPencilLine/>
                                    </IconButton>
                                </Editable.EditTrigger>
                                <Editable.CancelTrigger asChild>
                                    <IconButton variant="outline" size="xs">
                                        <LuX/>
                                    </IconButton>
                                </Editable.CancelTrigger>
                                <Editable.SubmitTrigger asChild>
                                    <IconButton variant="outline" size="xs">
                                        <LuCheck/>
                                    </IconButton>
                                </Editable.SubmitTrigger>
                            </Editable.Control>
                        </Editable.Root>
                    ) : categoriesCollection ? (
                        <Select.Root size="sm" minW="170px" width="50%" collection={categoriesCollection}
                                     onValueChange={(e) => setCategory(e.value[0])}>
                            <Select.HiddenSelect/>
                            <Select.Label hidden>Select Category</Select.Label>
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
                                        {categoriesCollection.items.map((category, index) => (
                                            <Select.Item item={category} key={index}>
                                                {category.value}
                                                <Select.ItemIndicator/>
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select.Positioner>
                            </Portal>
                        </Select.Root>
                    ) : (
                        <></>
                    )}
                </Box>
                <Separator w="100%"/>
                <Heading w="100%" mt={4}>Terms</Heading>
                {Array.from(terms).map(([id, term]) => (
                    <HStack key={id} justify="space-between" w="100%">
                        <Editable.Root defaultValue={term} onValueCommit={(e) => updateTerm(id, e.value)}>
                            <Editable.Preview/>
                            <Editable.Input/>
                            <Editable.Control>
                                <Editable.EditTrigger asChild>
                                    <IconButton variant="ghost" size="xs">
                                        <LuPencilLine/>
                                    </IconButton>
                                </Editable.EditTrigger>
                                <Editable.CancelTrigger asChild>
                                    <IconButton variant="outline" size="xs">
                                        <LuX/>
                                    </IconButton>
                                </Editable.CancelTrigger>
                                <Editable.SubmitTrigger asChild>
                                    <IconButton variant="outline" size="xs">
                                        <LuCheck/>
                                    </IconButton>
                                </Editable.SubmitTrigger>
                            </Editable.Control>
                        </Editable.Root>
                        <IconButton size="xs" variant="outline"
                                    onClick={() => deleteTerm(id)}>
                            <FaTrash/>
                        </IconButton>
                    </HStack>
                ))}
                <HStack w="100%" justify="space-between">
                    <Link onClick={() => addTerm()}>
                        <Text fontSize="sm" ml={1}>New term...</Text>
                    </Link>
                    <IconButton size="xs" variant="outline"
                                onClick={addTerm}>
                        <FaPlus/>
                    </IconButton>
                </HStack>
                <Separator w="100%"/>
                <Button alignSelf="end" w="100px" mt={4}
                        onClick={checkContent}
                >Submit</Button>
            </VStack>
            <Dialog.Root lazyMount open={open} onOpenChange={(e) => setOpen(e.open)}>
                <Portal>
                    <Dialog.Backdrop/>
                    <Dialog.Positioner>
                        <Dialog.Content maxW="500px" w="90%">
                            <Dialog.Header>
                                <Dialog.Title>Submit Content?</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <Text>
                                    Are you sure you want to submit? Double check your content before submitting. It
                                    needs to be approved before you will see it in the game.
                                </Text>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <SimpleGrid w="100%" columns={2} gap={4}>
                                    <Dialog.ActionTrigger asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </Dialog.ActionTrigger>
                                    <Button onClick={onSubmit}>Submit</Button>
                                </SimpleGrid>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </>
    )
}