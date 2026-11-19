import {Box, Flex, Heading} from "@chakra-ui/react";
import type {ReactNode} from "react";

interface TopBarProps {
    title?: ReactNode
    // Usually a back or close button.
    start?: ReactNode
    end?: ReactNode
    // Live text such as "Player 2 of 5" is announced when it changes.
    isTitleLive?: boolean
}

// The bar at the top of every screen. It stays in view while the page scrolls and clears the notch.
export function TopBar({title, start, end, isTitleLive = false}: TopBarProps) {
    return (
        <Flex as="header" position="sticky" top="0" zIndex="sticky" align="center" gap="1"
              mx="-4" ps={start ? "1" : "4"} pe="1"
              pt="env(safe-area-inset-top)" minH="calc(3.5rem + env(safe-area-inset-top))"
              bg="bg/85" backdropFilter="blur(12px)">
            {start}
            <Box flex="1" minW="0">
                {title ? (
                    <Heading as="h1" textStyle="title" truncate aria-live={isTitleLive ? "polite" : undefined}>
                        {title}
                    </Heading>
                ) : null}
            </Box>
            {end}
        </Flex>
    )
}
