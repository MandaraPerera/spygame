import {Spinner, Text, VStack} from "@chakra-ui/react";

interface LoadingProps {
    text: string;
}

export function Loading({text}: LoadingProps) {
    return (
        <VStack flex="1" justify="center" gap="4" py="12" role="status">
            <Spinner size="lg" color="manila.300" borderWidth="3px"/>
            <Text color="fg.muted">{text}</Text>
        </VStack>
    )
}
