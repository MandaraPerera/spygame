import {ChakraProvider} from "@chakra-ui/react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {system} from "./theme/theme.ts";
import {AuthContextProvider, SettingsContextProvider} from "@/context";
import {ColorModeProvider} from "@/components/ui";
import {Home, Play} from "@/components/Play";
import {Auth, GeneralLayout} from "@/components/Util";
import {ProtectedRoute} from "@/components/Util/ProtectedRoute.tsx";
import {ManageData} from "@/components/Data";
import {SuggestData} from "@/components/Suggest";

export function App() {
    return (
        <ChakraProvider value={system}>
            <ColorModeProvider>
                <AuthContextProvider>
                    <SettingsContextProvider>
                        <GeneralLayout>
                            <BrowserRouter>
                                <Routes>
                                    <Route path="/" element={<Home/>}/>
                                    <Route path="/play" element={<Play/>}/>
                                    <Route path="/login" element={<Auth/>}/>
                                    <Route path="/suggest" element={<SuggestData/>}/>
                                    <Route path="/manage-data"
                                           element={<ProtectedRoute><ManageData/></ProtectedRoute>}/>
                                </Routes>
                            </BrowserRouter>
                        </GeneralLayout>
                    </SettingsContextProvider>
                </AuthContextProvider>
            </ColorModeProvider>
        </ChakraProvider>
    )
}