import {Alert, Center} from "@chakra-ui/react";

interface ErrorProps {
    text: string;
}

export function Error({text}: ErrorProps) {
    return (
        <Center
            position="fixed"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            maxW="90%"
        >
            <Alert.Root status="error">
                <Alert.Indicator/>
                <Alert.Content>
                    <Alert.Title>Error</Alert.Title>
                    <Alert.Description>{text}</Alert.Description>
                </Alert.Content>
            </Alert.Root>
        </Center>
    )
}