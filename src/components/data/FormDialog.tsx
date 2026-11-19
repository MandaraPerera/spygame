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
export function FormDialog({open, setOpen, title, submitLabel, isPending, onSubmit, children}: FormDialogProps) {
    const handleSubmit = (event: FormEvent) => {
        event.preventDefault()
        if (!isPending) onSubmit()
    }

    return (
        <Dialog.Root lazyMount open={open} placement="center"
                     onOpenChange={(e) => !isPending && setOpen(e.open)}>
            <Portal>
                <Dialog.Backdrop/>
                <Dialog.Positioner>
                    <Dialog.Content maxW="500px" w="90%" asChild>
                        <form onSubmit={handleSubmit} noValidate>
                            <Dialog.Header>
                                <Dialog.Title>{title}</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body display="flex" flexDirection="column" gap={4}>
                                {children}
                            </Dialog.Body>
                            <Dialog.Footer>
                                <SimpleGrid w="100%" columns={2} gap={4}>
                                    <Button variant="outline" disabled={isPending} onClick={() => setOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" loading={isPending}>{submitLabel}</Button>
                                </SimpleGrid>
                            </Dialog.Footer>
                        </form>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}
