import {Box, Button, HStack, Text} from "@chakra-ui/react";
import {useAnalyticsConsent} from "@/hooks";

export function ConsentBanner() {
    const {consent, setConsent} = useAnalyticsConsent()

    if (consent !== null) return null

    return (
        <Box position="fixed" bottom={4} left="50%" transform="translateX(-50%)" w="90%" maxW="500px"
             zIndex="banner" bg="gray.800" borderRadius="lg" p={4} boxShadow="lg"
             role="region" aria-label="Analytics consent">
            <Text fontSize="sm" mb={3}>
                May we use Google Analytics to see how the game is used? It stores cookies on this device. You can
                change your choice later in Settings.
            </Text>
            <HStack justify="end">
                <Button size="sm" variant="outline" onClick={() => setConsent("denied")}>No thanks</Button>
                <Button size="sm" onClick={() => setConsent("granted")}>Allow</Button>
            </HStack>
        </Box>
    )
}
