import {ChakraProvider} from "@chakra-ui/react";
import {system} from "./theme/theme.ts";
import {SettingsContextProvider} from "@/context";
import {ColorModeProvider} from "@/components/ui";
import {Home} from "@/components/Play";

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