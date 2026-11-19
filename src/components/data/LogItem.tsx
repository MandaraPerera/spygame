import {Badge, Box, HStack, Text} from "@chakra-ui/react";
import type {Log} from "@/model";
import {formatDate} from "@/utils";

interface LogItemProps {
    log: Log
    currentUserId: string | null
}

const ACTION_COLORS: Record<Log["action"], string> = {
    approved: "green",
    denied: "red",
    updated: "blue",
    deleted: "red"
}

export function LogItem({log, currentUserId}: LogItemProps) {
    return (
        <Box w="100%" bgColor="gray.900" borderRadius="md" p={3}>
            <HStack justify="space-between" mb={1}>
                <HStack>
                    <Badge colorPalette={ACTION_COLORS[log.action]}>{log.action}</Badge>
                    <Text fontSize="sm">{log.type}</Text>
                </HStack>
                <Text fontSize="xs" fontWeight="light">{formatDate(log.timestamp)}</Text>
            </HStack>
            <Text fontSize="sm" fontWeight="semibold" truncate>
                {log.category}{log.isNewCategory ? " (New)" : ""}
            </Text>
            {log.terms.length > 0 ? (
                <Text fontSize="sm" fontWeight="light" lineClamp={2}>{log.terms.join(", ")}</Text>
            ) : null}
            <Text fontSize="xs" fontWeight="light" mt={1}>
                By {log.userId === currentUserId ? "you" : `admin ${log.userId.slice(0, 6)}`}
            </Text>
        </Box>
    )
}
