import {
    Accordion,
    Box,
    Button,
    Flex,
    Heading,
    HStack,
    IconButton,
    SimpleGrid,
    Skeleton,
    Text,
    VStack
} from "@chakra-ui/react";
import {useNavigate} from "react-router-dom";
import {FaArrowLeftLong} from "react-icons/fa6";
import {useState} from "react";
import {Error, ProtectedRoute} from "@/components/Util";
import {useSuggestionsRealtime} from "@/hooks";
import {SuggestionItem} from "@/components/Data/SuggestionItem.tsx";

export function Suggestions() {
    const navigate = useNavigate();
    const {
        getSuggestionsPaginated: {
            data,
            isPending,
            isError,
            fetchNextPage,
            hasNextPage,
            isFetchingNextPage
        }
    } = useSuggestionsRealtime()

    const suggestions = data?.pages.flatMap((page) => page.suggestions) ?? []
    const [value, setValue] = useState<string[]>([])

    return (
        <ProtectedRoute>
            <VStack maxW="500px" w="90%" flex={1}>
                <HStack justify="space-between" w="100%" mb={12}>
                    <Flex flex={1} justify="start">
                        <IconButton variant="plain" ml="-10px" onClick={() => navigate("/manage-data")}>
                            <FaArrowLeftLong/>
                        </IconButton>
                    </Flex>
                    <Heading size="3xl">Suggestions</Heading>
                    <Box flex={1}/>
                </HStack>
                {isPending || !suggestions ? (
                    isError ?
                        <Error text="Something went wrong."/> :
                        <SimpleGrid>
                            {Array.from({length: 4}, (_, index) => (
                                <Skeleton key={index} w="100%" h="68px" mb={2}/>
                            ))}
                        </SimpleGrid>
                ) : (
                    <>
                        {suggestions.length === 0 ? (
                            <Text>There are no suggestions to be reviewed.</Text>
                        ) : (
                            <Accordion.Root collapsible variant="subtle" value={value} spaceY={2}
                                            onValueChange={(e) => setValue(e.value)}>
                                {suggestions.map((suggestion, index) => (
                                    <SuggestionItem suggestion={suggestion} key={index}/>
                                ))}
                            </Accordion.Root>
                        )}
                        {hasNextPage ? (
                            <Button w="100%" mt={2} loading={isFetchingNextPage}
                                    onClick={() => fetchNextPage()}>
                                Load More
                            </Button>
                        ) : (
                            <></>
                        )}
                    </>
                )}
            </VStack>
        </ProtectedRoute>
    )
}