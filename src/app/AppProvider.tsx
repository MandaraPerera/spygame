import {ChakraProvider} from "@chakra-ui/react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import type {ReactNode} from "react";
import {ColorModeProvider} from "@/components/ui";
import {AuthContextProvider, SettingsContextProvider} from "@/context";
import {system} from "@/theme";

interface AppProviderProps {
    children: ReactNode
}

const queryClient = new QueryClient()

export function AppProvider({children}: AppProviderProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <ChakraProvider value={system}>
                <ColorModeProvider forcedTheme="dark" enableSystem={false}>
                    <AuthContextProvider>
                        <SettingsContextProvider>
                            {children}
                        </SettingsContextProvider>
                    </AuthContextProvider>
                </ColorModeProvider>
            </ChakraProvider>
        </QueryClientProvider>
    )
}
