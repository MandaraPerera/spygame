import {Button, Center} from "@chakra-ui/react";
import {ColorModeButton} from "./ui/color-mode.tsx";
import {useNavigate} from "react-router-dom";

export function Home() {
    const navigate = useNavigate();

    return (
        <Center>
            <Button onClick={() => navigate("/categories")}>Categories</Button>
            <ColorModeButton/>
        </Center>
    )
}