import {Box, Editable, Heading, IconButton, Text} from "@chakra-ui/react";
import {useState} from "react";
import {CategoryWithTerms} from "@/model";
import {AccordionItem, AccordionItemContent, AccordionItemTrigger, AccordionRoot} from "@/components/ui";
import {LuCheck, LuPencilLine, LuX} from "react-icons/lu";

export function SuggestData() {
    const [categories, setCategories] = useState<CategoryWithTerms[]>([{value: "Category", terms: [{value: "Term"}]}])
    
    return (
        <>
            <Heading size="3xl">Better Spy</Heading>
            <Text fontSize={"sm"}>
                Here you can suggest categories and words that you would like to see in the game. Once they are
                approved, you will see your content in the game!
            </Text>
            <AccordionRoot collapsible variant="subtle">
                {categories.map((category, index) => (
                    <AccordionItem key={index} value={category.value}>
                        <AccordionItemTrigger>
                            <Box>
                                <Editable.Root key={index} defaultValue={category.value}>
                                    <Editable.Preview/>
                                    <Editable.Input/>
                                    <Editable.Control>
                                        <Editable.EditTrigger>
                                            <IconButton variant="ghost" size="xs">
                                                <LuPencilLine/>
                                            </IconButton>
                                        </Editable.EditTrigger>
                                        <Editable.CancelTrigger asChild>
                                            <IconButton variant="outline" size="xs">
                                                <LuX/>
                                            </IconButton>
                                        </Editable.CancelTrigger>
                                        <Editable.SubmitTrigger asChild>
                                            <IconButton variant="outline" size="xs">
                                                <LuCheck/>
                                            </IconButton>
                                        </Editable.SubmitTrigger>
                                    </Editable.Control>
                                </Editable.Root>
                            </Box>
                        </AccordionItemTrigger>
                        <AccordionItemContent p={1}>
                            {category.terms.map((term, index) => (
                                <Editable.Root key={index} defaultValue={term.value}>
                                    <Editable.Preview/>
                                    <Editable.Input/>
                                    <Editable.Control>
                                        <Editable.EditTrigger asChild>
                                            <IconButton variant="ghost" size="xs">
                                                <LuPencilLine/>
                                            </IconButton>
                                        </Editable.EditTrigger>
                                        <Editable.CancelTrigger asChild>
                                            <IconButton variant="outline" size="xs">
                                                <LuX/>
                                            </IconButton>
                                        </Editable.CancelTrigger>
                                        <Editable.SubmitTrigger asChild>
                                            <IconButton variant="outline" size="xs">
                                                <LuCheck/>
                                            </IconButton>
                                        </Editable.SubmitTrigger>
                                    </Editable.Control>
                                </Editable.Root>
                            ))}
                        </AccordionItemContent>
                    </AccordionItem>
                ))}
            </AccordionRoot>
        </>
    )
}