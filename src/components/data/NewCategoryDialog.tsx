import {Field, Input} from "@chakra-ui/react";
import {useState} from "react";
import {toaster} from "@/components/ui";
import {NAME_MAX_LENGTH} from "@/config";
import {useCategories} from "@/hooks";
import type {Category} from "@/model";
import {checkLength, errorMessage, findCategoryByName, normalizeName, pluralize, splitLines, validateTermList} from "@/utils";
import {FormDialog} from "./FormDialog";
import {TermLinesField} from "./TermLinesField";

interface NewCategoryDialogProps {
    open: boolean
    setOpen: (open: boolean) => void
    categories: Category[]
}

function checkName(name: string, categories: Category[]): string | null {
    if (name.length === 0) return "Name is empty"
    return checkLength(name, "Name") ?? (findCategoryByName(categories, name) ? `"${name}" already exists` : null)
}

export function NewCategoryDialog({open, setOpen, categories}: NewCategoryDialogProps) {
    const {addCategory} = useCategories()
    const [name, setName] = useState<string>("")
    const [termsText, setTermsText] = useState<string>("")
    const [nameError, setNameError] = useState<string | null>(null)
    const [termsError, setTermsError] = useState<string | null>(null)

    const close = (isOpen: boolean) => {
        setOpen(isOpen)
        if (isOpen) return
        setName("")
        setTermsText("")
        setNameError(null)
        setTermsError(null)
    }

    const submit = async () => {
        const value = normalizeName(name)
        const nextNameError = checkName(value, categories)
        const termList = validateTermList(splitLines(termsText))
        setNameError(nextNameError)
        setTermsError(termList.ok ? null : termList.error)
        if (nextNameError || !termList.ok) return

        try {
            const category = await addCategory.mutateAsync({name: value, terms: termList.terms})
            toaster.create({
                type: "success",
                title: `Created ${category.value}`,
                description: `With ${termList.terms.length} ${pluralize(termList.terms.length, "term", "terms")}`
            })
            close(false)
        } catch (createError) {
            toaster.create({type: "error", title: "Could not create the category", description: errorMessage(createError)})
        }
    }

    return (
        <FormDialog open={open} setOpen={close} title="New category" submitLabel="Create"
                    isPending={addCategory.isPending} onSubmit={submit}>
            <Field.Root invalid={nameError !== null} disabled={addCategory.isPending}>
                <Field.Label>Name</Field.Label>
                <Input value={name} maxLength={NAME_MAX_LENGTH} placeholder="Animals" autoComplete="off"
                       onChange={(e) => {
                           setName(e.target.value)
                           setNameError(null)
                       }}/>
                <Field.ErrorText>{nameError}</Field.ErrorText>
            </Field.Root>
            <TermLinesField value={termsText} error={termsError} disabled={addCategory.isPending}
                            onChange={(value) => {
                                setTermsText(value)
                                setTermsError(null)
                            }}/>
        </FormDialog>
    )
}
