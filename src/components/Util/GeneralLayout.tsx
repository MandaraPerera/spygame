import {ReactNode} from "react";
import {Center, VStack} from "@chakra-ui/react";

interface GeneralLayoutProps {
    children: ReactNode;
}

export function GeneralLayout({children}: GeneralLayoutProps) {
    return (
        <Center pt={4}>
            <VStack w="80%" maxW="500px">
                {children}
            </VStack>
        </Center>
    )
}