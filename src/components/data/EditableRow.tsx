import {Badge, Box, Editable, HStack, IconButton} from "@chakra-ui/react";
import {type ReactNode, useState} from "react";
import {LuCheck, LuPencilLine, LuTrash2, LuX} from "react-icons/lu";
import {ConfirmDialog} from "@/components/util";
import {NAME_MAX_LENGTH} from "@/config";

interface EditableRowProps {
    value: string
    badge?: string
    deleteTitle: string
    deleteText: string
    isBusy: boolean
    onRename: (value: string) => Promise<boolean>
    onDelete: () => Promise<void>
    // Shown under the name, such as a term count.
    children?: ReactNode
}

// One row of the admin lists: rename in place, or delete after a confirmation.
export function EditableRow({value, badge, deleteTitle, deleteText, isBusy, onRename, onDelete, children}: EditableRowProps) {
    const [draft, setDraft] = useState<string>(value)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)

    const commit = async (nextValue: string) => {
        if (nextValue === value) return

        const isRenamed = await onRename(nextValue)
        if (!isRenamed) setDraft(value)
    }

    const confirmDelete = async () => {
        await onDelete()
        setIsDeleteDialogOpen(false)
    }

    return (
        <Box ps="4" pe="2" py="2.5">
            <HStack gap="1">
                <Editable.Root flex="1" minW="0" size="lg" value={draft} maxLength={NAME_MAX_LENGTH} disabled={isBusy}
                               onValueChange={(e) => setDraft(e.value)}
                               onValueCommit={(e) => commit(e.value)}
                               onValueRevert={() => setDraft(value)}>
                    <Editable.Preview truncate fontWeight="semibold" ms="-2" px="2"/>
                    <Editable.Input aria-label={`Rename ${value}`}/>
                    <Editable.Control>
                        <Editable.EditTrigger asChild>
                            <IconButton variant="ghost" color="fg.muted" aria-label={`Rename ${value}`}>
                                <LuPencilLine/>
                            </IconButton>
                        </Editable.EditTrigger>
                        <Editable.CancelTrigger asChild>
                            <IconButton variant="outline" aria-label="Cancel">
                                <LuX/>
                            </IconButton>
                        </Editable.CancelTrigger>
                        <Editable.SubmitTrigger asChild>
                            <IconButton colorPalette="manila" aria-label="Save">
                                <LuCheck/>
                            </IconButton>
                        </Editable.SubmitTrigger>
                    </Editable.Control>
                </Editable.Root>
                <IconButton variant="ghost" color="fg.muted" aria-label={`Delete ${value}`} disabled={isBusy}
                            onClick={() => setIsDeleteDialogOpen(true)}>
                    <LuTrash2/>
                </IconButton>
            </HStack>
            {children || badge ? (
                <HStack gap="2" mt="0.5" wrap="wrap">
                    {children}
                    {badge ? <Badge variant="subtle">{badge}</Badge> : null}
                </HStack>
            ) : null}
            <ConfirmDialog open={isDeleteDialogOpen} setOpen={setIsDeleteDialogOpen}
                           title={deleteTitle} text={deleteText} confirmLabel="Delete" isDestructive
                           isPending={isBusy} onConfirm={confirmDelete}/>
        </Box>
    )
}
