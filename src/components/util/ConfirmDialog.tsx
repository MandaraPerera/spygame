import {Button, Dialog, Portal, SimpleGrid, Text} from "@chakra-ui/react";

interface ConfirmDialogProps {
    open: boolean
    setOpen: (open: boolean) => void
    title: string
    text: string
    confirmLabel: string
    onConfirm: () => void
    isPending?: boolean
    isDestructive?: boolean
}

export function ConfirmDialog({
                                  open,
                                  setOpen,
                                  title,
                                  text,
                                  confirmLabel,
                                  onConfirm,
                                  isPending = false,
                                  isDestructive = false
                              }: ConfirmDialogProps) {
    return (
        <Dialog.Root lazyMount open={open} onOpenChange={(e) => setOpen(e.open)} placement="center">
            <Portal>
                <Dialog.Backdrop/>
                <Dialog.Positioner>
                    <Dialog.Content maxW="500px" w="90%">
                        <Dialog.Header>
                            <Dialog.Title>{title}</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Text>{text}</Text>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <SimpleGrid w="100%" columns={2} gap={4}>
                                <Dialog.ActionTrigger asChild>
                                    <Button variant="outline">Cancel</Button>
                                </Dialog.ActionTrigger>
                                <Button colorPalette={isDestructive ? "red" : undefined}
                                        loading={isPending}
                                        onClick={onConfirm}>
                                    {confirmLabel}
                                </Button>
                            </SimpleGrid>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}
