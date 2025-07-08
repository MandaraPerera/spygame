import {useContext} from "react";
import {Button, Center, Dialog, HStack, IconButton, Portal, Text} from "@chakra-ui/react";
import {toaster} from "@/components/ui";
import {SettingsContext} from "@/context";

interface SelectPlayersProps {
    open: boolean
    setOpen: (open: boolean) => void
}

export function SelectPlayers({open, setOpen}: SelectPlayersProps) {
    const {amountOfPlayers, setAmountOfPlayers} = useContext(SettingsContext);

    const incrementAmountOfPlayers = () => {
        if (amountOfPlayers >= 10) {
            toaster.create({
                type: "error",
                title: "Maximum number of players is 10.",
                duration: 3000
            })
        } else {
            setAmountOfPlayers(amountOfPlayers + 1)
        }
    }

    const decrementAmountOfPlayers = () => {
        if (amountOfPlayers <= 3) {
            toaster.create({
                type: "error",
                title: "Minimum number of players is 3.",
                duration: 3000
            })
        } else {
            setAmountOfPlayers(amountOfPlayers - 1)
        }
    }

    return (
        <Dialog.Root lazyMount open={open} onOpenChange={(e) => setOpen(e.open)}>
            <Portal>
                <Dialog.Backdrop/>
                <Dialog.Positioner>
                    <Dialog.Content maxW="500px" w="90%">
                        <Dialog.Header>
                            <Dialog.Title>Players</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Center>
                                <HStack gap={3} mb={4}>
                                    <IconButton variant="outline" fontSize="xl"
                                                onClick={() => decrementAmountOfPlayers()}
                                    >-</IconButton>
                                    <Text fontSize="xl">{amountOfPlayers}</Text>
                                    <IconButton variant="outline" fontSize="xl"
                                                onClick={() => incrementAmountOfPlayers()}
                                    >+</IconButton>
                                </HStack>
                            </Center>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button variant="solid" w="100%">
                                    Close
                                </Button>
                            </Dialog.ActionTrigger>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}