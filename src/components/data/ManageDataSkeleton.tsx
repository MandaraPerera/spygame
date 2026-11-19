import {AspectRatio, SimpleGrid, Skeleton, Text, VStack} from "@chakra-ui/react";
import {PageHeader} from "@/components/util";

export function ManageDataSkeleton() {
    return (
        <VStack maxW="500px" w="90%" flex={1}>
            <PageHeader title="Manage Data" closeTo="/" mb={4}/>

            <Text textAlign="center" w="100%">Signed in as</Text>
            <Skeleton w="250px" h="5" mb={8}/>

            <SimpleGrid columns={2} gap={4} w="100%">
                {Array.from({length: 4}, (_, index) => (
                    <AspectRatio ratio={1} key={index}>
                        <Skeleton w="100%"/>
                    </AspectRatio>
                ))}
            </SimpleGrid>
        </VStack>
    )
}
