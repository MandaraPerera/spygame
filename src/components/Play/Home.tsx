import {useContext, useState} from "react";
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
import {MdGroups, MdOutlineSubject, MdSettings} from "react-icons/md";
import {GiSpy} from "react-icons/gi";
import {Toaster} from "@/components/ui";
import {SelectPlayers, SelectSpies} from "@/components/Configuration";
import {SettingsContext} from "@/context";

export function Home() {
    const {players} = useContext(SettingsContext);
    const [amountOfSpies, setAmountOfSpies] = useState<number>(1);
    const [categories] = useState<string[]>([]);

    const selectPlayersDialog = useDialog();
    const selectSpiesDialog = useDialog();

    return (
        <>
            <Center pt={4}>
                <VStack w="80%" maxW="500px">
                    <Heading size="3xl" mb={16}>Better Spy</Heading>
                    <Spacer/>
                    <SimpleGrid columns={2} gap={4} w="100%">
                        <AspectRatio ratio={1}>
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

                        <AspectRatio ratio={1}>
                            <Button onClick={() => {
                                selectSpiesDialog.setOpen(true)
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

                        <AspectRatio ratio={1}>
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

                        <AspectRatio ratio={1}>
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
            <SelectPlayers dialog={selectPlayersDialog}
                           amountOfSpies={amountOfSpies}
                           setAmountOfSpies={setAmountOfSpies}/>
            <SelectSpies dialog={selectSpiesDialog}
                         amountOfSpies={amountOfSpies}
                         setAmountOfSpies={setAmountOfSpies}/>
            <Toaster/>
        </>
    )
}