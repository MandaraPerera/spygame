import {AspectRatio, Box, Button, Heading, Skeleton, Spacer, Text, VStack} from "@chakra-ui/react";
import {useGSAP} from "@gsap/react";
import gsap from 'gsap';
import {useContext, useState} from "react";
import {useNavigate} from "react-router-dom";
import {PlayCard} from "@/components/play";
import {Error} from "@/components/util";
import {SettingsContext} from "@/context";
import {useTerms} from "@/hooks";
import type {Term} from "@/model";

export function Play() {
    const {amountOfPlayers, amountOfSpies, selectedCategories} = useContext(SettingsContext)
    const categoryIds = selectedCategories.map(category => category.id)
    const {getTerms: {data: terms, isLoading, isError}} = useTerms(categoryIds)
    const navigate = useNavigate()
    const {contextSafe} = useGSAP()

    const [spies] = useState<number[] | null>(() => {
        if (amountOfPlayers <= 0) return null

        const randomSpies = new Set<number>()
        while (randomSpies.size < amountOfSpies) {
            const randomNum = Math.floor(Math.random() * (amountOfPlayers))
            randomSpies.add(randomNum)
        }
        return Array.from(randomSpies)
    })
    const [termSeed] = useState<number>(() => Math.random())

    const [currentMove, setCurrentMove] = useState<number>(0)
    const [isAnimating, setIsAnimating] = useState<boolean>(false)

    const term = terms && terms.length > 0 ? (terms[Math.floor(termSeed * terms.length)] as Term).value : null
    const backCard = term && spies ? (spies.includes(Math.floor(currentMove / 2)) ? "SPY" : term) : null

    const move = () => {
        if (isAnimating) return

        if (currentMove === amountOfPlayers * 2 - 1) {
            navigate("/")
        } else {
            onClickAnimation(() => {
                setCurrentMove(currentMove + 1)
            })
        }
    }

    const onClickAnimation = contextSafe((onComplete: () => void) => {
        setIsAnimating(true)

        const tl = gsap.timeline({
            paused: true,
            onComplete: () => {
                setIsAnimating(false)
                onComplete()
            },
        })

        tl.to(".cardFront", {duration: 0.5, rotationY: "+=180"})
            .to(".cardBack", {duration: 0.5, rotationY: "+=180"}, 0);

        tl.play()
    })

    const exit = () => {
        navigate("/")
    }

    if (isLoading || !term || !spies) {
        return (
            <VStack maxW="500px" w="90%" flex={1}>
                <Heading size="3xl" mb={4}>Spy Game</Heading>
                <Skeleton h="5" w="75px" mb={1}/>
                <Skeleton h="5" w="60px" mb={1}/>
                <Skeleton h="5" w="150px" mb={12}/>
                <AspectRatio ratio={1} w="100%" mb={1}>
                    <Skeleton w="100%" borderRadius="2xl"/>
                </AspectRatio>
                <Skeleton h="5" w="180px"/>
                <Spacer/>
                <Button w="100%" h="50px" onClick={() => exit()}>
                    EXIT
                </Button>
            </VStack>
        )
    }

    if (isError || !terms) {
        return <Error text={"Error loading terms"}/>
    }

    return (
        <VStack maxW="500px" w="90%" flex={1}>
            <Heading size="3xl" mb={4}>Spy Game</Heading>
            <Text>Players: {amountOfPlayers}</Text>
            <Text>Spies: {amountOfSpies}</Text>
            <Text mb={12} textAlign="center">
                {selectedCategories.length === 1 ? "Category: " : "Categories: "}
                {selectedCategories.map((category) => category.value).join(", ")}
            </Text>
            <AspectRatio ratio={1} w="100%">
                <Box position="relative" w="100%" onClick={move} className="card"
                     style={{transformStyle: "preserve-3d", perspective: 2000, overflow: "visible"}}>
                    <AspectRatio ratio={1} w="100%" className="cardFront" position="absolute"
                                 style={{
                                     backfaceVisibility: "hidden",
                                     WebkitBackfaceVisibility: "hidden",
                                     MozBackfaceVisibility: "hidden"
                                 }}>
                        <PlayCard isAnimating={isAnimating} backCard={false} isSpy={false}/>
                    </AspectRatio>
                    <AspectRatio ratio={1} w="100%" className="cardBack" position="absolute"
                                 transform="rotateY(-180deg)"
                                 style={{
                                     backfaceVisibility: "hidden",
                                     WebkitBackfaceVisibility: "hidden",
                                     MozBackfaceVisibility: "hidden"
                                 }}>
                        <PlayCard isAnimating={isAnimating} backCard={true} isSpy={backCard === "SPY"}>
                            <Heading fontSize="3xl" fontWeight="semibold">{backCard}</Heading>
                        </PlayCard>
                    </AspectRatio>
                </Box>
            </AspectRatio>
            <Text textAlign="center">
                {(currentMove + 2) % 2 === 0
                    ? "Tap the card to reveal the subject."
                    : "Tap again and pass on the phone."}
            </Text>
            <Spacer/>
            <Button w="100%" h="50px" onClick={() => exit()}>
                EXIT
            </Button>
        </VStack>
    )
}