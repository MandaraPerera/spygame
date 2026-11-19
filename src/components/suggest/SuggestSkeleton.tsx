import {Heading, HStack, Skeleton, Stack} from "@chakra-ui/react";
import {PageHeader, Screen} from "@/components/util";
import {SuggestIntro} from "./SuggestIntro";

export function SuggestSkeleton() {
    return (
        <Screen header={<PageHeader title="Suggest words" backTo="/"/>}>
            <SuggestIntro/>
            <Stack gap="3">
                <Heading as="h2" textStyle="title">Category</Heading>
                <Skeleton h="11" rounded="l2"/>
                <Skeleton h="11" rounded="l2"/>
            </Stack>
            <Stack gap="3">
                <Heading as="h2" textStyle="title">Words</Heading>
                <HStack gap="1">
                    <Skeleton flex="1" h="11" rounded="l2"/>
                    <Skeleton boxSize="11" rounded="l2"/>
                </HStack>
                <Skeleton w="8rem" h="11" rounded="l2"/>
            </Stack>
        </Screen>
    )
}
