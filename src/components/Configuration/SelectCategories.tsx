import {Button, Center, DialogRootProvider, SimpleGrid, UseDialogReturn, VStack} from "@chakra-ui/react";
import {DialogBackdrop, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui";
import {Category} from "@/model";
import {useContext, useEffect, useState} from "react";
import {SettingsContext} from "@/context";

interface SelectCategoriesProps {
    dialog: UseDialogReturn;
    categories: Category[];
}

export function SelectCategories({dialog, categories}: SelectCategoriesProps) {
    const {selectedCategories, setSelectedCategories} = useContext(SettingsContext);
    const [categoriesLocal, setCategoriesLocal] = useState<Category[]>([]);

    useEffect(() => {
        if (dialog.open) {
            setCategoriesLocal(selectedCategories);
        }
    }, [selectedCategories, dialog.open]);

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
        dialog.setOpen(false)
    }

    return (
        <DialogRootProvider value={dialog} size={"xs"}>
            <DialogBackdrop/>
            <DialogContent>
                <DialogHeader>
                    <Center>
                        <DialogTitle>Categories</DialogTitle>
                    </Center>
                </DialogHeader>
                <DialogBody>
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
                </DialogBody>
                <DialogFooter>
                    <SimpleGrid w="100%" columns={2} gap={4}>
                        <Button onClick={() => {
                            dialog.setOpen(false)
                        }} variant="outline">Cancel</Button>
                        <Button onClick={() => onSave()}>Save</Button>
                    </SimpleGrid>
                </DialogFooter>
            </DialogContent>
        </DialogRootProvider>
    )
}