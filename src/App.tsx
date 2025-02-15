import {ChakraProvider} from "@chakra-ui/react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {system} from "./theme/theme.ts";
import {AuthContextProvider, SettingsContextProvider} from "@/context";
import {ColorModeProvider} from "@/components/ui";
import {Home, Play} from "@/components/Play";
import {Auth} from "@/components/Util";
import {Categories} from "@/components/Content";
import {ProtectedRoute} from "./components/Util/ProtectedRoute.tsx";

export function App() {
    return (
        <ChakraProvider value={system}>
            <ColorModeProvider>
                <AuthContextProvider>
                    <SettingsContextProvider>
                        <BrowserRouter>
                            <Routes>
                                <Route path="/" element={<Home/>}/>
                                <Route path="/play" element={<Play/>}/>
                                <Route path="/login" element={<Auth/>}/>
                                <Route path="/categories" element={<ProtectedRoute><Categories/></ProtectedRoute>}/>
                            </Routes>
                        </BrowserRouter>
                    </SettingsContextProvider>
                </AuthContextProvider>
            </ColorModeProvider>
        </ChakraProvider>
    )
}