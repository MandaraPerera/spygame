import {Accordion, Button, SimpleGrid, Skeleton, Text, VStack} from "@chakra-ui/react";
import {useState} from "react";
import {SuggestionItem} from "@/components/data";
import {AlertMessage, PageHeader} from "@/components/util";
import {useSuggestionsRealtime} from "@/hooks";

export function Suggestions() {
    const {
        getSuggestionsPaginated: {
            data,
            isPending,
            isError,
            refetch,
            fetchNextPage,
            hasNextPage,
            isFetchingNextPage
        }
    } = useSuggestionsRealtime()

    const suggestions = data?.pages.flatMap((page) => page.suggestions) ?? []
    const [value, setValue] = useState<string[]>([])

    const renderContent = () => {
        if (isError) {
            return (
                <AlertMessage status="error" title="Error" text="The suggestions could not be loaded."
                              action={{label: "Try again", onClick: () => refetch()}}/>
            )
        }

        if (isPending) {
            return (
                <SimpleGrid w="100%">
                    {Array.from({length: 4}, (_, index) => (
                        <Skeleton key={index} w="100%" h="68px" mb={2}/>
                    ))}
                </SimpleGrid>
            )
        }

        if (suggestions.length === 0) {
            return <Text>There are no suggestions to be reviewed.</Text>
        }

        return (
            <>
                <Accordion.Root collapsible variant="subtle" value={value} spaceY={2} w="100%"
                                onValueChange={(e) => setValue(e.value)}>
                    {suggestions.map((suggestion) => (
                        <SuggestionItem suggestion={suggestion} key={suggestion.id}/>
                    ))}
                </Accordion.Root>
                {hasNextPage ? (
                    <Button w="100%" mt={2} loading={isFetchingNextPage}
                            onClick={() => fetchNextPage()}>
                        Load More
                    </Button>
                ) : null}
            </>
        )
    }

    return (
        <VStack maxW="500px" w="90%" flex={1}>
            <PageHeader title="Suggestions" backTo="/manage-data"/>
            {renderContent()}
        </VStack>
    )
}
