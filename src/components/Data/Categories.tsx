import {Box, Flex, Heading, HStack, IconButton, VStack} from "@chakra-ui/react";
import {useNavigate} from "react-router-dom";
import {FaArrowLeftLong} from "react-icons/fa6";
import {ProtectedRoute} from "@/components/Util";

export function Categories() {
    const navigate = useNavigate();

    return (
        <ProtectedRoute>
            <VStack maxW="500px" w="90%" flex={1}>
                <HStack justify="space-between" w="100%" mb={12}>
                    <Flex flex={1} justify="start">
                        <IconButton variant="plain" ml="-10px" onClick={() => navigate("/manage-data")}>
                            <FaArrowLeftLong/>
                        </IconButton>
                    </Flex>
                    <Heading size="3xl">Categories</Heading>
                    <Box flex={1}/>
                </HStack>
            </VStack>
        </ProtectedRoute>
    )
}