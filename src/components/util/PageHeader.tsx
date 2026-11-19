import {Flex, Heading, HStack, IconButton} from "@chakra-ui/react";
import {FaTimes} from "react-icons/fa";
import {FaArrowLeftLong} from "react-icons/fa6";
import {useNavigate} from "react-router-dom";

interface PageHeaderProps {
    title: string
    backTo?: string
    closeTo?: string
    mb?: number
}

export function PageHeader({title, backTo, closeTo, mb = 12}: PageHeaderProps) {
    const navigate = useNavigate()

    return (
        <HStack justify="space-between" w="100%" mb={mb}>
            <Flex flex={1} justify="start">
                {backTo ? (
                    <IconButton variant="plain" ml="-10px" aria-label="Back" onClick={() => navigate(backTo)}>
                        <FaArrowLeftLong/>
                    </IconButton>
                ) : null}
            </Flex>
            <Heading size="3xl" textAlign="center">{title}</Heading>
            <Flex flex={1} justify="end">
                {closeTo ? (
                    <IconButton variant="plain" mr="-10px" aria-label="Close" onClick={() => navigate(closeTo)}>
                        <FaTimes/>
                    </IconButton>
                ) : null}
            </Flex>
        </HStack>
    )
}
