import {Button, Skeleton, Text, VStack} from "@chakra-ui/react";
import {useContext} from "react";
import {LogItem} from "@/components/data";
import {AlertMessage, PageHeader} from "@/components/util";
import {AuthContext} from "@/context";
import {useLogs} from "@/hooks";

export function Logs() {
    const {user} = useContext(AuthContext)
    const {data, isPending, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage} = useLogs()
    const logs = data?.pages.flatMap((page) => page.logs) ?? []

    const renderContent = () => {
        if (isError) {
            return (
                <AlertMessage status="error" title="Error" text="The logs could not be loaded."
                              action={{label: "Try again", onClick: () => refetch()}}/>
            )
        }

        if (isPending) {
            return Array.from({length: 4}, (_, index) => <Skeleton key={index} w="100%" h="88px"/>)
        }

        if (logs.length === 0) {
            return <Text>Approvals, denials and edits will be listed here.</Text>
        }

        return (
            <>
                {logs.map((log) => <LogItem key={log.id} log={log} currentUserId={user?.uid ?? null}/>)}
                {hasNextPage ? (
                    <Button w="100%" mt={2} variant="outline" loading={isFetchingNextPage}
                            onClick={() => fetchNextPage()}>
                        Load more
                    </Button>
                ) : null}
            </>
        )
    }

    return (
        <VStack maxW="500px" w="90%" flex={1} gap={2}>
            <PageHeader title="Logs" backTo="/manage-data"/>
            {renderContent()}
        </VStack>
    )
}
