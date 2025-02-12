import {useContext, useEffect, useState} from "react";
import {
    Button,
    Center,
    DialogRootProvider,
    HStack,
    IconButton,
    Input,
    SimpleGrid,
    Text,
    UseDialogReturn,
    VStack
} from "@chakra-ui/react";
import {
    DialogBackdrop,
    DialogBody,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    toaster
} from "@/components/ui";
import {SettingsContext} from "@/context";

interface SelectPlayersProps {
    dialog: UseDialogReturn;
}

export function SelectPlayers({dialog}: SelectPlayersProps) {
    const {players, setPlayers, amountOfSpies, setAmountOfSpies} = useContext(SettingsContext);
    const [playersLocal, setPlayersLocal] = useState<string[]>([...players])

    useEffect(() => {
        if (dialog.open) {
            setPlayersLocal([...players])
        }
    }, [dialog.open, players]);

    const handleInputChange = (index: number, value: string) => {
        const updatedPlayers = [...playersLocal];
        updatedPlayers[index] = value;
        setPlayersLocal(updatedPlayers);
    }

    const onSave = () => {
        const hasEmptyName = playersLocal.some(name => name.trim() === "");

        if (hasEmptyName) {
            toaster.create({
                title: "Player name cannot be empty.",
                type: "error",
                duration: 3000
            })
            return;
        }

        if (amountOfSpies > Math.floor(playersLocal.length / 2)) {
            setAmountOfSpies(Math.floor(playersLocal.length / 2));
        }

        setPlayers(playersLocal);
        dialog.setOpen(false);
    }

    const incrementAmountOfPlayers = () => {
        if (playersLocal.length >= 10) {
            toaster.create({
                title: "Maximum number of players is 10.",
                type: "error",
                duration: 3000
            })
        } else {
            setPlayersLocal([...playersLocal, `Player${playersLocal.length + 1}`])
        }
    }

    const decrementAmountOfPlayers = () => {
        if (playersLocal.length <= 3) {
            toaster.create({
                title: "Minimum number of players is 3.",
                type: "error",
                duration: 3000
            })
        } else {
            setPlayersLocal(playersLocal.slice(0, -1))
        }
    }

    return (
        <DialogRootProvider value={dialog} size={"xs"}>
            <DialogBackdrop/>
            <DialogContent>
                <DialogHeader>
                    <Center>
                        <DialogTitle>Players</DialogTitle>
                    </Center>
                </DialogHeader>
                <DialogBody>
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
                </DialogBody>
                <DialogFooter>
                    <SimpleGrid w="100%" columns={2} gap={4}>
                        <Button onClick={() => {
                            dialog.setOpen(false)
                        }} variant="outline">Cancel</Button>
                        <Button onClick={() => onSave()}>Save</Button>
                    </SimpleGrid>
                </DialogFooter>
            </DialogContent>
        </DialogRootProvider>
    )
}