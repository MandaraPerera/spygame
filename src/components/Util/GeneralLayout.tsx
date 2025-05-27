import {ReactNode, useEffect} from "react";
import {useBreakpointValue, VStack} from "@chakra-ui/react";
import {Toaster} from "@/components/ui";

interface GeneralLayoutProps {
    children: ReactNode;
}

export function GeneralLayout({children}: GeneralLayoutProps) {
    const isMobile = useBreakpointValue({base: true, sm: false})

    useEffect(() => {
        if (isMobile) {
            const actualVh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${actualVh}px`);
        } else {
            const handleLayout = () => {
                const actualVh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${actualVh}px`);
            }
            window.addEventListener("resize", handleLayout)
            return () => window.removeEventListener("resize", handleLayout)
        }
    })

    return (
        <>
            <VStack minH={`calc(var(--vh, 1vh) * 100)`} display="flex" alignItems="center" px={4} py={16}>
                <VStack w="100%" flex={1}>
                    {children}
                </VStack>
            </VStack>
            <Toaster/>
        </>
    )
}