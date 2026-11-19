import {Badge, Box, HStack, Text} from "@chakra-ui/react";
import type {Log, LogAction} from "@/model";
import {describeLog, describeLogAuthor, formatDate} from "@/utils";

interface LogItemProps {
    log: Log
    currentUserId: string | null
}

const ACTION_COLORS: Record<LogAction, string> = {
    approved: "green",
    denied: "red",
    created: "teal",
    updated: "blue",
    deleted: "red"
}

export function LogItem({log, currentUserId}: LogItemProps) {
    const {title, detail} = describeLog(log)

    return (
        <Box w="100%" bgColor="gray.900" borderRadius="md" p={3}>
            <HStack justify="space-between" mb={1}>
                <HStack>
                    <Badge colorPalette={log.action ? ACTION_COLORS[log.action] : "gray"}>{log.action ?? "unknown"}</Badge>
                    {log.type ? <Text fontSize="sm">{log.type}</Text> : null}
                </HStack>
                <Text fontSize="xs" fontWeight="light">{formatDate(log.timestamp)}</Text>
            </HStack>
            <Text fontSize="sm" fontWeight="semibold" truncate>{title}</Text>
            {detail ? (
                <Text fontSize="sm" fontWeight="light" lineClamp={2}>{detail}</Text>
            ) : null}
            <Text fontSize="xs" fontWeight="light" mt={1}>
                By {describeLogAuthor(log, currentUserId)}
            </Text>
        </Box>
    )
}
