import {AspectRatio, Button, Heading, SimpleGrid, Text, VStack} from "@chakra-ui/react";
import {useContext} from "react";
import {useNavigate} from "react-router-dom";
import {ManageDataSkeleton} from "@/components/data";
import {AlertMessage, PageHeader} from "@/components/util";
import {AuthContext} from "@/context";
import {useStats} from "@/hooks";
import {pluralize} from "@/utils";

export function ManageData() {
    const {user} = useContext(AuthContext);
    const {data: stats, isPending, isError, refetch} = useStats();
    const navigate = useNavigate();

    if (isPending) {
        return <ManageDataSkeleton/>
    }

    if (isError) {
        return (
            <AlertMessage status="error" title="Error" text="Error loading the statistics"
                          action={{label: "Try again", onClick: () => refetch()}}/>
        )
    }

    const tiles = [
        {count: stats.categories, label: pluralize(stats.categories, "Category", "Categories"), to: "/categories"},
        {count: stats.terms, label: pluralize(stats.terms, "Term", "Terms"), to: "/terms"},
        {count: stats.suggestions, label: pluralize(stats.suggestions, "Suggestion", "Suggestions"), to: "/suggestions"},
        {count: stats.logs, label: pluralize(stats.logs, "Log", "Logs"), to: "/logs"}
    ]

    return (
        <VStack maxW="500px" w="90%" flex={1}>
            <PageHeader title="Manage Data" closeTo="/" mb={4}/>

            <Text textAlign="center" w="100%">Signed in as</Text>
            <Text textAlign="center" mb={8} w="100%">{user?.email}</Text>

            <SimpleGrid columns={2} gap={4} w="100%">
                {tiles.map((tile) => (
                    <AspectRatio ratio={1} key={tile.to}>
                        <Button onClick={() => navigate(tile.to)}>
                            <VStack>
                                <Heading size="3xl">{tile.count}</Heading>
                                <Text textStyle="xl">{tile.label}</Text>
                            </VStack>
                        </Button>
                    </AspectRatio>
                ))}
            </SimpleGrid>
        </VStack>
    )
}
