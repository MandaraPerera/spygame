import {
    AbsoluteCenter,
    Accordion,
    Badge,
    Box,
    Button,
    Dialog,
    HStack,
    List,
    Portal,
    Text,
    VStack
} from "@chakra-ui/react";
import {FaCheck, FaTimes} from "react-icons/fa";
import {useState} from "react";
import {CategoryData, Suggestion} from "@/model";
import {formatDate} from "@/util";
import {useCategories, useSuggestions, useTerms} from "@/hooks";
import {Error} from "@/components/Util";

interface SuggestionItemProps {
    suggestion: Suggestion
}

export function SuggestionItem({suggestion}: SuggestionItemProps) {
    const {addCategory, getCategoryIdByName} = useCategories()
    const {addTerm} = useTerms()
    const {removeSuggestion} = useSuggestions()

    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [open, setOpen] = useState<boolean>(false)

    const handleApprove = async () => {
        setLoading(true)

        if (suggestion.isNewCategory) {
            const categoryData: CategoryData = {
                value: suggestion.category,
                isOriginal: false
            }

            await addCategory.mutateAsync(categoryData, {
                onSuccess: async (newCategory) => {
                    try {
                        for (const term of suggestion.terms) {
                            const termData = {
                                value: term,
                                categoryId: newCategory.id,
                                isOriginal: false
                            }

                            await addTerm.mutateAsync(termData)
                        }
                    } catch (e) {
                        setError((e as Error).message)
                    } finally {
                        await removeSuggestion.mutateAsync(suggestion.id)
                        setLoading(false)
                    }
                }
            })
        } else {
            const categoryId = await getCategoryIdByName(suggestion.category)
            if (!categoryId) {
                setError("Existing category not found")
                setLoading(false)
                return
            }

            try {
                for (const term of suggestion.terms) {
                    const termData = {
                        value: term,
                        categoryId: categoryId,
                        isOriginal: false
                    }

                    await addTerm.mutateAsync(termData)
                }
            } catch (e) {
                setError((e as Error).message)
            } finally {
                await removeSuggestion.mutateAsync(suggestion.id)
                setLoading(false)
            }
        }
    }

    const handleDeny = async () => {
        await removeSuggestion.mutateAsync(suggestion.id)
    }

    //TODO: add logs
    //TODO: confirmation when denying/approving
    //TODO: toaster messages

    if (error) return <Error text="Something went wrong. Please try again."/>

    return (
        <>
            <Accordion.Item value={suggestion.id} bgColor="gray.900">
                <Box position="relative">
                    <Accordion.ItemTrigger justifyContent="space-between">
                        <VStack align="start" gap={1} w="60%">
                            <Text fontSize="sm" w="100%" truncate>
                                {suggestion.category}{suggestion.isNewCategory ? " (New)" : ""}
                            </Text>
                            <Text fontSize="sm" fontWeight="light" w="100%" truncate>
                                {suggestion.terms.join(", ")}
                            </Text>
                        </VStack>
                    </Accordion.ItemTrigger>
                    <AbsoluteCenter axis="vertical" insetEnd={4}>
                        <Button size="sm" w="75px" onClick={(e) => {
                            e.stopPropagation()
                            setOpen(true)
                        }}>Details</Button>
                    </AbsoluteCenter>
                </Box>

                <Accordion.ItemContent>
                    <Accordion.ItemBody py={2}>
                        <HStack>
                            <Button flex={1} size="sm" onClick={handleApprove}
                                    loading={loading}><FaCheck/>Approve</Button>
                            <Button flex={1} size="sm" onClick={handleDeny} loading={loading}><FaTimes/>Deny</Button>
                        </HStack>
                    </Accordion.ItemBody>
                </Accordion.ItemContent>
            </Accordion.Item>

            <Dialog.Root lazyMount open={open} onOpenChange={(e) => setOpen(e.open)} placement="center">
                <Portal>
                    <Dialog.Backdrop/>
                    <Dialog.Positioner>
                        <Dialog.Content maxW="500px" w="90%">
                            <Dialog.Header>
                                <Dialog.Title>
                                    <HStack>
                                        {suggestion.category}
                                        <Badge colorPalette={suggestion.isNewCategory ? "green" : "blue"}>
                                            {suggestion.isNewCategory ? "New" : "Existing"}</Badge>
                                    </HStack>
                                    <Text fontSize="sm" fontWeight="light">{formatDate(suggestion.timestamp)}</Text>
                                </Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <List.Root as="ol" pl={4.5}>
                                    {suggestion.terms.map((term, index) => (
                                        <List.Item key={index} fontSize="md" pl={1}>{term}</List.Item>
                                    ))}
                                </List.Root>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Dialog.ActionTrigger asChild>
                                    <Button variant="solid" w="100%">
                                        Close
                                    </Button>
                                </Dialog.ActionTrigger>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </>
    )
}