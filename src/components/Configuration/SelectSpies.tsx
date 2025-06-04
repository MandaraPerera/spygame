import {useContext, useEffect, useState} from "react";
import {Button, Center, Dialog, HStack, IconButton, Portal, SimpleGrid, Text} from "@chakra-ui/react";
import {toaster} from "@/components/ui";
import {SettingsContext} from "@/context";

interface SelectSpiesProps {
    open: boolean
    setOpen: (open: boolean) => void
}

export function SelectSpies({open, setOpen}: SelectSpiesProps) {
    const {players, amountOfSpies, setAmountOfSpies} = useContext(SettingsContext);
    const [amountOfSpiesLocal, setAmountOfSpiesLocal] = useState<number>(amountOfSpies)

    useEffect(() => {
        if (open) {
            setAmountOfSpiesLocal(amountOfSpies);
        }
    }, [amountOfSpies, open]);

    const onSave = () => {
        setAmountOfSpies(amountOfSpiesLocal)
        setOpen(false)
    }

    const incrementAmountOfSpies = () => {
        if (amountOfSpiesLocal >= Math.floor(players.length / 2)) {
            toaster.create({
                type: "error",
                title: "Maximum number of spies is half of the players.",
                duration: 3000
            })
        } else {
            setAmountOfSpiesLocal(amountOfSpiesLocal + 1)
        }
    }

    const decrementAmountOfSpies = () => {
        if (amountOfSpiesLocal <= 1) {
            toaster.create({
                type: "error",
                title: "Minimum number of spies is 1.",
                duration: 3000
            })
        } else {
            setAmountOfSpiesLocal(amountOfSpiesLocal - 1)
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
                                    <Text fontSize="xl">{amountOfSpiesLocal}</Text>
                                    <IconButton variant="outline" fontSize="xl"
                                                onClick={() => incrementAmountOfSpies()}
                                    >+</IconButton>
                                </HStack>
                            </Center>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <SimpleGrid w="100%" columns={2} gap={4}>
                                <Dialog.ActionTrigger asChild>
                                    <Button variant="outline">Cancel</Button>
                                </Dialog.ActionTrigger>
                                <Button onClick={onSave}>Save</Button>
                            </SimpleGrid>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}