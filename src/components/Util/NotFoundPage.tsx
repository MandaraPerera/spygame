import {Button, Heading, Text, VStack} from "@chakra-ui/react";
import {useNavigate} from "react-router-dom";

export function NotFoundPage() {
    const navigate = useNavigate()

    return (
        <VStack maxW="500px" w="90%" flex={1}>
            <Heading size="3xl" mb={12}>Spy Game</Heading>
            <Text textAlign="center" mb={4} fontStyle="italic" fontSize="xl">
                404
            </Text>
            <Text textAlign="center" mb={12}>
                We couldn't find the requested page. Check the url or head back to the homepage.
            </Text>
            <Button px={8} onClick={() => navigate('/')}>
                Back to home
            </Button>
        </VStack>
    )
}