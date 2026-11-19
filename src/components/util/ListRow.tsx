import {Box, chakra, Icon, Stack, type SystemStyleObject, Text} from "@chakra-ui/react";
import type {ReactNode} from "react";
import {LuChevronRight} from "react-icons/lu";
import {Link as RouterLink} from "react-router-dom";

interface ListRowProps {
    label: ReactNode
    description?: ReactNode
    icon?: ReactNode
    // Shown before the chevron, such as a count or a switch.
    end?: ReactNode
    to?: string
    onClick?: () => void
    ariaLabel?: string
}

const ROW_CSS: SystemStyleObject = {
    display: "flex",
    alignItems: "center",
    gap: "3",
    w: "100%",
    minH: "14",
    px: "4",
    py: "3",
    textAlign: "start",
    color: "fg",
    transitionProperty: "background-color",
    transitionDuration: "fast",
    focusVisibleRing: "inside"
}

// Touch screens keep :hover after a tap, so the hover tint is only for pointers that can hover.
const PRESSABLE_CSS: SystemStyleObject = {
    ...ROW_CSS,
    cursor: "pointer",
    _active: {bg: "bg.muted"},
    "@media (hover: hover)": {_hover: {bg: "bg.muted/60"}}
}

export function ListRow({label, description, icon, end, to, onClick, ariaLabel}: ListRowProps) {
    const isPressable = to !== undefined || onClick !== undefined

    const content = (
        <>
            {icon ? (
                <Icon boxSize="5" color="fg.muted" flexShrink={0} aria-hidden>
                    {icon}
                </Icon>
            ) : null}
            <Stack gap="0.5" flex="1" minW="0">
                <Text fontWeight="semibold">{label}</Text>
                {description ? <Text textStyle="sm" color="fg.muted" lineClamp={2}>{description}</Text> : null}
            </Stack>
            {end}
            {isPressable ? (
                <Icon boxSize="5" color="fg.subtle" flexShrink={0} aria-hidden>
                    <LuChevronRight/>
                </Icon>
            ) : null}
        </>
    )

    if (to !== undefined) {
        return (
            <Box asChild css={PRESSABLE_CSS}>
                <RouterLink to={to} aria-label={ariaLabel}>{content}</RouterLink>
            </Box>
        )
    }

    if (onClick !== undefined) {
        return (
            <chakra.button type="button" onClick={onClick} aria-label={ariaLabel} css={PRESSABLE_CSS}>
                {content}
            </chakra.button>
        )
    }

    return <Box css={ROW_CSS}>{content}</Box>
}
