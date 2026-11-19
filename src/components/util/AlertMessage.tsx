import {Button, Center, Heading, Icon, Stack, Text, VStack} from "@chakra-ui/react";
import {LuCircleAlert, LuInfo, LuTriangleAlert} from "react-icons/lu";

interface AlertMessageProps {
    status: "error" | "info" | "warning"
    title: string
    text: string
    action?: {
        label: string
        onClick: () => void
    }
}

const STATUS_STYLES = {
    error: {icon: <LuCircleAlert/>, palette: "red"},
    warning: {icon: <LuTriangleAlert/>, palette: "orange"},
    info: {icon: <LuInfo/>, palette: "manila"}
} as const

// A whole-screen message for an empty, failed or blocked state, with the way forward as its one button.
export function AlertMessage({status, title, text, action}: AlertMessageProps) {
    const {icon, palette} = STATUS_STYLES[status]

    return (
        <VStack flex="1" justify="center" gap="5" py="12" textAlign="center" colorPalette={palette}
                role={status === "error" ? "alert" : "status"}>
            <Center boxSize="14" rounded="full" bg="colorPalette.subtle" color="colorPalette.fg">
                <Icon boxSize="6" aria-hidden>{icon}</Icon>
            </Center>
            <Stack gap="2" maxW="20rem">
                <Heading as="h2" textStyle="title">{title}</Heading>
                <Text color="fg.muted">{text}</Text>
            </Stack>
            {action ? (
                <Button variant="outline" colorPalette="gray" onClick={action.onClick}>
                    {action.label}
                </Button>
            ) : null}
        </VStack>
    )
}
