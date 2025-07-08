import {Button, Dialog, Heading, Portal, VStack} from "@chakra-ui/react";
import {useNavigate} from "react-router-dom";
import {useContext} from "react";
import {AuthContext} from "@/context";
import {useAuth} from "@/hooks";
import {Error} from "@/components/Util";

interface SelectSettingsProps {
    open: boolean
    setOpen: (open: boolean) => void
}

export function SelectSettings({open, setOpen}: SelectSettingsProps) {
    const {user} = useContext(AuthContext);
    const {signOut, isLoading, isError} = useAuth();
    const navigate = useNavigate();

    if (isError) {
        console.error(isError);
        return <Error text={"Error signing out"}/>
    }

    return (
        <Dialog.Root lazyMount open={open} onOpenChange={(e) => setOpen(e.open)}>
            <Portal>
                <Dialog.Backdrop/>
                <Dialog.Positioner>
                    <Dialog.Content maxW="500px" w="90%">
                        <Dialog.Header>
                            <Dialog.Title>Settings</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <VStack align="start">
                                <Heading size="md">Categories & Terms</Heading>
                                <Button w="100%" onClick={() => navigate("/suggest")}>
                                    Suggest Content
                                </Button>
                                {user ? (
                                    <Button w="100%" onClick={() => navigate("/manage-data")}>
                                        Manage Data
                                    </Button>
                                ) : (
                                    <></>
                                )}
                                <Heading size="md" mt={4}>Help</Heading>
                                <Button w="100%" onClick={() => navigate("/how-to-play")}>
                                    How To Play
                                </Button>
                                <Heading size="md" mt={4}>Account</Heading>
                                {user ? (
                                    <Button w="100%" loading={isLoading} loadingText="Signing out..."
                                            onClick={async () => await signOut()}>
                                        Sign Out
                                    </Button>
                                ) : (
                                    <Button w="100%" onClick={() => navigate("/login")}>
                                        Admin Login
                                    </Button>
                                )}
                            </VStack>
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