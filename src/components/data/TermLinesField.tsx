import {Field, Textarea} from "@chakra-ui/react";
import {MAX_TERMS_PER_ADD} from "@/config";
import {pluralize, splitLines} from "@/utils";

interface TermLinesFieldProps {
    value: string
    onChange: (value: string) => void
    error: string | null
    label?: string
    disabled?: boolean
}

// A textarea for several terms at once, one per line, with a running count.
export function TermLinesField({value, onChange, error, label = "Terms", disabled = false}: TermLinesFieldProps) {
    const count = splitLines(value).length

    return (
        <Field.Root invalid={error !== null} disabled={disabled}>
            <Field.Label>{label}</Field.Label>
            <Textarea value={value} rows={6} autoresize maxH="40vh" placeholder={"One term per line"}
                      onChange={(e) => onChange(e.target.value)}/>
            {error ? (
                <Field.ErrorText>{error}</Field.ErrorText>
            ) : (
                <Field.HelperText>
                    {count} {pluralize(count, "term", "terms")} · one per line, at most {MAX_TERMS_PER_ADD}
                </Field.HelperText>
            )}
        </Field.Root>
    )
}
