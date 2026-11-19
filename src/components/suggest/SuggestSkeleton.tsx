import {Heading, HStack, Separator, Skeleton, VStack} from "@chakra-ui/react";
import {PageHeader} from "@/components/util";
import {SuggestIntro} from "./SuggestIntro";

export function SuggestSkeleton() {
    return (
        <VStack maxW="500px" w="90%" flex={1}>
            <PageHeader title="Suggest Content" closeTo="/" mb={2}/>
            <SuggestIntro/>
            <HStack w="100%" mt={6} justify="space-between">
                <Heading>Category</Heading>
                <Skeleton w="110px" h="5"/>
            </HStack>
            <Skeleton minW="170px" width="50%" h="9" alignSelf="start"/>
            <Separator w="100%"/>
            <Heading w="100%" mt={4}>Terms</Heading>
            <HStack w="100%" justify="space-between">
                <Skeleton flex={1} h="10"/>
                <Skeleton w="10" h="10"/>
            </HStack>
            <Skeleton w="120px" h="8" alignSelf="start"/>
            <Separator w="100%"/>
            <Skeleton w="100px" mt={4} h="10" alignSelf="end"/>
        </VStack>
    )
}
