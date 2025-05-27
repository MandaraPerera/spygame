import {Button, Dialog, Heading, Portal, SimpleGrid, Spacer, Text, VStack} from "@chakra-ui/react";
import {useNavigate} from "react-router-dom";
import {useContext, useState} from "react";
import {seedFirestore} from "@/services/seedFirestore.ts";
import {AuthContext} from "@/context";
import {useAuth} from "@/hooks";
import {Error} from "@/components/Util";
import {toaster} from "@/components/ui";

interface SelectSettingsProps {
    open: boolean
    setOpen: (open: boolean) => void
}

export function SelectSettings({open, setOpen}: SelectSettingsProps) {
    const {user} = useContext(AuthContext);
    const {signOut, isLoading, isError} = useAuth();
    const navigate = useNavigate();

    const [openConfirmResetData, setOpenConfirmResetData] = useState<boolean>(false)

    const handleResetData = async () => {
        await seedFirestore()
        setOpenConfirmResetData(false)
        toaster.create({
            type: "success",
            title: "Successfully reset all data.",
            duration: 3000
        })
    }

    if (isError) {
        console.error(isError);
        return <Error text={"Error signing out"}/>
    }

    return (
        <>
            <Dialog.Root lazyMount open={open} onOpenChange={(e) => setOpen(e.open)}>
                <Portal>
                    <Dialog.Backdrop/>
                    <Dialog.Positioner>
                        <Dialog.Content maxW="500px" w="90%">
                            <Dialog.Header>
                                <Dialog.Title>Settings</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <VStack>
                                    {user ? (
                                        <>
                                            <Heading size="md" alignSelf="start">Categories & Terms</Heading>
                                            <Button w="100%" onClick={() => navigate("/manage-data")}>
                                                Manage Data
                                            </Button>
                                            <Button w="100%" onClick={() => {
                                                setOpenConfirmResetData(true)
                                                setOpen(false)
                                            }}>
                                                (Reset Data)</Button>
                                            <Spacer/>
                                            <Heading size="md" alignSelf="start">Account</Heading>
                                            <Text alignSelf="start">{user.email}</Text>
                                            <Button w="100%"
                                                    loading={isLoading}
                                                    loadingText="Signing out..."
                                                    onClick={async () => await signOut()}>
                                                Sign Out
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Heading size="md" alignSelf="start">Categories & Terms</Heading>
                                            <Button w="100%"
                                                    onClick={() => navigate("/suggest")}>
                                                Suggest category or word
                                            </Button>
                                            <Spacer/>
                                            <Heading size="md" alignSelf="start">Account</Heading>
                                            <Button w="100%"
                                                    onClick={() => navigate("/login")}>
                                                Admin login
                                            </Button>
                                        </>
                                    )}
                                </VStack>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Button variant="outline" w="100%" onClick={() => setOpen(false)}>
                                    Close
                                </Button>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
            <Dialog.Root lazyMount open={openConfirmResetData} onOpenChange={(e) => setOpenConfirmResetData(e.open)}>
                <Portal>
                    <Dialog.Backdrop/>
                    <Dialog.Positioner>
                        <Dialog.Content maxW="90%">
                            <Dialog.CloseTrigger/>
                            <Dialog.Header>
                                <Dialog.Title>Reset All Data?</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <Text>Are you sure you want to reset all categories and terms?</Text>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <SimpleGrid w="100%" columns={2} gap={4}>
                                    <Button onClick={() => setOpenConfirmResetData(false)} variant="outline">
                                        Cancel
                                    </Button>
                                    <Button onClick={handleResetData}>
                                        Confirm
                                    </Button>
                                </SimpleGrid>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </>
    )
}