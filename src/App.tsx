import {ChakraProvider} from "@chakra-ui/react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {system} from "./theme/theme.ts";
import {Home} from "./components/Home.tsx";
import {ColorModeProvider} from "./components/ui/color-mode.tsx";
import {Categories} from "./components/Categories.tsx";

export function App() {
    return (
        <ChakraProvider value={system}>
            <ColorModeProvider>

                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/categories" element={<Categories/>}/>
                    </Routes>
                </BrowserRouter>
            </ColorModeProvider>
        </ChakraProvider>
    )
}