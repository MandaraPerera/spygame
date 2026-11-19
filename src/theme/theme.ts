import {createSystem, defaultConfig, defineConfig} from "@chakra-ui/react";

// The app is dark only (see AppProvider); light and dark get the same value so tests, which render
// without the color mode provider, see the same colors as the app.
const fixed = (value: string) => ({value: {_light: value, _dark: value}})

// "Case file at night": midnight-blue surfaces, paper-white text, manila for the one action that matters on
// a screen, and stamp red only for the spy and for destructive actions.
const config = defineConfig({
    globalCss: {
        html: {
            colorPalette: "gray",
            colorScheme: "dark",
            WebkitTapHighlightColor: "transparent",
            textSizeAdjust: "100%"
        },
        body: {
            bg: "bg",
            color: "fg",
            fontFeatureSettings: "'ss01' on",
            overscrollBehaviorY: "none"
        },
        "*, *::before, *::after": {
            _motionReduce: {
                animationDuration: "0.01ms !important",
                animationIterationCount: "1 !important",
                transitionDuration: "0.01ms !important"
            }
        }
    },
    theme: {
        tokens: {
            fonts: {
                heading: {value: "'Archivo Variable', system-ui, sans-serif"},
                body: {value: "'Archivo Variable', system-ui, sans-serif"}
            },
            colors: {
                // A blue-tinted neutral scale replaces Chakra's gray, so every neutral component matches.
                gray: {
                    50: {value: "#EEF2F8"},
                    100: {value: "#DCE3EF"},
                    200: {value: "#BAC6DA"},
                    300: {value: "#95A4BF"},
                    400: {value: "#7484A2"},
                    500: {value: "#586886"},
                    600: {value: "#43516D"},
                    700: {value: "#323F59"},
                    800: {value: "#243049"},
                    900: {value: "#1A2540"},
                    950: {value: "#131C33"}
                },
                manila: {
                    50: {value: "#FBF5E6"},
                    100: {value: "#F6E8C6"},
                    200: {value: "#EFD8A0"},
                    300: {value: "#E8C77A"},
                    400: {value: "#DDB45A"},
                    500: {value: "#C99A3E"},
                    600: {value: "#A47A2E"},
                    700: {value: "#7D5C24"},
                    800: {value: "#57401B"},
                    900: {value: "#362812"},
                    950: {value: "#21180B"}
                },
                midnight: {value: "#0E1629"},
                paper: {value: "#F3EEE2"},
                stamp: {value: "#C42F27"}
            },
            radii: {
                panel: {value: "20px"}
            }
        },
        semanticTokens: {
            colors: {
                bg: {
                    DEFAULT: fixed("{colors.midnight}"),
                    subtle: fixed("{colors.gray.950}"),
                    panel: fixed("{colors.gray.900}"),
                    muted: fixed("{colors.gray.800}"),
                    emphasized: fixed("{colors.gray.700}")
                },
                fg: {
                    DEFAULT: fixed("{colors.paper}"),
                    muted: fixed("{colors.gray.300}"),
                    subtle: fixed("{colors.gray.400}"),
                    inverted: fixed("{colors.gray.950}")
                },
                border: {
                    DEFAULT: fixed("{colors.gray.700}"),
                    muted: fixed("{colors.gray.800}"),
                    subtle: fixed("{colors.gray.800}"),
                    emphasized: fixed("{colors.gray.600}")
                },
                gray: {
                    contrast: fixed("{colors.gray.950}"),
                    fg: fixed("{colors.gray.100}"),
                    subtle: fixed("{colors.gray.800}"),
                    muted: fixed("{colors.gray.700}"),
                    emphasized: fixed("{colors.gray.600}"),
                    solid: fixed("{colors.paper}"),
                    focusRing: fixed("{colors.manila.300}")
                },
                manila: {
                    contrast: fixed("{colors.gray.950}"),
                    fg: fixed("{colors.manila.200}"),
                    subtle: fixed("{colors.manila.950}"),
                    muted: fixed("{colors.manila.900}"),
                    emphasized: fixed("{colors.manila.800}"),
                    solid: fixed("{colors.manila.300}"),
                    focusRing: fixed("{colors.manila.300}")
                }
            },
            radii: {
                l1: {value: "6px"},
                l2: {value: "10px"},
                l3: {value: "14px"}
            }
        },
        textStyles: {
            // Condensed and heavy: the wordmark, the counts and the role card.
            display: {
                value: {
                    fontFamily: "heading",
                    fontStretch: "75%",
                    fontWeight: "800",
                    letterSpacing: "-0.01em",
                    lineHeight: "0.95"
                }
            },
            title: {
                value: {
                    fontFamily: "heading",
                    fontStretch: "87.5%",
                    fontWeight: "700",
                    fontSize: "1.375rem",
                    lineHeight: "1.15",
                    letterSpacing: "-0.005em"
                }
            }
        },
        recipes: {
            button: {
                base: {
                    fontWeight: "semibold",
                    // Press feedback: a slight give that springs back, never on a disabled control.
                    "&:active:not(:disabled):not([data-loading])": {transform: "scale(0.96)"}
                },
                defaultVariants: {size: "lg", variant: "solid"}
            },
            // 16px text in fields keeps iOS from zooming in on focus; 44px keeps them easy to tap.
            // Native selects get size="lg" where they are used.
            input: {defaultVariants: {size: "lg", variant: "outline"}},
            textarea: {defaultVariants: {size: "lg", variant: "outline"}}
        }
    }
})

export const system = createSystem(defaultConfig, config)
