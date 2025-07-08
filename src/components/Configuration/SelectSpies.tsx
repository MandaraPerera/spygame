import {useContext} from "react";
import {Button, Center, Dialog, HStack, IconButton, Portal, Text} from "@chakra-ui/react";
import {toaster} from "@/components/ui";
import {SettingsContext} from "@/context";

interface SelectSpiesProps {
    open: boolean
    setOpen: (open: boolean) => void
}

export function SelectSpies({open, setOpen}: SelectSpiesProps) {
    const {amountOfPlayers, amountOfSpies, setAmountOfSpies} = useContext(SettingsContext);

    const incrementAmountOfSpies = () => {
        if (amountOfSpies >= Math.floor(amountOfPlayers / 2)) {
            toaster.create({
                type: "error",
                title: "Maximum number of spies is half of the players.",
                duration: 3000
            })
        } else {
            setAmountOfSpies(amountOfSpies + 1)
        }
    }

    const decrementAmountOfSpies = () => {
        if (amountOfSpies <= 1) {
            toaster.create({
                type: "error",
                title: "Minimum number of spies is 1.",
                duration: 3000
            })
        } else {
            setAmountOfSpies(amountOfSpies - 1)
        }
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
                                    <IconButton variant="outline" fontSize="xl"
                                                onClick={() => decrementAmountOfSpies()}
                                    >-</IconButton>
                                    <Text fontSize="xl">{amountOfSpies}</Text>
                                    <IconButton variant="outline" fontSize="xl"
                                                onClick={() => incrementAmountOfSpies()}
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