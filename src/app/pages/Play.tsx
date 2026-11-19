import {AspectRatio, Box, Button, Heading, Spacer, Text, VStack} from "@chakra-ui/react";
import {useGSAP} from "@gsap/react";
import gsap from 'gsap';
import {useContext, useState} from "react";
import {useNavigate} from "react-router-dom";
import {PlayCard, PlaySkeleton} from "@/components/play";
import {AlertMessage, ConfirmDialog} from "@/components/util";
import {SettingsContext} from "@/context";
import {useCategories, useTerms} from "@/hooks";
import {pickSpies} from "@/utils";

const CARD_FACE_STYLE = {
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    MozBackfaceVisibility: "hidden"
} as const

export function Play() {
    const {amountOfPlayers, amountOfSpies, selectedCategoryIds} = useContext(SettingsContext)
    const {getCategories} = useCategories()
    const selectedCategories = getCategories.data?.filter((category) => selectedCategoryIds.includes(category.id)) ?? []
    const {getTerms} = useTerms(selectedCategories.map((category) => category.id))
    const navigate = useNavigate()
    const {contextSafe} = useGSAP()

    const [spies] = useState<number[]>(() => pickSpies(amountOfPlayers, amountOfSpies))
    const [termSeed] = useState<number>(() => Math.random())
    const [frozenTerm, setFrozenTerm] = useState<string | null>(null)
    const [currentMove, setCurrentMove] = useState<number>(0)
    const [isAnimating, setIsAnimating] = useState<boolean>(false)
    const [isExitDialogOpen, setIsExitDialogOpen] = useState<boolean>(false)

    // The subject is picked once: a refetch during the deal must not give later players another one.
    const terms = getTerms.data
    const term = frozenTerm ?? (terms && terms.length > 0 ? terms[Math.floor(termSeed * terms.length)].value : null)
    if (frozenTerm === null && term !== null) {
        setFrozenTerm(term)
    }

    const currentPlayer = Math.floor(currentMove / 2) + 1
    const isRevealed = currentMove % 2 === 1
    const isSpy = spies.includes(currentPlayer - 1)
    const goHome = () => navigate("/")
    const toHome = {label: "Back to home", onClick: goHome}

    const flipCard = contextSafe((onComplete: () => void) => {
        setIsAnimating(true)

        const timeline = gsap.timeline({
            paused: true,
            onComplete: () => {
                setIsAnimating(false)
                onComplete()
            },
        })

        timeline.to(".cardFront", {duration: 0.5, rotationY: "+=180"})
            .to(".cardBack", {duration: 0.5, rotationY: "+=180"}, 0);

        timeline.play()
    })

    const move = () => {
        if (isAnimating) return

        if (currentMove === amountOfPlayers * 2 - 1) {
            goHome()
            return
        }

        flipCard(() => setCurrentMove((previousMove) => previousMove + 1))
    }

    const exit = () => {
        if (currentMove > 0) {
            setIsExitDialogOpen(true)
            return
        }

        goHome()
    }

    if (getCategories.isError) {
        return <AlertMessage status="error" title="Error" text="Error loading categories" action={toHome}/>
    }

    if (getCategories.isPending) {
        return <PlaySkeleton onExit={goHome}/>
    }

    if (selectedCategories.length === 0) {
        return (
            <AlertMessage status="info" title="No categories selected"
                          text="Select at least one category before you start a game." action={toHome}/>
        )
    }

    if (term === null && getTerms.isError) {
        return <AlertMessage status="error" title="Error" text="Error loading terms" action={toHome}/>
    }

    if (term === null && getTerms.isPending) {
        return <PlaySkeleton onExit={goHome}/>
    }

    if (term === null) {
        return (
            <AlertMessage status="info" title="No words to play with"
                          text="The selected categories have no words yet. Pick other categories." action={toHome}/>
        )
    }

    return (
        <VStack maxW="500px" w="90%" flex={1}>
            <Heading size="3xl" mb={4}>Spy Game</Heading>
            <Text>Players: {amountOfPlayers}</Text>
            <Text>Spies: {amountOfSpies}</Text>
            <Text mb={8} textAlign="center">
                {selectedCategories.length === 1 ? "Category: " : "Categories: "}
                {selectedCategories.map((category) => category.value).join(", ")}
            </Text>
            <Text fontWeight="semibold" mb={4} aria-live="polite">
                Player {currentPlayer} of {amountOfPlayers}
            </Text>
            <AspectRatio ratio={1} w="100%">
                <Box position="relative" w="100%" onClick={move} className="card"
                     style={{transformStyle: "preserve-3d", perspective: 2000, overflow: "visible"}}>
                    <AspectRatio ratio={1} w="100%" className="cardFront" position="absolute"
                                 style={CARD_FACE_STYLE}>
                        <PlayCard isAnimating={isAnimating} isBackCard={false} isSpy={false} isHidden={isRevealed}
                                  label={`Player ${currentPlayer}: reveal your role`}/>
                    </AspectRatio>
                    <AspectRatio ratio={1} w="100%" className="cardBack" position="absolute"
                                 transform="rotateY(-180deg)"
                                 style={CARD_FACE_STYLE}>
                        <PlayCard isAnimating={isAnimating} isBackCard={true} isSpy={isSpy} isHidden={!isRevealed}>
                            <Heading fontSize="3xl" fontWeight="semibold">{term}</Heading>
                        </PlayCard>
                    </AspectRatio>
                </Box>
            </AspectRatio>
            <Text textAlign="center">
                {isRevealed ? "Tap again and pass on the phone." : "Tap the card to reveal the subject."}
            </Text>
            <Spacer/>
            <Button w="100%" h="50px" onClick={exit}>
                EXIT
            </Button>

            <ConfirmDialog open={isExitDialogOpen} setOpen={setIsExitDialogOpen}
                           title="Leave this game?"
                           text="Roles have already been dealt. Starting again deals new roles and a new subject."
                           confirmLabel="Leave" isDestructive onConfirm={goHome}/>
        </VStack>
    )
}
