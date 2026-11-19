import {Button, Heading, Icon, VStack} from "@chakra-ui/react";
import type {ReactNode} from "react";
import {AiOutlineQuestion} from "react-icons/ai";
import {GiSpy} from "react-icons/gi";

interface PlayCardProps {
    isAnimating: boolean
    isBackCard: boolean
    isSpy: boolean
    isHidden: boolean
    label?: string
    children?: ReactNode
}

// Both faces stay mounted for the flip; the face turned away is hidden from screen readers and the tab order.
export function PlayCard({isAnimating, isBackCard, isSpy, isHidden, label, children}: PlayCardProps) {
    return (
        <Button bgColor="gray.50" color="gray.950" borderRadius="2xl" position="relative"
                pointerEvents={isAnimating ? "none" : "auto"}
                aria-hidden={isHidden}
                aria-label={label}
                tabIndex={isHidden ? -1 : 0}>
            <Icon boxSize="100%" position="absolute" top="0" left="0" zIndex={1} aria-hidden>
                <svg viewBox="0 0 500 500">
                    <path stroke="#111111" strokeWidth="5px" fill="none"
                          d="M460,317.5l0,122.5c0,11.05-8.95,20-20,20l-122.5,0"/>
                    <path stroke="#111111" strokeWidth="5px" fill="none"
                          d="M182.5,460H60c-11.05,0-20-8.95-20-20V317.5"/>
                    <path stroke="#111111" strokeWidth="5px" fill="none"
                          d="M317.5,40H440c11.05,0,20,8.95,20,20v122.5"/>
                    <path stroke="#111111" strokeWidth="5px" fill="none"
                          d="M40,182.5V60c0-11.05,8.95-20,20-20h122.5"/>
                </svg>
            </Icon>
            <VStack width="100%">
                {isBackCard && isSpy ? (
                    <>
                        <Icon boxSize="40%" aria-hidden>
                            <GiSpy/>
                        </Icon>
                        <Heading fontSize="2xl" fontWeight="semibold">YOU'RE A SPY</Heading>
                    </>
                ) : null}
                {isBackCard && !isSpy ? children : null}
                {!isBackCard ? (
                    <Icon boxSize="40%" aria-hidden>
                        <AiOutlineQuestion/>
                    </Icon>
                ) : null}
            </VStack>
        </Button>
    )
}
