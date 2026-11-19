import {Flex} from "@chakra-ui/react";
import type {ReactNode} from "react";
import {Toaster} from "@/components/ui";
import {ConsentBanner} from "./ConsentBanner";

interface GeneralLayoutProps {
    children: ReactNode;
}

// One phone-width column for every page; on a wider screen it stays centered at that width.
export function GeneralLayout({children}: GeneralLayoutProps) {
    return (
        <>
            <Flex as="main" direction="column" w="100%" maxW="30rem" minH="100dvh" mx="auto"
                  ps="max(1rem, env(safe-area-inset-left))" pe="max(1rem, env(safe-area-inset-right))">
                {children}
            </Flex>
            <Toaster/>
            <ConsentBanner/>
        </>
    )
}
