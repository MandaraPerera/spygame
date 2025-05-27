import {Button, Dialog, Portal, SimpleGrid, VStack} from "@chakra-ui/react";
import {useContext, useEffect, useState} from "react";
import {Category} from "@/model";
import {SettingsContext} from "@/context";

interface SelectCategoriesProps {
    open: boolean
    setOpen: (open: boolean) => void
    categories: Category[]
}

export function SelectCategories({open, setOpen, categories}: SelectCategoriesProps) {
    const {selectedCategories, setSelectedCategories} = useContext(SettingsContext);
    const [categoriesLocal, setCategoriesLocal] = useState<Category[]>([]);

    useEffect(() => {
        if (open) {
            setCategoriesLocal(selectedCategories);
        }
    }, [selectedCategories, open]);

    const toggleCategory = (category: Category) => {
        setCategoriesLocal((prevCategories) => {
            const isSelected = prevCategories.some(c => c.value === category.value);

            if (isSelected) {
                return prevCategories.filter(c => c.value !== category.value);
            } else {
                return [...prevCategories, category];
            }
        })
    }

    const onSave = () => {
        setSelectedCategories(categoriesLocal);
        setOpen(false)
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
                                            variant={categoriesLocal.some(c => c.value === category.value) ? "solid" : "outline"}
                                            onClick={() => toggleCategory(category)}
                                        >
                                            {category.value}
                                        </Button>
                                    ))}
                            </VStack>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <SimpleGrid w="100%" columns={2} gap={4}>
                                <Button onClick={() => {
                                    setOpen(false)
                                }} variant="outline">Cancel</Button>
                                <Button onClick={() => onSave()}>Save</Button>
                            </SimpleGrid>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}