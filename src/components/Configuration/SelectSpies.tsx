import {useContext, useEffect, useState} from "react";
import {
    Button,
    Center,
    DialogRootProvider,
    HStack,
    IconButton,
    SimpleGrid,
    Text,
    UseDialogReturn
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

interface SelectSpiesProps {
    dialog: UseDialogReturn;
    amountOfSpies: number;
    setAmountOfSpies: (amount: number) => void;
}

export function SelectSpies({dialog, amountOfSpies, setAmountOfSpies}: SelectSpiesProps) {
    const [amountOfSpiesLocal, setAmountOfSpiesLocal] = useState<number>(amountOfSpies)
    const {players} = useContext(SettingsContext);

    useEffect(() => {
        if (dialog.open) {
            setAmountOfSpiesLocal(amountOfSpies);
        }
    }, [amountOfSpies, dialog.open]);

    const onSave = () => {
        setAmountOfSpies(amountOfSpiesLocal)
        dialog.setOpen(false)
    }

    const incrementAmountOfSpies = () => {
        if (amountOfSpiesLocal >= Math.floor(players.length / 2)) {
            toaster.create({
                title: "Maximum number of spies is half of the players.",
                type: "error",
                duration: 3000
            })
        } else {
            setAmountOfSpiesLocal(amountOfSpiesLocal + 1)
        }
    }

    const decrementAmountOfSpies = () => {
        if (amountOfSpiesLocal <= 1) {
            toaster.create({
                title: "Minimum number of spies is 1.",
                type: "error",
                duration: 3000
            })
        } else {
            setAmountOfSpiesLocal(amountOfSpiesLocal - 1)
        }
    }

    return (
        <DialogRootProvider value={dialog} size={"xs"}>
            <DialogBackdrop/>
            <DialogContent>
                <DialogHeader>
                    <Center>
                        <DialogTitle>Spies</DialogTitle>
                    </Center>
                </DialogHeader>
                <DialogBody>
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