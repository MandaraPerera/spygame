import {Badge, Editable, HStack, IconButton} from "@chakra-ui/react";
import {useState} from "react";
import {FaTrash} from "react-icons/fa";
import {LuCheck, LuPencilLine, LuX} from "react-icons/lu";
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
}

// One row of the admin lists: rename in place, or delete after a confirmation.
export function EditableRow({value, badge, deleteTitle, deleteText, isBusy, onRename, onDelete}: EditableRowProps) {
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
        <HStack w="100%" justify="space-between">
            <Editable.Root value={draft} maxLength={NAME_MAX_LENGTH} disabled={isBusy}
                           onValueChange={(e) => setDraft(e.value)}
                           onValueCommit={(e) => commit(e.value)}
                           onValueRevert={() => setDraft(value)}>
                <Editable.Preview/>
                <Editable.Input aria-label={`Rename ${value}`}/>
                <Editable.Control>
                    <Editable.EditTrigger asChild>
                        <IconButton variant="ghost" size="sm" aria-label={`Rename ${value}`}>
                            <LuPencilLine/>
                        </IconButton>
                    </Editable.EditTrigger>
                    <Editable.CancelTrigger asChild>
                        <IconButton variant="outline" size="sm" aria-label="Cancel">
                            <LuX/>
                        </IconButton>
                    </Editable.CancelTrigger>
                    <Editable.SubmitTrigger asChild>
                        <IconButton variant="outline" size="sm" aria-label="Save">
                            <LuCheck/>
                        </IconButton>
                    </Editable.SubmitTrigger>
                </Editable.Control>
            </Editable.Root>
            {badge ? <Badge>{badge}</Badge> : null}
            <IconButton variant="outline" size="sm" aria-label={`Delete ${value}`} disabled={isBusy}
                        onClick={() => setIsDeleteDialogOpen(true)}>
                <FaTrash/>
            </IconButton>

            <ConfirmDialog open={isDeleteDialogOpen} setOpen={setIsDeleteDialogOpen}
                           title={deleteTitle} text={deleteText} confirmLabel="Delete" isDestructive
                           isPending={isBusy} onConfirm={confirmDelete}/>
        </HStack>
    )
}
