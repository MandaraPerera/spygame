import {Accordion, Button, Skeleton, Stack} from "@chakra-ui/react";
import {useState} from "react";
import {SuggestionItem} from "@/components/data";
import {AlertMessage, PageHeader, Screen} from "@/components/util";
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
                <AlertMessage status="error" title="Couldn't load the suggestions" text="Check your connection and try again."
                              action={{label: "Try again", onClick: () => refetch()}}/>
            )
        }

        if (isPending) {
            return (
                <Stack gap="2">
                    {Array.from({length: 4}, (_, index) => <Skeleton key={index} h="4.5rem" rounded="panel"/>)}
                </Stack>
            )
        }

        if (suggestions.length === 0) {
            return <AlertMessage status="info" title="All caught up" text="There are no suggestions to be reviewed."/>
        }

        return (
            <>
                <Accordion.Root collapsible lazyMount variant="plain" value={value} spaceY="2" w="100%" pt="2"
                                onValueChange={(e) => setValue(e.value)}>
                    {suggestions.map((suggestion) => (
                        <SuggestionItem suggestion={suggestion} key={suggestion.id}/>
                    ))}
                </Accordion.Root>
                {hasNextPage ? (
                    <Button variant="outline" mt="2" loading={isFetchingNextPage}
                            onClick={() => fetchNextPage()}>
                        Load more
                    </Button>
                ) : null}
            </>
        )
    }

    return (
        <Screen header={<PageHeader title="Suggestions" backTo="/manage-data"/>}>
            {renderContent()}
        </Screen>
    )
}
