import {Button, Center, DialogRootProvider, SimpleGrid, Text, UseDialogReturn, VStack} from "@chakra-ui/react";
import {DialogBackdrop, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui";
import {seedFirestore} from "@/services/seedFirestore.ts";
import {useNavigate} from "react-router-dom";
import {useContext} from "react";
import {AuthContext} from "@/context";
import {useAuth} from "@/hooks";
import {Error} from "@/components/Util";

interface SelectSettingsProps {
    dialog: UseDialogReturn;
}

export function SelectSettings({dialog}: SelectSettingsProps) {
    const {user} = useContext(AuthContext);
    const {signOut, isLoading, isError} = useAuth();
    const navigate = useNavigate();

    const onSave = () => {
        dialog.setOpen(false)
    }

    const handleSignIn = () => {
        navigate("/login")
    }

    const handleSignOut = async () => {
        await signOut()
    }

    if (isError) {
        console.error(isError);
        return <Error text={"Error signing out"}/>
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
                    <VStack>
                        {user ? (
                            <>
                                <Text>{user.email}</Text>
                                <Button
                                    w="100%"
                                    loading={isLoading}
                                    loadingText="Signing out..."
                                    onClick={() => handleSignOut()}
                                >Sign Out</Button>
                                <Button
                                    w="100%"
                                    onClick={() => {
                                        seedFirestore().then(r => r)
                                    }}
                                >Seed Data</Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    w="100%"
                                    onClick={() => handleSignIn()}
                                >Sign In</Button>
                            </>
                        )}
                    </VStack>
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