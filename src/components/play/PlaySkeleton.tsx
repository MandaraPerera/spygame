import {AspectRatio, Button, Heading, Skeleton, Spacer, VStack} from "@chakra-ui/react";

interface PlaySkeletonProps {
    onExit: () => void
}

export function PlaySkeleton({onExit}: PlaySkeletonProps) {
    return (
        <VStack maxW="500px" w="90%" flex={1}>
            <Heading size="3xl" mb={4}>Spy Game</Heading>
            <Skeleton h="5" w="75px" mb={1}/>
            <Skeleton h="5" w="60px" mb={1}/>
            <Skeleton h="5" w="150px" mb={8}/>
            <Skeleton h="5" w="110px" mb={4}/>
            <AspectRatio ratio={1} w="100%" mb={1}>
                <Skeleton w="100%" borderRadius="2xl"/>
            </AspectRatio>
            <Skeleton h="5" w="180px"/>
            <Spacer/>
            <Button w="100%" h="50px" onClick={onExit}>
                EXIT
            </Button>
        </VStack>
    )
}
