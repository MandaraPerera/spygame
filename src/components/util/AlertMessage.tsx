import {Alert, Button, Center} from "@chakra-ui/react";

interface AlertMessageProps {
    status: "error" | "info" | "warning"
    title: string
    text: string
    action?: {
        label: string
        onClick: () => void
    }
}

export function AlertMessage({status, title, text, action}: AlertMessageProps) {
    return (
        <Center flex={1} w="90%" maxW="500px">
            <Alert.Root status={status} alignItems="center">
                <Alert.Indicator/>
                <Alert.Content>
                    <Alert.Title>{title}</Alert.Title>
                    <Alert.Description>{text}</Alert.Description>
                </Alert.Content>
                {action ? (
                    <Button size="sm" variant="outline" onClick={action.onClick}>
                        {action.label}
                    </Button>
                ) : null}
            </Alert.Root>
        </Center>
    )
}
