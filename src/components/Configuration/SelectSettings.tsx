import {Button, Center, DialogRootProvider, SimpleGrid, UseDialogReturn} from "@chakra-ui/react";
import {DialogBackdrop, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui";
import {seedFirestore} from "@/services/seedFirestore.ts";

interface SelectSettingsProps {
    dialog: UseDialogReturn;
}

export function SelectSettings({dialog}: SelectSettingsProps) {

    const onSave = () => {
        dialog.setOpen(false)
    }

    return (
        <DialogRootProvider value={dialog} size={"xs"}>
            <DialogBackdrop/>
            <DialogContent>
                <DialogHeader>
                    <Center>
                        <DialogTitle>Settings</DialogTitle>
                    </Center>
                </DialogHeader>
                <DialogBody>
                    <Button onClick={() => {
                        seedFirestore().then(r => r)
                    }}>Seed Data</Button>
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