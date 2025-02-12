import {
    AspectRatio,
    Button,
    Center,
    Heading,
    HStack,
    Icon,
    SimpleGrid,
    Spacer,
    Text,
    useDialog,
    VStack
} from "@chakra-ui/react";
import {useContext, useState} from "react";
import {MdGroups, MdOutlineSubject, MdSettings} from "react-icons/md";
import {GiSpy} from "react-icons/gi";
import {SettingsContext} from "../context/SettingsContext.ts";
import {SelectPlayers} from "./Configuration/SelectPlayers.tsx";
import {Toaster} from "./ui/toaster.tsx";

export function Home() {
    const {players} = useContext(SettingsContext);
    const [amountOfSpies] = useState<number>(1);
    const [categories] = useState<string[]>([]);

    const selectPlayersDialog = useDialog();

    return (
        <>
            <Center pt={4}>
                <VStack w="80%" maxW="500px">
                    <Heading size="3xl" mb={16}>Better Spy</Heading>
                    <Spacer/>
                    <SimpleGrid columns={{base: 2, md: 1}} gap={4} w="100%">
                        <AspectRatio ratio={{base: 1, md: 10}}>
                            <Button onClick={() => selectPlayersDialog.setOpen(true)}>
                                <VStack>
                                    <HStack>
                                        <Icon boxSize="40px">
                                            <MdGroups/>
                                        </Icon>
                                        <Spacer/>
                                        <Heading size="3xl">{players.length}</Heading>
                                    </HStack>
                                    <Text textStyle="xl">Players</Text>
                                </VStack>
                            </Button>
                        </AspectRatio>

                        <AspectRatio ratio={{base: 1, md: 10}}>
                            <Button onClick={() => {
                            }}>
                                <VStack>
                                    <HStack>
                                        <Icon boxSize="40px">
                                            <GiSpy/>
                                        </Icon>
                                        <Spacer/>
                                        <Heading size="3xl">{amountOfSpies}</Heading>
                                    </HStack>
                                    <Text textStyle="xl">Spies</Text>
                                </VStack>
                            </Button>
                        </AspectRatio>

                        <AspectRatio ratio={{base: 1, md: 10}}>
                            <Button onClick={() => {
                            }}>
                                <VStack>
                                    <HStack>
                                        <Icon boxSize="40px">
                                            <MdOutlineSubject/>
                                        </Icon>
                                        <Spacer/>
                                        <Heading size="3xl">{categories.length}</Heading>
                                    </HStack>
                                    <Text textStyle="xl">Categories</Text>
                                </VStack>
                            </Button>
                        </AspectRatio>

                        <AspectRatio ratio={{base: 1, md: 10}}>
                            <Button onClick={() => {
                            }}>
                                <VStack>
                                    <HStack>
                                        <Icon boxSize="40px">
                                            <MdSettings/>
                                        </Icon>
                                    </HStack>
                                    <Text textStyle="xl">Settings</Text>
                                </VStack>
                            </Button>
                        </AspectRatio>
                    </SimpleGrid>
                    <Button
                        w="80%"
                        h="50px"
                        maxW="500px"
                        position="fixed"
                        left="50%"
                        transform="translateX(-50%)"
                        bottom="75px"
                    >
                        PLAY
                    </Button>
                </VStack>
            </Center>
            <SelectPlayers dialog={selectPlayersDialog}/>
            <Toaster/>
        </>
    )
}