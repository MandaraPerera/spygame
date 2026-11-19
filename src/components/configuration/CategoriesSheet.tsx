import {Button, Flex, HStack, Text} from "@chakra-ui/react";
import {useContext} from "react";
import {LuCheck, LuPlus} from "react-icons/lu";
import {Sheet} from "@/components/util";
import {SettingsContext} from "@/context";
import type {Category} from "@/model";

interface CategoriesSheetProps {
    open: boolean
    setOpen: (open: boolean) => void
    categories: Category[]
}

export function CategoriesSheet({open, setOpen, categories}: CategoriesSheetProps) {
    const {selectedCategoryIds, setSelectedCategoryIds} = useContext(SettingsContext);
    const sortedCategories = categories.slice().sort((a, b) => a.value.localeCompare(b.value))
    // Ids of categories that no longer exist are not counted.
    const selectedCount = sortedCategories.filter((category) => selectedCategoryIds.includes(category.id)).length
    const isAllSelected = categories.length > 0 && selectedCount === categories.length

    const toggleCategory = (category: Category) => {
        if (selectedCategoryIds.includes(category.id)) {
            setSelectedCategoryIds(selectedCategoryIds.filter((id) => id !== category.id))
        } else {
            setSelectedCategoryIds([...selectedCategoryIds, category.id])
        }
    }

    const toggleAll = () => {
        setSelectedCategoryIds(isAllSelected ? [] : categories.map((category) => category.id))
    }

    return (
        <Sheet open={open} setOpen={setOpen} title="Categories"
               description="The secret word comes from one of the categories you pick."
               footer={<Button size="xl" colorPalette="manila" onClick={() => setOpen(false)}>Done</Button>}>
            <HStack justify="space-between" mb="3">
                <Text textStyle="sm" color="fg.muted" aria-live="polite">
                    {selectedCount} of {categories.length} picked
                </Text>
                <Button size="sm" variant="ghost" me="-3" onClick={toggleAll}>
                    {isAllSelected ? "Clear all" : "Select all"}
                </Button>
            </HStack>
            <Flex wrap="wrap" gap="2">
                {sortedCategories.map((category) => {
                    const isSelected = selectedCategoryIds.includes(category.id)

                    return (
                        <Button key={category.id} rounded="full" ps="3.5" pe="4"
                                variant={isSelected ? "solid" : "outline"}
                                colorPalette={isSelected ? "manila" : "gray"}
                                aria-pressed={isSelected}
                                onClick={() => toggleCategory(category)}>
                            {isSelected ? <LuCheck/> : <LuPlus/>}
                            {category.value}
                        </Button>
                    )
                })}
            </Flex>
        </Sheet>
    )
}
