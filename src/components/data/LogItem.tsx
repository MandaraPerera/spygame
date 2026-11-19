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
        <Box px="4" py="3">
            <HStack justify="space-between" mb={1}>
                <HStack>
                    <Badge variant="subtle" colorPalette={log.action ? ACTION_COLORS[log.action] : "gray"}>{log.action ?? "unknown"}</Badge>
                    {log.type ? <Text textStyle="sm" color="fg.muted">{log.type}</Text> : null}
                </HStack>
                <Text textStyle="xs" color="fg.muted">{formatDate(log.timestamp)}</Text>
            </HStack>
            <Text fontWeight="semibold" truncate>{title}</Text>
            {detail ? (
                <Text textStyle="sm" color="fg.muted" lineClamp={2}>{detail}</Text>
            ) : null}
            <Text textStyle="xs" color="fg.muted" mt="1">
                By {describeLogAuthor(log, currentUserId)}
            </Text>
        </Box>
    )
}
