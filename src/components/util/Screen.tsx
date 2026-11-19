import {Flex, Stack} from "@chakra-ui/react";
import type {ReactNode} from "react";

interface ScreenProps {
    header?: ReactNode
    // The screen's main action. It stays at the bottom, in reach of the thumb.
    footer?: ReactNode
    // Centers the content vertically, for short screens such as the role card or a message.
    isCentered?: boolean
    children: ReactNode
}

export function Screen({header, footer, isCentered = false, children}: ScreenProps) {
    return (
        <>
            {header}
            <Flex direction="column" flex="1" gap="6" pt="2" justify={isCentered ? "center" : "start"}
                  pb={footer ? "2" : "calc(1.5rem + env(safe-area-inset-bottom))"}>
                {children}
            </Flex>
            {footer ? (
                <Stack position="sticky" bottom="0" zIndex="docked" gap="2" mx="-4" px="4" pt="5"
                       pb="calc(1rem + env(safe-area-inset-bottom))"
                       bgGradient="to-t" gradientFrom="bg" gradientVia="bg" gradientTo="transparent">
                    {footer}
                </Stack>
            ) : null}
        </>
    )
}
