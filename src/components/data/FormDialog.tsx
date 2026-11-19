import {Button, Dialog, Portal, SimpleGrid} from "@chakra-ui/react";
import type {FormEvent, ReactNode} from "react";

interface FormDialogProps {
    open: boolean
    setOpen: (open: boolean) => void
    title: string
    submitLabel: string
    isPending: boolean
    onSubmit: () => void
    children: ReactNode
}

// A dialog around a form: Enter in a single-line field submits, and the dialog stays open while saving.
// On a phone it sits at the top, so the keyboard never covers the fields.
export function FormDialog({open, setOpen, title, submitLabel, isPending, onSubmit, children}: FormDialogProps) {
    const handleSubmit = (event: FormEvent) => {
        event.preventDefault()
        if (!isPending) onSubmit()
    }

    return (
        <Dialog.Root lazyMount open={open} placement={{base: "top", md: "center"}}
                     onOpenChange={(e) => !isPending && setOpen(e.open)}>
            <Portal>
                <Dialog.Backdrop bg="blackAlpha.700"/>
                <Dialog.Positioner px="3" pt="calc(0.75rem + env(safe-area-inset-top))">
                    <Dialog.Content maxW="30rem" w="100%" mt={{base: "0", md: "auto"}} bg="bg.panel" rounded="panel"
                                    asChild>
                        <form onSubmit={handleSubmit} noValidate>
                            <Dialog.Header px="5" pt="5">
                                <Dialog.Title textStyle="title">{title}</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body display="flex" flexDirection="column" gap="4" px="5">
                                {children}
                            </Dialog.Body>
                            <Dialog.Footer px="5" pb="5">
                                <SimpleGrid w="100%" columns={2} gap="2">
                                    <Button variant="outline" disabled={isPending} onClick={() => setOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" colorPalette="manila" loading={isPending}>{submitLabel}</Button>
                                </SimpleGrid>
                            </Dialog.Footer>
                        </form>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}
