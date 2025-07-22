import {ChakraProvider} from "@chakra-ui/react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {system} from "@/theme/theme.ts";
import {AuthContextProvider, SettingsContextProvider} from "@/context";
import {Categories, Logs, ManageData, Suggestions, Terms} from "@/components/Data";
import {Home, HowToPlay, Play} from "@/components/Play";
import {Suggest} from "@/components/Suggest";
import {ColorModeProvider} from "@/components/ui";
import {Auth, GeneralLayout, NotFoundPage} from "@/components/Util";

export function App() {
    return (
        <ChakraProvider value={system}>
            <ColorModeProvider forcedTheme="dark" enableSystem={false}>
                <AuthContextProvider>
                    <SettingsContextProvider>
                        <BrowserRouter>
                            <GeneralLayout>
                                <Routes>
                                    <Route path="/" element={<Home/>}/>
                                    <Route path="/play" element={<Play/>}/>
                                    <Route path="/login" element={<Auth/>}/>
                                    <Route path="/suggest" element={<Suggest/>}/>
                                    <Route path="/how-to-play" element={<HowToPlay/>}/>
                                    <Route path="/manage-data" element={<ManageData/>}/>
                                    <Route path="/categories" element={<Categories/>}/>
                                    <Route path="/terms" element={<Terms/>}/>
                                    <Route path="/suggestions" element={<Suggestions/>}/>
                                    <Route path="/logs" element={<Logs/>}/>
                                    <Route path="*" element={<NotFoundPage/>}/>
                                </Routes>
                            </GeneralLayout>
                        </BrowserRouter>
                    </SettingsContextProvider>
                </AuthContextProvider>
            </ColorModeProvider>
        </ChakraProvider>
    )
}