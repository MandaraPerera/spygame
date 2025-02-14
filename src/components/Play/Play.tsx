import {AspectRatio, Button, Center, Heading, Spacer, Text, VStack} from "@chakra-ui/react";
import {useContext, useEffect, useState} from "react";
import {SettingsContext} from "@/context";
import {useNavigate} from "react-router-dom";
import {useTerms} from "@/hooks/useTerms.ts";
import {Error, Loading} from "@/components/Util";
import {Term} from "@/model";

export function Play() {
    const [currentPlayer, setCurrentPlayer] = useState<number>(0)
    const [spy, setSpy] = useState<number>()
    const [showingRole, setShowingRole] = useState<boolean>(false)
    const [term, setTerm] = useState<string>()
    const navigate = useNavigate()

    const {players, amountOfSpies, selectedCategories} = useContext(SettingsContext);
    const categoryIds = selectedCategories.map(category => category.id)
    const {data: terms, isLoading, isError} = useTerms(categoryIds)

    useEffect(() => {
        setSpy(Math.floor(Math.random() * players.length))
    }, [players.length]);

    useEffect(() => {
        if (terms && terms.length > 0) {
            const term = terms[Math.floor(Math.random() * terms.length)] as Term
            setTerm(term.value)
        }
    }, [terms]);

    const move = () => {
        if (currentPlayer === players.length - 1 && showingRole) {
            navigate("/")
        } else {
            setShowingRole(!showingRole)
            if (showingRole) {
                setCurrentPlayer(currentPlayer + 1)
            }
        }
    }

    const exit = () => {
        navigate("/")
    }

    if (isLoading) {
        return <Loading text={"Terms are being loaded."}/>
    }

    if (isError || !terms) {
        return <Error text={"Error loading terms"}/>
    }

    return (
        <Center pt={4}>
            <VStack w="80%" maxW="500px">
                <Heading size="3xl" mb={4}>Better Spy</Heading>
                <Text>Players: {players.length}</Text>
                <Text>Spies: {amountOfSpies}</Text>
                <Text mb={12}>Categor{selectedCategories.length === 1 ? "y" : "ies"}: {
                    selectedCategories.map((category) => category.value).join(", ")
                }</Text>
                <Spacer/>
                <AspectRatio ratio={1} w="100%">
                    <Button borderRadius="2xl" fontSize="3xl" onClick={() => move()}>
                        {showingRole ? (
                            currentPlayer === spy ? (
                                <Text>SPY</Text>
                            ) : (
                                <Text>{term}</Text>
                            )
                        ) : (
                            <Text>{players[currentPlayer]}</Text>
                        )}
                    </Button>
                </AspectRatio>
                <Text>Click to reveal the word</Text>
                <Button
                    w="80%"
                    h="50px"
                    maxW="500px"
                    position="fixed"
                    left="50%"
                    transform="translateX(-50%)"
                    bottom="75px"
                    onClick={() => exit()}
                >
                    EXIT
                </Button>
            </VStack>
        </Center>
    )
}