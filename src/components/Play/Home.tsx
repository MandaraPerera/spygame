import {useContext} from "react";
import {
    AspectRatio,
    Button,
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
import {toaster, Toaster} from "@/components/ui";
import {SelectCategories, SelectPlayers, SelectSettings, SelectSpies} from "@/components/Configuration";
import {SettingsContext} from "@/context";
import {useCategories} from "@/hooks";
import {Error, Loading} from "@/components/Util";
import {useNavigate} from "react-router-dom";

export function Home() {
    const {players, amountOfSpies, selectedCategories} = useContext(SettingsContext);
    const {data: categories, isLoading, isError} = useCategories();
    const navigate = useNavigate();

    const selectPlayersDialog = useDialog();
    const selectSpiesDialog = useDialog();
    const selectCategoriesDialog = useDialog();
    const selectSettingsDialog = useDialog();

    const play = () => {
        if (selectedCategories.length === 0) {
            toaster.create({
                title: "Select at least one category",
                type: "error",
                duration: 3000
            })
            return
        } else {
            navigate("/play")
        }
    }

    if (isLoading) {
        return <Loading text={"Categories are being loaded."}/>
    }

    if (isError || !categories) {
        return <Error text={"Error loading categories"}/>
    }

    return (
        <>
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
                        selectCategoriesDialog.setOpen(true)
                    }}>
                        <VStack>
                            <HStack>
                                <Icon boxSize="40px">
                                    <MdOutlineSubject/>
                                </Icon>
                                <Spacer/>
                                <Heading size="3xl">{selectedCategories.length}</Heading>
                            </HStack>
                            <Text textStyle="xl">Categories</Text>
                        </VStack>
                    </Button>
                </AspectRatio>

                <AspectRatio ratio={1}>
                    <Button onClick={() => {
                        selectSettingsDialog.setOpen(true)
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
                onClick={() => play()}
            >
                PLAY
            </Button>
            <SelectPlayers dialog={selectPlayersDialog}/>
            <SelectSpies dialog={selectSpiesDialog}/>
            <SelectCategories dialog={selectCategoriesDialog} categories={categories}/>
            <SelectSettings dialog={selectSettingsDialog}/>
            <Toaster/>
        </>
    )
}