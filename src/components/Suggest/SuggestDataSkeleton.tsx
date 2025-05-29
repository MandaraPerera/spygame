import {Box, Flex, Heading, HStack, IconButton, Separator, Skeleton, Text, VStack} from "@chakra-ui/react";
import {FaTimes} from "react-icons/fa";
import {useNavigate} from "react-router-dom";

export function SuggestDataSkeleton() {
    const navigate = useNavigate();

    return (
        <VStack maxW="500px" w="90%" flex={1}>
            <HStack justify="space-between" w="100%" mb={2}>
                <Box flex={1}/>
                <Heading size="3xl">Suggest Content</Heading>
                <Flex flex={1} justify="end">
                    <IconButton variant="plain" mr="-10px" onClick={() => navigate("/")}>
                        <FaTimes/>
                    </IconButton>
                </Flex>
            </HStack>
            <Text fontSize={"sm"} textAlign="justify" w="full">
                Here you can suggest categories and terms that you would like to see in the game. Once they are
                approved, you will see your content in the game! If you'd like to add to an existing category,
                select it from the dropdown.
            </Text>
            <HStack w="100%" mt={6} justify="space-between">
                <Heading>Category</Heading>
                <Skeleton w="80px" h="5"/>
            </HStack>
            <Skeleton w="110px" h="5" mt={2} alignSelf="start"/>
            <Separator w="100%" mt={2}/>
            <Heading w="100%" mt={4}>Terms</Heading>
            <HStack w="100%" justify="space-between">
                <Skeleton w="85px" h="5"/>
                <Skeleton w="8" h="8"/>
            </HStack>
            <HStack w="100%" mt={1} justify="space-between">
                <Skeleton w="85px" h="5"/>
                <Skeleton w="8" h="8"/>
            </HStack>
            <Separator w="100%"/>
            <Skeleton w="100px" mt={4} h="10" alignSelf="end"/>
        </VStack>
    )
}