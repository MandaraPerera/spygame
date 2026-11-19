import {Box, chakra, Flex, HStack, Icon, Text} from "@chakra-ui/react";
import type {ReactNode} from "react";
import {LuPointer} from "react-icons/lu";

interface RoleCardProps {
    // The number on the front of the file.
    player: number
    // Which face is up once the current flip is done.
    isRevealed: boolean
    isSpy: boolean
    term: string
    amountOfSpies: number
    isBusy: boolean
    onPress: () => void
}

const INK = "gray.950"
const FACE_STYLE = {backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden"} as const

interface FaceProps {
    isBack?: boolean
    isHidden: boolean
    children: ReactNode
}

// A folder: a darker tab behind a sheet. The front is the closed manila file, the back the paper inside.
function Face({isBack = false, isHidden, children}: FaceProps) {
    return (
        <Flex direction="column" position="absolute" inset="0" aria-hidden={isHidden}
              transform={isBack ? "rotateY(180deg)" : undefined} style={FACE_STYLE}>
            <Box h="7%" w="42%" flexShrink={0} ms={isBack ? "51%" : "7%"} bg="manila.400" roundedTop="xl"/>
            <Flex direction="column" flex="1" position="relative" p="6" rounded="2xl" color={INK}
                  bg={isBack ? "paper" : "manila.300"} containerType="inline-size"
                  boxShadow="0 28px 48px -16px rgba(0, 0, 0, 0.7)">
                <Box position="absolute" inset="3" rounded="xl" borderWidth="1px" borderColor="gray.950/15"
                     pointerEvents="none"/>
                {children}
            </Flex>
        </Flex>
    )
}

// Scales the word to the card: the longest word has to fit on one line.
function wordSize(term: string): string {
    const longestWord = Math.max(4, ...term.split(" ").map((word) => word.length))
    return `min(4rem, ${Math.floor(180 / longestWord)}cqi)`
}

function spiesSentence(amountOfSpies: number): string {
    return amountOfSpies === 1 ? "One player is the spy." : `${amountOfSpies} players are spies.`
}

export function RoleCard({
                             player,
                             isRevealed,
                             isSpy,
                             term,
                             amountOfSpies,
                             isBusy,
                             onPress
                         }: RoleCardProps) {
    return (
        <chakra.button type="button" onClick={onPress} aria-disabled={isBusy || undefined}
                       display="block" position="relative" mx="auto" aspectRatio="4 / 5" cursor="pointer"
                       textAlign="start"
                       w="min(100%, calc((100dvh - 16rem) * 0.8))" minW="min(100%, 16rem)"
                       rounded="2xl" focusVisibleRing="outside" focusRingColor="manila.300"
                       transitionProperty="transform" transitionDuration="fast" transitionTimingFunction="ease-out"
                       css={{"&:active:not([aria-disabled])": {transform: "scale(0.98)"}}}
                       style={{perspective: "1600px"}}>
            {/* The Play page flips data-card-flip and lands data-card-mark, the word or the stamp, as it opens. */}
            <Box data-card-flip="" position="absolute" inset="0" style={{transformStyle: "preserve-3d"}}>
                <Face isHidden={isRevealed}>
                    <Text textStyle="sm" fontWeight="semibold" color="gray.950/70">Player</Text>
                    <Text textStyle="display" fontSize="min(10rem, 58cqi)" lineHeight="0.85" mt="1">
                        {player}
                    </Text>
                    <HStack mt="auto" gap="2">
                        <Icon boxSize="5" aria-hidden><LuPointer/></Icon>
                        <Text fontWeight="semibold">Tap to open your file</Text>
                    </HStack>
                </Face>

                <Face isBack isHidden={!isRevealed}>
                    {isSpy ? (
                        <>
                            <Text textStyle="sm" fontWeight="semibold" color="gray.950/70">Your role</Text>
                            <Flex flex="1" align="center" justify="center">
                                <Box transform="rotate(-8deg)">
                                    <Box data-card-mark="" borderWidth="5px" borderColor="stamp" color="stamp" rounded="lg"
                                         px="4" pt="1">
                                        <Text textStyle="display" fontSize="min(6rem, 34cqi)" letterSpacing="0.04em">
                                            SPY
                                        </Text>
                                    </Box>
                                </Box>
                            </Flex>
                            <Text textStyle="sm" color="gray.950/80">
                                You don't know the word. Blend in and work out what it is.
                            </Text>
                        </>
                    ) : (
                        <>
                            <Text textStyle="sm" fontWeight="semibold" color="gray.950/70">Your word</Text>
                            <Flex flex="1" align="center">
                                <Box data-card-mark="">
                                    <Text textStyle="display" fontSize={wordSize(term)} lineHeight="1"
                                          overflowWrap="anywhere">
                                        {term}
                                    </Text>
                                </Box>
                            </Flex>
                            <Text textStyle="sm" color="gray.950/80">
                                {spiesSentence(amountOfSpies)} Ask and answer without giving the word away.
                            </Text>
                        </>
                    )}
                </Face>
            </Box>
        </chakra.button>
    )
}
