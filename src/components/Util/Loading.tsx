import {Alert, Center, Spinner} from "@chakra-ui/react";

interface LoadingProps {
    text: string;
}

export function Loading({text}: LoadingProps) {
    return (
        <Center
            position="fixed"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            maxW="90%"
        >
            <Alert.Root status="info">
                <Alert.Indicator>
                    <Spinner size="sm"/>
                </Alert.Indicator>
                <Alert.Title>Loading</Alert.Title>
                <Alert.Description>{text}</Alert.Description>
            </Alert.Root>
        </Center>
    )
}