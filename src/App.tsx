import {ChakraProvider} from "@chakra-ui/react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {system} from "@/theme/theme.ts";
import {AuthContextProvider, SettingsContextProvider} from "@/context";
import {ManageData} from "@/components/Data";
import {Home, Play} from "@/components/Play";
import {SuggestData} from "@/components/Suggest";
import {ColorModeProvider} from "@/components/ui";
import {Auth, GeneralLayout, ProtectedRoute} from "@/components/Util";

export function App() {
    return (
        <ChakraProvider value={system}>
            <ColorModeProvider>
                <AuthContextProvider>
                    <SettingsContextProvider>
                        <BrowserRouter>
                            <GeneralLayout>
                                <Routes>
                                    <Route path="/" element={<Home/>}/>
                                    <Route path="/play" element={<Play/>}/>
                                    <Route path="/login" element={<Auth/>}/>
                                    <Route path="/suggest" element={<SuggestData/>}/>
                                    <Route path="/manage-data"
                                           element={<ProtectedRoute><ManageData/></ProtectedRoute>}/>
                                </Routes>
                            </GeneralLayout>
                        </BrowserRouter>
                    </SettingsContextProvider>
                </AuthContextProvider>
            </ColorModeProvider>
        </ChakraProvider>
    )
}