import {Button} from "@chakra-ui/react";
import {Sheet} from "./Sheet";

interface ConfirmDialogProps {
    open: boolean
    setOpen: (open: boolean) => void
    title: string
    text: string
    confirmLabel: string
    cancelLabel?: string
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
                                  cancelLabel = "Cancel",
                                  onConfirm,
                                  isPending = false,
                                  isDestructive = false
                              }: ConfirmDialogProps) {
    return (
        <Sheet open={open} setOpen={setOpen} title={title} description={text} isLocked={isPending}
               footer={(
                   <>
                       <Button size="xl" colorPalette={isDestructive ? "red" : "manila"} loading={isPending}
                               onClick={onConfirm}>
                           {confirmLabel}
                       </Button>
                       <Button size="xl" variant="ghost" disabled={isPending} onClick={() => setOpen(false)}>
                           {cancelLabel}
                       </Button>
                   </>
               )}/>
    )
}
