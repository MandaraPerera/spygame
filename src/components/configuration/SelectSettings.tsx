import {Button, Dialog, Heading, Portal, Switch, VStack} from "@chakra-ui/react";
import {useContext} from "react";
import {useNavigate} from "react-router-dom";
import {toaster} from "@/components/ui";
import {AuthContext} from "@/context";
import {useAnalyticsConsent, useAuth} from "@/hooks";

interface SelectSettingsProps {
    open: boolean
    setOpen: (open: boolean) => void
}

export function SelectSettings({open, setOpen}: SelectSettingsProps) {
    const {user, isAdmin} = useContext(AuthContext);
    const {signOut, isLoading} = useAuth();
    const {consent, setConsent} = useAnalyticsConsent();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        const error = await signOut()
        if (error) {
            toaster.create({type: "error", title: "Error signing out", description: error})
        }
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
                                {isAdmin ? (
                                    <Button w="100%" onClick={() => navigate("/manage-data")}>
                                        Manage Data
                                    </Button>
                                ) : null}
                                <Heading size="md" mt={4}>Help</Heading>
                                <Button w="100%" onClick={() => navigate("/how-to-play")}>
                                    How To Play
                                </Button>
                                <Heading size="md" mt={4}>Privacy</Heading>
                                <Switch.Root checked={consent === "granted"}
                                             onCheckedChange={(e) => setConsent(e.checked ? "granted" : "denied")}>
                                    <Switch.HiddenInput/>
                                    <Switch.Control>
                                        <Switch.Thumb/>
                                    </Switch.Control>
                                    <Switch.Label>Allow Google Analytics</Switch.Label>
                                </Switch.Root>
                                <Heading size="md" mt={4}>Account</Heading>
                                {user ? (
                                    <Button w="100%" loading={isLoading} loadingText="Signing out..."
                                            onClick={handleSignOut}>
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
