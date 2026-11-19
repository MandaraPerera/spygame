import {Button, Center, Dialog, HStack, IconButton, Portal, Text} from "@chakra-ui/react";
import {useContext} from "react";
import {toaster} from "@/components/ui";
import {MIN_SPIES} from "@/config";
import {SettingsContext} from "@/context";
import {maxSpies} from "@/utils";

interface SelectSpiesProps {
    open: boolean
    setOpen: (open: boolean) => void
}

export function SelectSpies({open, setOpen}: SelectSpiesProps) {
    const {amountOfPlayers, amountOfSpies, setAmountOfSpies} = useContext(SettingsContext);

    const incrementAmountOfSpies = () => {
        if (amountOfSpies >= maxSpies(amountOfPlayers)) {
            toaster.create({
                type: "error",
                title: "Maximum number of spies is half of the players.",
                duration: 3000
            })
            return
        }

        setAmountOfSpies(amountOfSpies + 1)
    }

    const decrementAmountOfSpies = () => {
        if (amountOfSpies <= MIN_SPIES) {
            toaster.create({
                type: "error",
                title: `Minimum number of spies is ${MIN_SPIES}.`,
                duration: 3000
            })
            return
        }

        setAmountOfSpies(amountOfSpies - 1)
    }

    return (
        <Dialog.Root lazyMount open={open} onOpenChange={(e) => setOpen(e.open)}>
            <Portal>
                <Dialog.Backdrop/>
                <Dialog.Positioner>
                    <Dialog.Content maxW="500px" w="90%">
                        <Dialog.Header>
                            <Dialog.Title>Spies</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Center>
                                <HStack gap={3} mb={4}>
                                    <IconButton variant="outline" fontSize="xl" aria-label="Remove a spy"
                                                onClick={decrementAmountOfSpies}
                                    >-</IconButton>
                                    <Text fontSize="xl" aria-live="polite">{amountOfSpies}</Text>
                                    <IconButton variant="outline" fontSize="xl" aria-label="Add a spy"
                                                onClick={incrementAmountOfSpies}
                                    >+</IconButton>
                                </HStack>
                            </Center>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button variant="outline" w="100%">
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
