import {useContext, useEffect, useState} from "react";
import {Button, Center, Dialog, HStack, IconButton, Input, Portal, SimpleGrid, Text, VStack} from "@chakra-ui/react";
import {toaster} from "@/components/ui";
import {SettingsContext} from "@/context";

interface SelectPlayersProps {
    open: boolean
    setOpen: (open: boolean) => void
}

export function SelectPlayers({open, setOpen}: SelectPlayersProps) {
    const {players, setPlayers, amountOfSpies, setAmountOfSpies} = useContext(SettingsContext);
    const [playersLocal, setPlayersLocal] = useState<string[]>([...players])

    useEffect(() => {
        if (open) {
            setPlayersLocal([...players])
        }
    }, [open, players]);

    const handleInputChange = (index: number, value: string) => {
        const updatedPlayers = [...playersLocal];
        updatedPlayers[index] = value;
        setPlayersLocal(updatedPlayers);
    }

    const onSave = () => {
        const hasEmptyName = playersLocal.some(name => name.trim() === "");

        if (hasEmptyName) {
            toaster.create({
                type: "error",
                title: "Player name cannot be empty.",
                duration: 3000
            })
            return;
        }

        if (amountOfSpies > Math.floor(playersLocal.length / 2)) {
            setAmountOfSpies(Math.floor(playersLocal.length / 2));
        }

        setPlayers(playersLocal);
        setOpen(false);
    }

    const incrementAmountOfPlayers = () => {
        if (playersLocal.length >= 10) {
            toaster.create({
                type: "error",
                title: "Maximum number of players is 10.",
                duration: 3000
            })
        } else {
            setPlayersLocal([...playersLocal, `Player ${playersLocal.length + 1}`])
        }
    }

    const decrementAmountOfPlayers = () => {
        if (playersLocal.length <= 3) {
            toaster.create({
                type: "error",
                title: "Minimum number of players is 3.",
                duration: 3000
            })
        } else {
            setPlayersLocal(playersLocal.slice(0, -1))
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
                                <VStack>
                                    <HStack gap={3} mb={4}>
                                        <IconButton variant="outline" fontSize="xl"
                                                    onClick={() => decrementAmountOfPlayers()}
                                        >-</IconButton>
                                        <Text fontSize="xl">{playersLocal.length}</Text>
                                        <IconButton variant="outline" fontSize="xl"
                                                    onClick={() => incrementAmountOfPlayers()}
                                        >+</IconButton>
                                    </HStack>
                                    {
                                        playersLocal.map((name, index) => (
                                            <Input key={index}
                                                   defaultValue={name}
                                                   onBlur={(e) => handleInputChange(index, e.target.value)}
                                            />
                                        ))
                                    }
                                </VStack>
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