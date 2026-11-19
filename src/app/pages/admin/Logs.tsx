import {Button, Skeleton, Stack} from "@chakra-ui/react";
import {useContext} from "react";
import {LogItem} from "@/components/data";
import {AlertMessage, ListPanel, PageHeader, Screen} from "@/components/util";
import {AuthContext} from "@/context";
import {useLogs} from "@/hooks";

export function Logs() {
    const {user} = useContext(AuthContext)
    const {data, isPending, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage} = useLogs()
    const logs = data?.pages.flatMap((page) => page.logs) ?? []

    const renderContent = () => {
        if (isError) {
            return (
                <AlertMessage status="error" title="Couldn't load the logs" text="Check your connection and try again."
                              action={{label: "Try again", onClick: () => refetch()}}/>
            )
        }

        if (isPending) {
            return <Skeleton h="24rem" rounded="panel"/>
        }

        if (logs.length === 0) {
            return <AlertMessage status="info" title="No logs yet" text="Approvals, denials and edits will be listed here."/>
        }

        return (
            <Stack gap="3" pt="2">
                <ListPanel>
                    {logs.map((log) => <LogItem key={log.id} log={log} currentUserId={user?.uid ?? null}/>)}
                </ListPanel>
                {hasNextPage ? (
                    <Button variant="outline" loading={isFetchingNextPage}
                            onClick={() => fetchNextPage()}>
                        Load more
                    </Button>
                ) : null}
            </Stack>
        )
    }

    return (
        <Screen header={<PageHeader title="Logs" backTo="/manage-data"/>}>
            {renderContent()}
        </Screen>
    )
}
