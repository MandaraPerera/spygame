import {Box, HStack, IconButton, Skeleton} from "@chakra-ui/react";
import {LuX} from "react-icons/lu";
import {Screen, TopBar} from "@/components/util";

interface PlaySkeletonProps {
    onExit: () => void
}

export function PlaySkeleton({onExit}: PlaySkeletonProps) {
    const closeButton = (
        <IconButton variant="ghost" aria-label="Leave game" onClick={onExit}>
            <LuX/>
        </IconButton>
    )

    return (
        <Screen header={<TopBar start={closeButton} title={<Skeleton as="span" display="block" h="6" w="10rem"/>}/>}>
            <HStack gap="1.5">
                {Array.from({length: 4}, (_, index) => <Skeleton key={index} flex="1" h="1" rounded="full"/>)}
            </HStack>
            <Box mx="auto" w="min(100%, calc((100dvh - 16rem) * 0.8))" minW="min(100%, 16rem)" aspectRatio="4 / 5">
                <Skeleton w="100%" h="100%" rounded="2xl"/>
            </Box>
            <Skeleton h="5" w="80%" mx="auto"/>
        </Screen>
    )
}
