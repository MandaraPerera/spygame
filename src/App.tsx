import {ChakraProvider} from "@chakra-ui/react";
import {system} from "./theme/theme.ts";
import {Home} from "./components/Home.tsx";
import {ColorModeProvider} from "./components/ui/color-mode.tsx";
import {SettingsContextProvider} from "./context/SettingsContextProvider.tsx";

export function App() {
    return (
        <ChakraProvider value={system}>
            <ColorModeProvider>
                <SettingsContextProvider>
                    <Home/>
                </SettingsContextProvider>
            </ColorModeProvider>
        </ChakraProvider>
    )
}