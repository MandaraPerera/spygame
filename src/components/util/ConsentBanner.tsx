import {Box, Button, HStack, Text} from "@chakra-ui/react";
import {useAnalyticsConsent} from "@/hooks";

export function ConsentBanner() {
    const {consent, setConsent} = useAnalyticsConsent()

    if (consent !== null) return null

    return (
        <Box position="fixed" insetX="0" bottom="0" zIndex="banner" px="3"
             pb="calc(0.75rem + env(safe-area-inset-bottom))">
            <Box maxW="30rem" mx="auto" bg="bg.emphasized" borderWidth="1px" borderColor="border.emphasized"
                 rounded="panel" p="4" boxShadow="0 12px 32px rgba(0, 0, 0, 0.45)"
                 role="region" aria-label="Analytics consent">
                <Text textStyle="sm" mb="3">
                    Can we use Google Analytics to see how the game is played? It stores cookies on this device.
                    You can change this later in Settings.
                </Text>
                <HStack gap="2">
                    <Button flex="1" variant="outline" onClick={() => setConsent("denied")}>No thanks</Button>
                    <Button flex="1" colorPalette="manila" onClick={() => setConsent("granted")}>Allow</Button>
                </HStack>
            </Box>
        </Box>
    )
}
