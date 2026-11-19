import {HStack, IconButton, Stack, Text, VisuallyHidden} from "@chakra-ui/react";
import {useId} from "react";
import {LuMinus, LuPlus} from "react-icons/lu";

interface CountStepperProps {
    label: string
    hint: string
    value: number
    min: number
    max: number
    onChange: (value: number) => void
    // Read after the number, such as "players".
    unit: string
    decrementLabel: string
    incrementLabel: string
}

// One tap per change, right on the setup screen. The limits disable the buttons instead of raising errors.
export function CountStepper({
                                 label,
                                 hint,
                                 value,
                                 min,
                                 max,
                                 onChange,
                                 unit,
                                 decrementLabel,
                                 incrementLabel
                             }: CountStepperProps) {
    const labelId = useId()

    return (
        <HStack gap="2" px="4" py="3" role="group" aria-labelledby={labelId}>
            <Stack gap="0.5" flex="1" minW="0">
                <Text id={labelId} fontWeight="semibold" textStyle="lg">{label}</Text>
                <Text textStyle="sm" color="fg.muted">{hint}</Text>
            </Stack>
            <IconButton variant="subtle" rounded="full" aria-label={decrementLabel} disabled={value <= min}
                        onClick={() => onChange(value - 1)}>
                <LuMinus/>
            </IconButton>
            <Text textStyle="display" fontSize="2.75rem" minW="2ch" textAlign="center"
                  fontVariantNumeric="tabular-nums" aria-live="polite" aria-atomic="true">
                {value}<VisuallyHidden> {unit}</VisuallyHidden>
            </Text>
            <IconButton variant="subtle" rounded="full" aria-label={incrementLabel} disabled={value >= max}
                        onClick={() => onChange(value + 1)}>
                <LuPlus/>
            </IconButton>
        </HStack>
    )
}
