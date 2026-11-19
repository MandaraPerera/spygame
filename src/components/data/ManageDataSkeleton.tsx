import {Skeleton} from "@chakra-ui/react";
import {PageHeader, Screen} from "@/components/util";

export function ManageDataSkeleton() {
    return (
        <Screen header={<PageHeader title="Manage data" backTo="/"/>}>
            <Skeleton h="5" w="15rem" mt="2"/>
            <Skeleton h="4.5rem" rounded="panel"/>
            <Skeleton h="10.5rem" rounded="panel"/>
        </Screen>
    )
}
