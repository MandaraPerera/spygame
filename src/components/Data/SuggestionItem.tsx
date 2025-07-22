import {Accordion, Badge, Button, Dialog, HStack, List, Portal, Text, VStack} from "@chakra-ui/react";
import {FaCheck, FaTimes} from "react-icons/fa";
import {useState} from "react";
import {Suggestion} from "@/model";
import {formatDate} from "@/util";

interface SuggestionItemProps {
    suggestion: Suggestion
}

export function SuggestionItem({suggestion}: SuggestionItemProps) {
    const [open, setOpen] = useState<boolean>(false)

    return (
        <>
            <Accordion.Item value={suggestion.id} bgColor="gray.900" mb={2}>
                <Accordion.ItemTrigger justifyContent="space-between">
                    <VStack align="start" gap={1} w="60%">
                        <Text fontSize="sm" w="100%" truncate>
                            {suggestion.category}{suggestion.isNewCategory ? " (New)" : ""}
                        </Text>
                        <Text fontSize="sm" w="100%" truncate>
                            {suggestion.terms.join(", ")}
                        </Text>
                    </VStack>
                    <Button size="sm" w="75px" onClick={(e) => {
                        e.stopPropagation()
                        setOpen(true)
                    }}>Details</Button>
                </Accordion.ItemTrigger>

                <Accordion.ItemContent>
                    <Accordion.ItemBody py={2}>
                        <HStack>
                            <Button flex={1} size="sm"><FaCheck/>Approve</Button>
                            <Button flex={1} size="sm"><FaTimes/>Deny</Button>
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