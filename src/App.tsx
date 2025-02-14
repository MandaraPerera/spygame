import {ChakraProvider} from "@chakra-ui/react";
import {system} from "./theme/theme.ts";
import {SettingsContextProvider} from "@/context";
import {ColorModeProvider} from "@/components/ui";
import {Home, Play} from "@/components/Play";
import {BrowserRouter, Route, Routes} from "react-router-dom";

export function App() {
    return (
        <ChakraProvider value={system}>
            <ColorModeProvider>
                <SettingsContextProvider>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={<Home/>}/>
                            <Route path="/play" element={<Play/>}/>
                        </Routes>
                    </BrowserRouter>
                </SettingsContextProvider>
            </ColorModeProvider>
        </ChakraProvider>
    )
}