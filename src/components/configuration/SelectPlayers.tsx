import {Button, Center, Dialog, HStack, IconButton, Portal, Text} from "@chakra-ui/react";
import {useContext} from "react";
import {toaster} from "@/components/ui";
import {MAX_PLAYERS, MIN_PLAYERS} from "@/config";
import {SettingsContext} from "@/context";
import {maxSpies} from "@/utils";

interface SelectPlayersProps {
    open: boolean
    setOpen: (open: boolean) => void
}

export function SelectPlayers({open, setOpen}: SelectPlayersProps) {
    const {amountOfPlayers, setAmountOfPlayers, amountOfSpies} = useContext(SettingsContext);

    const incrementAmountOfPlayers = () => {
        if (amountOfPlayers >= MAX_PLAYERS) {
            toaster.create({
                type: "error",
                title: `Maximum number of players is ${MAX_PLAYERS}.`,
                duration: 3000
            })
            return
        }

        setAmountOfPlayers(amountOfPlayers + 1)
    }

    const decrementAmountOfPlayers = () => {
        if (amountOfPlayers <= MIN_PLAYERS) {
            toaster.create({
                type: "error",
                title: `Minimum number of players is ${MIN_PLAYERS}.`,
                duration: 3000
            })
            return
        }

        const nextMaxSpies = maxSpies(amountOfPlayers - 1)
        setAmountOfPlayers(amountOfPlayers - 1)

        if (amountOfSpies > nextMaxSpies) {
            toaster.create({
                type: "info",
                title: `Spies lowered to ${nextMaxSpies}.`,
                description: "There can be at most one spy for every two players.",
                duration: 3000
            })
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
                                    <IconButton variant="outline" fontSize="xl" aria-label="Remove a player"
                                                onClick={decrementAmountOfPlayers}
                                    >-</IconButton>
                                    <Text fontSize="xl" aria-live="polite">{amountOfPlayers}</Text>
                                    <IconButton variant="outline" fontSize="xl" aria-label="Add a player"
                                                onClick={incrementAmountOfPlayers}
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
