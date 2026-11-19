import {Box, Flex, HStack, IconButton, Text} from "@chakra-ui/react";
import {useGSAP} from "@gsap/react";
import gsap from 'gsap';
import {useContext, useRef, useState} from "react";
import {LuX} from "react-icons/lu";
import {useNavigate} from "react-router-dom";
import {DealDone, PlaySkeleton, RoleCard} from "@/components/play";
import {AlertMessage, ConfirmDialog, Screen, TopBar} from "@/components/util";
import {SettingsContext} from "@/context";
import {useCategories, useTerms} from "@/hooks";
import {pickSpies, pickTerm, prefersReducedMotion} from "@/utils";

type Deal = {
    spies: number[]
    termSeed: number
}

// Parts of the RoleCard, found inside the card's scope.
const FLIP_TARGET = "[data-card-flip]"
const MARK_TARGET = "[data-card-mark]"

const newDeal = (players: number, spies: number): Deal => ({spies: pickSpies(players, spies), termSeed: Math.random()})

function hintFor(player: number, amountOfPlayers: number, isRevealed: boolean): string {
    if (isRevealed) {
        return player === amountOfPlayers
            ? "Remember your role, then tap the file to close it."
            : `Remember your role, then tap the file to close it and pass the phone to player ${player + 1}.`
    }

    return player === 1
        ? "Make sure nobody else can see the screen, then tap the file."
        : `Player ${player}, tap the file when nobody else can see the screen.`
}

export function Play() {
    const {amountOfPlayers, amountOfSpies, selectedCategoryIds} = useContext(SettingsContext)
    const {getCategories} = useCategories()
    const selectedCategories = getCategories.data?.filter((category) => selectedCategoryIds.includes(category.id)) ?? []
    const {getTerms} = useTerms(selectedCategories.map((category) => category.id))
    const navigate = useNavigate()
    const cardScopeRef = useRef<HTMLDivElement>(null)
    const {contextSafe} = useGSAP({scope: cardScopeRef})

    const [deal, setDeal] = useState<Deal>(() => newDeal(amountOfPlayers, amountOfSpies))
    const [frozenTerm, setFrozenTerm] = useState<string | null>(null)
    const [previousTerm, setPreviousTerm] = useState<string | null>(null)
    const [currentMove, setCurrentMove] = useState<number>(0)
    const [isAnimating, setIsAnimating] = useState<boolean>(false)
    const [isExitDialogOpen, setIsExitDialogOpen] = useState<boolean>(false)

    // The subject is picked once: a refetch during the deal must not give later players another one.
    const terms = getTerms.data
    const term = frozenTerm ?? pickTerm((terms ?? []).map((item) => item.value), deal.termSeed, previousTerm)
    if (frozenTerm === null && term !== null) {
        setFrozenTerm(term)
    }

    const isFinished = currentMove >= amountOfPlayers * 2
    const currentPlayer = Math.min(Math.floor(currentMove / 2) + 1, amountOfPlayers)
    const isRevealed = currentMove % 2 === 1
    const isSpy = deal.spies.includes(currentPlayer - 1)
    const nextPlayer = Math.min(currentPlayer + 1, amountOfPlayers)
    // While a role is open the front faces away, so it already shows the next player: closing the file never shows
    // the number change.
    const playerOnFront = isRevealed ? nextPlayer : currentPlayer
    // The title, progress and hint move on to the next player as soon as the file starts closing, with the card.
    const isHandingOver = isRevealed && isAnimating && currentPlayer < amountOfPlayers
    const playerOnScreen = isHandingOver ? nextPlayer : currentPlayer
    const goHome = () => navigate("/")
    const toHome = {label: "Back to setup", onClick: goHome}

    // The role on the back only changes once the card has turned away, so it is never seen by the next player.
    const flipCard = contextSafe((reveal: boolean, onComplete: () => void) => {
        const duration = prefersReducedMotion() ? 0 : 0.6
        setIsAnimating(true)

        const timeline = gsap.timeline({
            onComplete: () => {
                setIsAnimating(false)
                onComplete()
            }
        })

        if (!reveal) {
            // Keep turning the same way, then reset so the next reveal starts from the front.
            timeline.to(FLIP_TARGET, {rotationY: 360, duration, ease: "power2.inOut"}).set(FLIP_TARGET, {rotationY: 0})
            return
        }

        timeline.to(FLIP_TARGET, {rotationY: 180, duration, ease: "power2.inOut"})
        // The word or the SPY stamp lands as the file opens; both get the same motion and timing.
        if (duration > 0) {
            timeline.fromTo(MARK_TARGET, {scale: 1.4, opacity: 0},
                {scale: 1, opacity: 1, duration: 0.32, ease: "back.out(2.2)"}, "-=0.15")
        }
    })

    const move = () => {
        if (isAnimating) return
        flipCard(!isRevealed, () => setCurrentMove((previousMove) => previousMove + 1))
    }

    const dealAgain = () => {
        setPreviousTerm(frozenTerm)
        setFrozenTerm(null)
        setDeal(newDeal(amountOfPlayers, amountOfSpies))
        setCurrentMove(0)
    }

    const exit = () => {
        if (currentMove > 0 && !isFinished) {
            setIsExitDialogOpen(true)
            return
        }

        goHome()
    }

    if (getCategories.isError) {
        return (
            <Screen>
                <AlertMessage status="error" title="Couldn't load the categories"
                              text="Check your connection and try again." action={toHome}/>
            </Screen>
        )
    }

    if (getCategories.isPending) {
        return <PlaySkeleton onExit={goHome}/>
    }

    if (selectedCategories.length === 0) {
        return (
            <Screen>
                <AlertMessage status="info" title="No categories selected"
                              text="Pick at least one category before you deal the roles." action={toHome}/>
            </Screen>
        )
    }

    if (term === null && getTerms.isError) {
        return (
            <Screen>
                <AlertMessage status="error" title="Couldn't load the words"
                              text="Check your connection and try again." action={toHome}/>
            </Screen>
        )
    }

    if (term === null && getTerms.isPending) {
        return <PlaySkeleton onExit={goHome}/>
    }

    if (term === null) {
        return (
            <Screen>
                <AlertMessage status="info" title="No words to play with"
                              text="The selected categories have no words yet. Pick other categories." action={toHome}/>
            </Screen>
        )
    }

    if (isFinished) {
        return (
            <DealDone amountOfPlayers={amountOfPlayers} amountOfSpies={deal.spies.length}
                      categoryNames={selectedCategories.map((category) => category.value).sort((a, b) => a.localeCompare(b))}
                      onDealAgain={dealAgain}/>
        )
    }

    const closeButton = (
        <IconButton variant="ghost" aria-label="Leave game" onClick={exit}>
            <LuX/>
        </IconButton>
    )

    return (
        <Screen header={<TopBar start={closeButton} title={`Player ${playerOnScreen} of ${amountOfPlayers}`} isTitleLive/>}>
            <HStack gap="1.5" aria-hidden>
                {Array.from({length: amountOfPlayers}, (_, index) => {
                    const isCurrent = index === playerOnScreen - 1
                    const isDone = index < playerOnScreen - 1

                    return (
                        <Box key={index} flex="1" h="1" rounded="full"
                             bg={isCurrent ? "manila.300" : isDone ? "manila.300/40" : "bg.muted"}
                             transitionProperty="background-color" transitionDuration="moderate"/>
                    )
                })}
            </HStack>

            <Flex direction="column" flex="1" justify="center" gap="5">
                <Box ref={cardScopeRef}>
                    <RoleCard player={playerOnFront} isRevealed={isRevealed} isSpy={isSpy} term={term}
                              amountOfSpies={deal.spies.length} isBusy={isAnimating} onPress={move}/>
                </Box>

                <Text textAlign="center" color="fg.muted" maxW="20rem" mx="auto" minH="3lh" aria-live="polite">
                    {hintFor(playerOnScreen, amountOfPlayers, isRevealed && !isHandingOver)}
                </Text>
            </Flex>

            <ConfirmDialog open={isExitDialogOpen} setOpen={setIsExitDialogOpen}
                           title="Leave this game?"
                           text="Some players have already seen their role. The next game deals new roles and a new word."
                           confirmLabel="Leave game" cancelLabel="Keep dealing" isDestructive onConfirm={goHome}/>
        </Screen>
    )
}
