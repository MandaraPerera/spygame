import {
    AbsoluteCenter,
    Accordion,
    Alert,
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
import {useState} from "react";
import {FaCheck, FaTimes} from "react-icons/fa";
import {toaster} from "@/components/ui";
import {ConfirmDialog} from "@/components/util";
import {useSuggestions} from "@/hooks";
import type {Suggestion} from "@/model";
import {formatDate} from "@/utils";

interface SuggestionItemProps {
    suggestion: Suggestion
}

function toMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Something went wrong. Please try again."
}

export function SuggestionItem({suggestion}: SuggestionItemProps) {
    const {approveSuggestion, denySuggestion} = useSuggestions()

    const [error, setError] = useState<string | null>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false)
    const [isDenyDialogOpen, setIsDenyDialogOpen] = useState<boolean>(false)
    const isBusy = approveSuggestion.isPending || denySuggestion.isPending

    const handleApprove = async () => {
        setError(null)

        try {
            await approveSuggestion.mutateAsync(suggestion)
            toaster.create({type: "success", title: "Suggestion approved", description: suggestion.category})
        } catch (approveError) {
            setError(toMessage(approveError))
        }
    }

    const handleDeny = async () => {
        setError(null)

        try {
            await denySuggestion.mutateAsync(suggestion)
            toaster.create({type: "info", title: "Suggestion denied", description: suggestion.category})
        } catch (denyError) {
            setError(toMessage(denyError))
        } finally {
            setIsDenyDialogOpen(false)
        }
    }

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
                            setIsDetailsOpen(true)
                        }}>Details</Button>
                    </AbsoluteCenter>
                </Box>

                <Accordion.ItemContent>
                    <Accordion.ItemBody py={2}>
                        {error ? (
                            <Alert.Root status="error" size="sm" mb={2}>
                                <Alert.Indicator/>
                                <Alert.Description>{error}</Alert.Description>
                            </Alert.Root>
                        ) : null}
                        {!suggestion.isValid ? (
                            <Text fontSize="sm" mb={2}>This suggestion is malformed and can only be denied.</Text>
                        ) : null}
                        <HStack>
                            <Button flex={1} size="sm" onClick={handleApprove}
                                    loading={approveSuggestion.isPending}
                                    disabled={isBusy || !suggestion.isValid}><FaCheck/>Approve</Button>
                            <Button flex={1} size="sm" onClick={() => setIsDenyDialogOpen(true)}
                                    disabled={isBusy}><FaTimes/>Deny</Button>
                        </HStack>
                    </Accordion.ItemBody>
                </Accordion.ItemContent>
            </Accordion.Item>

            <ConfirmDialog open={isDenyDialogOpen} setOpen={setIsDenyDialogOpen}
                           title="Deny suggestion?"
                           text={`"${suggestion.category}" and its ${suggestion.terms.length} terms will be deleted. This cannot be undone.`}
                           confirmLabel="Deny" isDestructive
                           isPending={denySuggestion.isPending}
                           onConfirm={handleDeny}/>

            <Dialog.Root lazyMount open={isDetailsOpen} onOpenChange={(e) => setIsDetailsOpen(e.open)}
                         placement="center">
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
