import {
    Box,
    Button,
    Dialog,
    Flex,
    Heading,
    HStack,
    IconButton,
    Portal,
    SimpleGrid,
    Text,
    VStack
} from "@chakra-ui/react";
import {FaTimes} from "react-icons/fa";
import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {ProtectedRoute} from "@/components/Util";
import {seedFirestore} from "@/services/firestore";
import {toaster} from "@/components/ui";

export function ManageData() {
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

    return (
        <ProtectedRoute>
            <VStack maxW="500px" w="90%" flex={1}>
                <HStack justify="space-between" w="100%" mb={12}>
                    <Box flex={1}/>
                    <Heading size="3xl">Manage Data</Heading>
                    <Flex flex={1} justify="end">
                        <IconButton variant="plain" mr="-10px" onClick={() => navigate("/")}>
                            <FaTimes/>
                        </IconButton>
                    </Flex>
                </HStack>
                <Button w="100%" onClick={() => {
                    setOpenConfirmResetData(true)
                }}>
                    (Reset Data)
                </Button>
            </VStack>
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
        </ProtectedRoute>
    )
}