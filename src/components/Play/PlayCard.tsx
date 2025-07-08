import {ReactNode} from "react";
import {Button, Heading, Icon, VStack} from "@chakra-ui/react";
import {GiSpy} from "react-icons/gi";
import {AiOutlineQuestion} from "react-icons/ai";

interface PlayCardProps {
    isAnimating: boolean
    backCard: boolean
    isSpy: boolean
    children?: ReactNode
}

export function PlayCard({isAnimating, backCard, isSpy, children}: PlayCardProps) {
    return (
        <Button bgColor="gray.50" color="gray.950" borderRadius="2xl"
                pointerEvents={isAnimating ? "none" : "auto"} position="relative">
            <Icon boxSize="100%" position="absolute" top="0" left="0" zIndex={1}>
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
                {backCard ?
                    (isSpy ?
                            <>
                                <Icon boxSize="40%">
                                    <GiSpy/>
                                </Icon>
                                <Heading fontSize="2xl" fontWeight="semibold">YOU'RE A SPY</Heading>
                            </> : children
                    ) :
                    <>
                        <Icon boxSize="40%">
                            <AiOutlineQuestion/>
                        </Icon>
                        {children}
                    </>
                }
            </VStack>
        </Button>
    )
}