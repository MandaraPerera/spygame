import {Button, Dialog, Portal, VStack} from "@chakra-ui/react";
import {useContext} from "react";
import {Category} from "@/model";
import {SettingsContext} from "@/context";

interface SelectCategoriesProps {
    open: boolean
    setOpen: (open: boolean) => void
    categories: Category[]
}

export function SelectCategories({open, setOpen, categories}: SelectCategoriesProps) {
    const {selectedCategories, setSelectedCategories} = useContext(SettingsContext);

    const toggleCategory = (category: Category) => {
        if (selectedCategories.some(c => c.value === category.value)) {
            setSelectedCategories(selectedCategories.filter(c => c.value !== category.value))
        } else {
            setSelectedCategories([...selectedCategories, category])
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
                                    .map((category, index) => (
                                        <Button
                                            key={index}
                                            w="100%"
                                            variant={selectedCategories.some(c => c.value === category.value) ? "solid" : "outline"}
                                            onClick={() => toggleCategory(category)}
                                        >
                                            {category.value}
                                        </Button>
                                    ))}
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