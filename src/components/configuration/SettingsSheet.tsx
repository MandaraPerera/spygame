import {Button, Stack, Switch, Text} from "@chakra-ui/react";
import {useContext} from "react";
import {LuBookOpen, LuChartColumn, LuDatabase, LuLightbulb, LuLogIn, LuLogOut} from "react-icons/lu";
import {toaster} from "@/components/ui";
import {ListPanel, ListRow, Sheet} from "@/components/util";
import {AuthContext} from "@/context";
import {useAnalyticsConsent, useAuth} from "@/hooks";

interface SettingsSheetProps {
    open: boolean
    setOpen: (open: boolean) => void
}

export function SettingsSheet({open, setOpen}: SettingsSheetProps) {
    const {user, isAdmin} = useContext(AuthContext);
    const {signOut, isLoading} = useAuth();
    const {consent, setConsent} = useAnalyticsConsent();

    const handleSignOut = async () => {
        const error = await signOut()
        if (error) {
            toaster.create({type: "error", title: "Couldn't sign out", description: error})
        }
    }

    return (
        <Sheet open={open} setOpen={setOpen} title="Settings"
               footer={<Button size="xl" variant="outline" onClick={() => setOpen(false)}>Close</Button>}>
            <Stack gap="4">
                <ListPanel bg="bg.muted/60">
                    <ListRow icon={<LuLightbulb/>} label="Suggest words"
                             description="Send in a new category or more words" to="/suggest"/>
                    <ListRow icon={<LuBookOpen/>} label="How to play" to="/how-to-play"/>
                    {isAdmin ? <ListRow icon={<LuDatabase/>} label="Manage data" to="/manage-data"/> : null}
                </ListPanel>

                <ListPanel bg="bg.muted/60">
                    <Switch.Root colorPalette="manila" size="lg" w="100%" checked={consent === "granted"}
                                 onCheckedChange={(e) => setConsent(e.checked ? "granted" : "denied")}>
                        <Switch.HiddenInput/>
                        <ListRow icon={<LuChartColumn/>}
                                 label={<Switch.Label fontWeight="semibold">Share usage statistics</Switch.Label>}
                                 description="Google Analytics, which stores cookies on this device"
                                 end={<Switch.Control><Switch.Thumb/></Switch.Control>}/>
                    </Switch.Root>
                    {user ? (
                        <ListRow icon={<LuLogOut/>} label="Signed in as admin"
                                 description={<Text as="span" display="block" truncate>{user.email}</Text>}
                                 end={(
                                     <Button size="sm" variant="outline" loading={isLoading} loadingText="Signing out"
                                             onClick={handleSignOut}>
                                         Sign out
                                     </Button>
                                 )}/>
                    ) : (
                        <ListRow icon={<LuLogIn/>} label="Admin sign in" to="/login"/>
                    )}
                </ListPanel>
            </Stack>
        </Sheet>
    )
}
