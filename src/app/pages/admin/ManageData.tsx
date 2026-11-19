import {Badge, Text} from "@chakra-ui/react";
import {useContext} from "react";
import {LuFolder, LuHistory, LuInbox, LuList} from "react-icons/lu";
import {ManageDataSkeleton} from "@/components/data";
import {AlertMessage, ListPanel, ListRow, PageHeader, Screen} from "@/components/util";
import {AuthContext} from "@/context";
import {useStats} from "@/hooks";
import {pluralize} from "@/utils";

interface CountProps {
    count: number
}

function Count({count}: CountProps) {
    return <Text color="fg.muted" fontVariantNumeric="tabular-nums">{count}</Text>
}

export function ManageData() {
    const {user} = useContext(AuthContext);
    const {data: stats, isPending, isError, refetch} = useStats();
    const header = <PageHeader title="Manage data" backTo="/"/>

    if (isPending) {
        return <ManageDataSkeleton/>
    }

    if (isError) {
        return (
            <Screen header={header}>
                <AlertMessage status="error" title="Couldn't load the counts" text="Check your connection and try again."
                              action={{label: "Try again", onClick: () => refetch()}}/>
            </Screen>
        )
    }

    const hasSuggestions = stats.suggestions > 0

    return (
        <Screen header={header}>
            <Text color="fg.muted" pt="2" truncate>Signed in as {user?.email}</Text>

            <ListPanel>
                <ListRow icon={<LuInbox/>} label="Suggestions" to="/suggestions"
                         description={hasSuggestions
                             ? `${stats.suggestions} ${pluralize(stats.suggestions, "suggestion", "suggestions")} to review`
                             : "Nothing to review"}
                         end={hasSuggestions ? (
                             <Badge colorPalette="manila" variant="solid" size="lg" rounded="full">
                                 {stats.suggestions}
                             </Badge>
                         ) : null}/>
            </ListPanel>

            <ListPanel>
                <ListRow icon={<LuFolder/>} label="Categories" to="/categories" end={<Count count={stats.categories}/>}/>
                <ListRow icon={<LuList/>} label="Terms" to="/terms" end={<Count count={stats.terms}/>}/>
                <ListRow icon={<LuHistory/>} label="Logs" to="/logs" end={<Count count={stats.logs}/>}/>
            </ListPanel>
        </Screen>
    )
}
