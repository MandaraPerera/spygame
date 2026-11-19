import {Button, Dialog, Portal, VStack} from "@chakra-ui/react";
import {useContext} from "react";
import {SettingsContext} from "@/context";
import type {Category} from "@/model";

interface SelectCategoriesProps {
    open: boolean
    setOpen: (open: boolean) => void
    categories: Category[]
}

export function SelectCategories({open, setOpen, categories}: SelectCategoriesProps) {
    const {selectedCategoryIds, setSelectedCategoryIds} = useContext(SettingsContext);

    const toggleCategory = (category: Category) => {
        if (selectedCategoryIds.includes(category.id)) {
            setSelectedCategoryIds(selectedCategoryIds.filter((id) => id !== category.id))
        } else {
            setSelectedCategoryIds([...selectedCategoryIds, category.id])
        }
    }

    return (
        <Dialog.Root lazyMount open={open} onOpenChange={(e) => setOpen(e.open)}>
            <Portal>
                <Dialog.Backdrop/>
                <Dialog.Positioner>
                    <Dialog.Content maxW="500px" w="90%">
                        <Dialog.Header>
                            <Dialog.Title>Categories</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <VStack>
                                {categories
                                    .slice()
                                    .sort((a, b) => a.value.localeCompare(b.value))
                                    .map((category) => {
                                        const isSelected = selectedCategoryIds.includes(category.id)

                                        return (
                                            <Button
                                                key={category.id}
                                                w="100%"
                                                aria-pressed={isSelected}
                                                variant={isSelected ? "solid" : "outline"}
                                                onClick={() => toggleCategory(category)}
                                            >
                                                {category.value}
                                            </Button>
                                        )
                                    })}
                            </VStack>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button variant="solid" w="100%">
                                    Close
                                </Button>
                            </Dialog.ActionTrigger>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}
