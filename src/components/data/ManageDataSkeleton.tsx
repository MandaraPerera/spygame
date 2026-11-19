import {
    AspectRatio,
    Box,
    Flex,
    Heading,
    HStack,
    IconButton,
    SimpleGrid,
    Skeleton,
    Text,
    VStack
} from "@chakra-ui/react";
import {FaTimes} from "react-icons/fa";
import {useNavigate} from "react-router-dom";

export function ManageDataSkeleton() {
    const navigate = useNavigate();

    return (
        <VStack maxW="500px" w="90%" flex={1}>
            <HStack justify="space-between" w="100%" mb={4}>
                <Box flex={1}/>
                <Heading size="3xl">Manage Data</Heading>
                <Flex flex={1} justify="end">
                    <IconButton variant="plain" mr="-10px" onClick={() => navigate("/")}>
                        <FaTimes/>
                    </IconButton>
                </Flex>
            </HStack>

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