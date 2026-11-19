import {Stack, StackSeparator, type StackProps} from "@chakra-ui/react";

// Rows grouped on one surface, divided by inset lines, like a phone's settings list.
export function ListPanel({children, ...props}: StackProps) {
    return (
        <Stack gap="0" bg="bg.panel" rounded="panel" overflow="hidden"
               separator={<StackSeparator borderColor="border.muted" ms="4"/>} {...props}>
            {children}
        </Stack>
    )
}
