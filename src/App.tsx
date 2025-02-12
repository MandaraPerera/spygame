import {system} from "./theme/theme.ts";
import {ChakraProvider} from "@chakra-ui/react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {Home} from "./components/Home/Home.tsx";

export function App() {
    return (
        <ChakraProvider value={system}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                </Routes>
            </BrowserRouter>
        </ChakraProvider>
    )
}