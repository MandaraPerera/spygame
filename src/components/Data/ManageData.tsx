import {AspectRatio, Box, Button, Flex, Heading, HStack, IconButton, SimpleGrid, Text, VStack} from "@chakra-ui/react";
import {FaTimes} from "react-icons/fa";
import {Outlet, useNavigate} from "react-router-dom";
import {useContext} from "react";
import {ProtectedRoute} from "@/components/Util";
import {AuthContext} from "@/context";
import {useStats} from "@/hooks";
import {ManageDataSkeleton} from "@/components/Data";

export function ManageData() {
    const {isLoading, categories, terms, suggestions, logs} = useStats();
    const {isLoading: isLoadingUser, user} = useContext(AuthContext);
    const navigate = useNavigate();

    if (isLoading || isLoadingUser || !user) {
        return <ManageDataSkeleton/>
    }

    return (
        <ProtectedRoute>
            <VStack maxW="500px" w="90%" flex={1}>
                <HStack justify="space-between" w="100%" mb={4}>
                    <Box flex={1}/>
                    <Heading size="3xl">Manage Data</Heading>
                    <Flex flex={1} justify="end">
                        <IconButton variant="plain" mr="-10px" onClick={() => navigate("/")}>
                            <FaTimes/>
                        </IconButton>
                    </Flex>
                </HStack>

                <Text textAlign="center" w="100%">Signed in as</Text>
                <Text textAlign="center" mb={8} w="100%">{user.email}</Text>

                <SimpleGrid columns={2} gap={4} w="100%">
                    <AspectRatio ratio={1}>
                        <Button onClick={() => navigate("/categories")}>
                            <VStack>
                                <Heading size="3xl">{categories}</Heading>
                                <Text textStyle="xl">{terms === 1 ? "Category" : "Categories"}</Text>
                            </VStack>
                        </Button>
                    </AspectRatio>

                    <AspectRatio ratio={1}>
                        <Button onClick={() => navigate("/terms")}>
                            <VStack>
                                <Heading size="3xl">{terms}</Heading>
                                <Text textStyle="xl">{terms === 1 ? "Term" : "Terms"}</Text>
                            </VStack>
                        </Button>
                    </AspectRatio>

                    <AspectRatio ratio={1}>
                        <Button onClick={() => navigate("/suggestions")}>
                            <VStack>
                                <Heading size="3xl">{suggestions}</Heading>
                                <Text textStyle="xl">{suggestions === 1 ? "Suggestion" : "Suggestions"}</Text>
                            </VStack>
                        </Button>
                    </AspectRatio>

                    <AspectRatio ratio={1}>
                        <Button onClick={() => navigate("/logs")}>
                            <VStack>
                                <Heading size="3xl">{logs}</Heading>
                                <Text textStyle="xl">{logs === 1 ? "Log" : "Logs"}</Text>
                            </VStack>
                        </Button>
                    </AspectRatio>
                </SimpleGrid>
                <Outlet/>
            </VStack>
        </ProtectedRoute>
    )
}