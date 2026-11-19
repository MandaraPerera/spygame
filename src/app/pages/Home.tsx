import {AspectRatio, Button, Heading, HStack, Icon, SimpleGrid, Skeleton, Spacer, Text, VStack} from "@chakra-ui/react";
import {useContext, useEffect, useState} from "react";
import {GiSpy} from "react-icons/gi";
import {MdGroups, MdOutlineSubject, MdSettings} from "react-icons/md";
import {useLocation, useNavigate} from "react-router-dom";
import {SelectCategories, SelectPlayers, SelectSettings, SelectSpies} from "@/components/configuration";
import {toaster} from "@/components/ui";
import {Error} from "@/components/util";
import {SettingsContext} from "@/context";
import {useCategories} from "@/hooks";

export function Home() {
    const {amountOfPlayers, amountOfSpies, selectedCategories} = useContext(SettingsContext)
    const {getCategories: {data: categories, isLoading, isError}} = useCategories()
    const navigate = useNavigate()
    const location = useLocation()
    const openSettings = location.state?.openSettings

    const [openPlayersDialog, setOpenPlayersDialog] = useState<boolean>(false)
    const [openSpiesDialog, setOpenSpiesDialog] = useState<boolean>(false)
    const [openCategoriesDialog, setOpenCategoriesDialog] = useState<boolean>(false)
    const [openSettingsDialog, setOpenSettingsDialog] = useState<boolean>(openSettings === true)

    useEffect(() => {
        if (openSettings === true) {
            navigate(location.pathname, {replace: true, state: {}})
        }
    }, [location.pathname, navigate, openSettings])

    const play = () => {
        if (selectedCategories.length === 0) {
            toaster.create({
                type: "error",
                title: "Select at least one category",
                duration: 3000
            })
            return
        } else {
            navigate("/play")
        }
    }

    if (isLoading) {
        return (
            <VStack maxW="500px" w="90%" flex={1}>
                <Heading size="3xl" mb={16}>Spy Game</Heading>
                <SimpleGrid columns={2} gap={4} w="100%">
                    {Array.from({length: 4}, (_, index) => (
                        <AspectRatio ratio={1} key={index}>
                            <Skeleton w="100%"/>
                        </AspectRatio>
                    ))}
                </SimpleGrid>
                <Spacer/>
                <Skeleton w="100%" h="50px"/>
            </VStack>
        )
    }

    if (isError || !categories) {
        return <Error text={"Error loading categories"}/>
    }

    return (
        <VStack maxW="500px" w="90%" flex={1}>
            <Heading size="3xl" mb={16}>Spy Game</Heading>
            <SimpleGrid columns={2} gap={4} w="100%">
                <AspectRatio ratio={1}>
                    <Button onClick={() => setOpenPlayersDialog(true)}>
                        <VStack>
                            <HStack>
                                <Icon boxSize="40px">
                                    <MdGroups/>
                                </Icon>
                                <Spacer/>
                                <Heading size="3xl">{amountOfPlayers}</Heading>
                            </HStack>
                            <Text textStyle="xl">Players</Text>
                        </VStack>
                    </Button>
                </AspectRatio>

                <AspectRatio ratio={1}>
                    <Button onClick={() => {
                        setOpenSpiesDialog(true)
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
                        setOpenCategoriesDialog(true)
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
                        setOpenSettingsDialog(true)
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
            <Spacer/>
            <Button w="100%" h="50px" left="50%" transform="translateX(-50%)" onClick={() => play()}>
                PLAY
            </Button>

            <SelectPlayers open={openPlayersDialog} setOpen={setOpenPlayersDialog}/>
            <SelectSpies open={openSpiesDialog} setOpen={setOpenSpiesDialog}/>
            <SelectCategories open={openCategoriesDialog} setOpen={setOpenCategoriesDialog} categories={categories}/>
            <SelectSettings open={openSettingsDialog} setOpen={setOpenSettingsDialog}/>
        </VStack>
    )
}