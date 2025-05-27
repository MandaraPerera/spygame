import {AspectRatio, Button, Heading, Skeleton, Spacer, Text, VStack} from "@chakra-ui/react";
import {useContext, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {SettingsContext} from "@/context";
import {useTerms} from "@/hooks/useTerms.ts";
import {Error} from "@/components/Util";
import {Term} from "@/model";

export function Play() {
    const {players, amountOfSpies, selectedCategories} = useContext(SettingsContext);
    const categoryIds = selectedCategories.map(category => category.id)
    const {getTerms: {data: terms, isLoading, isError}} = useTerms(categoryIds)
    const navigate = useNavigate()

    const [currentPlayer, setCurrentPlayer] = useState<number>(0)
    const [spies, setSpies] = useState<number[]>([])
    const [showingRole, setShowingRole] = useState<boolean>(false)
    const [term, setTerm] = useState<string>()


    useEffect(() => {
        if (players.length > 0) {
            const randomSpies = new Set<number>()
            while (randomSpies.size < amountOfSpies) {
                const randomNum = Math.floor(Math.random() * (players.length))
                randomSpies.add(randomNum)
            }
            setSpies(Array.from(randomSpies))
        }
    }, [amountOfSpies, players.length]);

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
        return (
            <VStack maxW="500px" w="90%" flex={1}>
                <Heading size="3xl" mb={4}>Better Spy</Heading>
                <Skeleton h="5" w="75px" mb={1}/>
                <Skeleton h="5" w="60px" mb={1}/>
                <Skeleton h="5" w="150px" mb={12}/>
                <AspectRatio ratio={1} w="100%" mb={1}>
                    <Skeleton w="100%" borderRadius="2xl"/>
                </AspectRatio>
                <Skeleton h="5" w="180px"/>
                <Spacer/>
                <Skeleton w="100%" h="50px"/>
            </VStack>
        )
    }

    if (isError || !terms) {
        return <Error text={"Error loading terms"}/>
    }

    return (
        <VStack maxW="500px" w="90%" flex={1}>
            <Heading size="3xl" mb={4}>Better Spy</Heading>
            <Text>Players: {players.length}</Text>
            <Text>Spies: {amountOfSpies}</Text>
            <Text mb={12}>
                {selectedCategories.length === 1 ? "Category: " : "Categories: "}
                {selectedCategories.map((category) => category.value).join(", ")}
            </Text>
            <AspectRatio ratio={1} w="100%">
                <Button borderRadius="2xl" fontSize="3xl" onClick={() => move()}>
                    {showingRole ? (
                        spies.includes(currentPlayer) ? (
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
            <Spacer/>
            <Button w="100%" h="50px" left="50%" transform="translateX(-50%)" onClick={() => exit()}>
                EXIT
            </Button>
        </VStack>
    )
}