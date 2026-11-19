import {Alert, Center, Spinner} from "@chakra-ui/react";

interface LoadingProps {
    text: string;
}

export function Loading({text}: LoadingProps) {
    return (
        <Center flex={1} w="90%" maxW="500px">
            <Alert.Root status="info">
                <Alert.Indicator>
                    <Spinner size="sm"/>
                </Alert.Indicator>
                <Alert.Content>
                    <Alert.Title>Loading</Alert.Title>
                    <Alert.Description>{text}</Alert.Description>
                </Alert.Content>
            </Alert.Root>
        </Center>
    )
}
