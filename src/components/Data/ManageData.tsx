import {Box, Flex, Heading, HStack, IconButton, VStack} from "@chakra-ui/react";
import {FaTimes} from "react-icons/fa";
import {useNavigate} from "react-router-dom";

export function ManageData() {
    const navigate = useNavigate();
    
    return (
        <VStack maxW="500px" w="90%" flex={1}>
            <HStack justify="space-between" w="100%" mb={12}>
                <Box flex={1}/>
                <Heading size="3xl">Manage Data</Heading>
                <Flex flex={1} justify="end">
                    <IconButton variant="plain" mr="-10px" onClick={() => navigate("/")}>
                        <FaTimes/>
                    </IconButton>
                </Flex>
            </HStack>
        </VStack>
    )
}