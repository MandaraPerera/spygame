import {useState} from "react";
import {toaster} from "@/components/ui";
import {useTerms} from "@/hooks";
import type {Category} from "@/model";
import {errorMessage, pluralize, splitLines, validateTermList} from "@/utils";
import {FormDialog} from "./FormDialog";
import {TermLinesField} from "./TermLinesField";

interface AddTermsDialogProps {
    open: boolean
    setOpen: (open: boolean) => void
    category: Category
}

export function AddTermsDialog({open, setOpen, category}: AddTermsDialogProps) {
    const {addTerms} = useTerms([category.id])
    const [termsText, setTermsText] = useState<string>("")
    const [error, setError] = useState<string | null>(null)

    const close = (isOpen: boolean) => {
        setOpen(isOpen)
        if (isOpen) return
        setTermsText("")
        setError(null)
    }

    const submit = async () => {
        const termList = validateTermList(splitLines(termsText))
        if (!termList.ok) {
            setError(termList.error)
            return
        }

        try {
            const {added, skipped} = await addTerms.mutateAsync({category, values: termList.terms})
            if (added.length === 0) {
                setError(`${pluralize(skipped.length, "This term is", "These terms are")} already in ${category.value}`)
                return
            }

            toaster.create({
                type: "success",
                title: `Added ${added.length} ${pluralize(added.length, "term", "terms")} to ${category.value}`,
                description: skipped.length > 0 ? `Already there, skipped: ${skipped.join(", ")}` : undefined
            })
            close(false)
        } catch (addError) {
            toaster.create({type: "error", title: "Could not add the terms", description: errorMessage(addError)})
        }
    }

    return (
        <FormDialog open={open} setOpen={close} title={`Add terms to ${category.value}`} submitLabel="Add"
                    isPending={addTerms.isPending} onSubmit={submit}>
            <TermLinesField value={termsText} onChange={(value) => {
                setTermsText(value)
                setError(null)
            }} error={error} disabled={addTerms.isPending}/>
        </FormDialog>
    )
}
