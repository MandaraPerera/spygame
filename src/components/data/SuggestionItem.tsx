import {Accordion, Badge, HStack, Text, VStack} from "@chakra-ui/react";
import type {Suggestion} from "@/model";
import {SuggestionReview} from "./SuggestionReview";

interface SuggestionItemProps {
    suggestion: Suggestion
}

function statusOf(suggestion: Suggestion): { label: string, color: string } {
    if (!suggestion.isValid) return {label: "Malformed", color: "red"}
    return suggestion.isNewCategory ? {label: "New", color: "green"} : {label: "Existing", color: "blue"}
}

// One row of the review queue. Its body only mounts once opened (the accordion is lazy).
export function SuggestionItem({suggestion}: SuggestionItemProps) {
    const status = statusOf(suggestion)

    return (
        <Accordion.Item value={suggestion.id} bg="bg.panel" rounded="panel" overflow="hidden">
            <Accordion.ItemTrigger px="4" py="3" cursor="pointer" focusVisibleRing="inside">
                <VStack align="start" gap={1} flex={1} minW={0}>
                    <HStack w="100%" minW={0}>
                        <Text fontWeight="semibold" truncate>{suggestion.category}</Text>
                        <Badge size="sm" variant="subtle" colorPalette={status.color} flexShrink={0}>{status.label}</Badge>
                    </HStack>
                    <Text textStyle="sm" color="fg.muted" w="100%" truncate>
                        {suggestion.terms.join(", ")}
                    </Text>
                </VStack>
                <Accordion.ItemIndicator/>
            </Accordion.ItemTrigger>

            <Accordion.ItemContent>
                <Accordion.ItemBody px="4" pt="1" pb="4">
                    <SuggestionReview suggestion={suggestion}/>
                </Accordion.ItemBody>
            </Accordion.ItemContent>
        </Accordion.Item>
    )
}
