"use client"

import * as React from "react"
import type {IconButtonProps, SpanProps} from "@chakra-ui/react"
import {ClientOnly, IconButton, Skeleton, Span} from "@chakra-ui/react"
import type {ThemeProviderProps} from "next-themes"
import {ThemeProvider, useTheme} from "next-themes"
import {LuMoon, LuSun} from "react-icons/lu"

export type ColorModeProviderProps = ThemeProviderProps

export function ColorModeProvider(props: ColorModeProviderProps) {
    return (
        <ThemeProvider attribute="class" disableTransitionOnChange {...props} />
    )
}

type ColorMode = "light" | "dark"

interface UseColorModeReturn {
    colorMode: ColorMode
    setColorMode: (colorMode: ColorMode) => void
    toggleColorMode: () => void
}

function useColorMode(): UseColorModeReturn {
    const {resolvedTheme, setTheme} = useTheme()
    const toggleColorMode = () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark")
    }
    return {
        colorMode: resolvedTheme as ColorMode,
        setColorMode: setTheme,
        toggleColorMode,
    }
}

function ColorModeIcon() {
    const {colorMode} = useColorMode()
    return colorMode === "dark" ? <LuMoon/> : <LuSun/>
}

type ColorModeButtonProps = Omit<IconButtonProps, "aria-label">
React.forwardRef<
    HTMLButtonElement,
    ColorModeButtonProps
>(function ColorModeButton(props, ref) {
    const {toggleColorMode} = useColorMode()
    return (
        <ClientOnly fallback={<Skeleton boxSize="8"/>}>
            <IconButton
                onClick={toggleColorMode}
                variant="ghost"
                aria-label="Toggle color mode"
                size="sm"
                ref={ref}
                {...props}
                css={{
                    _icon: {
                        width: "5",
                        height: "5",
                    },
                }}
            >
                <ColorModeIcon/>
            </IconButton>
        </ClientOnly>
    )
});
React.forwardRef<HTMLSpanElement, SpanProps>(
    function LightMode(props, ref) {
        return (
            <Span
                color="fg"
                display="contents"
                className="chakra-theme light"
                colorPalette="gray"
                colorScheme="light"
                ref={ref}
                {...props}
            />
        )
    },
);
React.forwardRef<HTMLSpanElement, SpanProps>(
    function DarkMode(props, ref) {
        return (
            <Span
                color="fg"
                display="contents"
                className="chakra-theme dark"
                colorPalette="gray"
                colorScheme="dark"
                ref={ref}
                {...props}
            />
        )
    },
);