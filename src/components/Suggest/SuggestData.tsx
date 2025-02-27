import {
    Box,
    Button,
    createListCollection,
    Editable,
    Heading,
    HStack,
    IconButton,
    Link,
    ListCollection,
    Separator,
    Spacer,
    Switch,
    Text
} from "@chakra-ui/react";
import {useEffect, useState} from "react";
import {CategoryData, TermValue} from "@/model";
import {LuCheck, LuPencilLine, LuX} from "react-icons/lu";
import {FaPlus, FaTrash} from "react-icons/fa";
import {v4 as uuid} from 'uuid';
import {SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValueText, toaster, Toaster} from "@/components/ui";
import {useCategories} from "@/hooks";
import {Error, Loading} from "@/components/Util";

export function SuggestData() {
    const [category, setCategory] = useState<CategoryData>({value: "Category"})
    const [terms, setTerms] = useState<Map<string, TermValue>>(new Map<string, TermValue>([[uuid(), {value: "Term"}]]))
    const [isNewCategory, setIsNewCategory] = useState<boolean>(true)
    const {data: categories, isLoading, isError} = useCategories();
    const [categoriesCollection, setCategoriesCollection] = useState<ListCollection<CategoryData>>()

    useEffect(() => {
        if (categories) {
            setCategoriesCollection(createListCollection({items: [...categories]}))
        }
    }, [categories]);

    useEffect(() => {
        console.log(category, terms)
    }, [category, terms]);

    const addTerm = () => {
        if (terms.size > 49) {
            toaster.create({
                title: "Maximum of 50 terms per suggestion",
                description: "Add more terms once the category gets approved.",
                type: "error",
            })
            return
        }

        setTerms(prevTerms => {
            const newTerms = new Map(prevTerms)
            newTerms.set(uuid(), {value: "Term"})
            return newTerms
        })
    }

    const updateTerm = (id: string, newTerm: string) => {
        setTerms(prevTerms => {
            const newTerms = new Map(prevTerms)
            newTerms.set(id, {value: newTerm})
            return newTerms
        })
    }

    const deleteTerm = (id: string) => {
        setTerms(pevTerms => {
            const newTerms = new Map(pevTerms)
            newTerms.delete(id)
            return newTerms
        })
    }

    const submit = () => {
        console.log("submit")
        //todo
        //if terms.size < 1
        //if terms any value.length < 4
        //if terms any value.length > 10
        //if category == "Category"
        //if category.length < 3
        //if category.length > 20
    }

    if (isLoading) {
        return <Loading text={"Categories are being loaded."}/>
    }

    if (isError || !categories) {
        return <Error text={"Error loading categories"}/>
    }

    return (
        <>
            <Toaster/>
            <Heading size="3xl">Better Spy</Heading>
            <Text fontSize={"sm"}>
                Here you can suggest categories and terms that you would like to see in the game. Once they are
                approved, you will see your content in the game! If you'd like to add to an existing category, select it
                from the dropdown.
            </Text>
            <HStack mt={4} w="100%">
                <Heading>Category</Heading>
                <Spacer/>
                <Text>{isNewCategory ? "New" : "Existing"}</Text>
                <Switch.Root
                    checked={isNewCategory}
                    onCheckedChange={(e) => setIsNewCategory(e.checked)}
                >
                    <Switch.HiddenInput/>
                    <Switch.Control>
                        <Switch.Thumb/>
                    </Switch.Control>
                    <Switch.Label/>
                </Switch.Root>
            </HStack>
            <Box w="100%">
                {isNewCategory ? (
                    <Editable.Root defaultValue={category.value}
                                   onValueCommit={(e) => {
                                       setCategory({value: e.value})
                                   }}
                    >
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
                ) : categoriesCollection ? (
                    <SelectRoot collection={categoriesCollection} size="sm" width="320px"
                                onValueChange={(e) => setCategory({value: e.value[0]})}
                    >
                        <SelectTrigger>
                            <SelectValueText placeholder="Select category"/>
                        </SelectTrigger>
                        <SelectContent>
                            {categoriesCollection.items.map((category, index) => (
                                <SelectItem item={category} key={index}>
                                    {category.value}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </SelectRoot>
                ) : (
                    <></>
                )}
            </Box>
            <Separator w="100%"/>
            <Heading w="100%" mt={4}>Terms</Heading>
            {Array.from(terms).map(([id, term]) => (
                <HStack key={id} justify="space-between" w="100%">
                    <Editable.Root defaultValue={term.value}
                                   onValueCommit={(e) => {
                                       console.time('updateTerm')
                                       updateTerm(id, e.value)
                                       console.timeEnd('updateTerm')
                                   }}
                    >
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
                    <IconButton size="xs" variant="outline"
                                onClick={() => deleteTerm(id)}>
                        <FaTrash/>
                    </IconButton>
                </HStack>
            ))}
            <HStack w="100%" justify="space-between">
                <Link onClick={() => addTerm()}>
                    <Text fontSize="sm" ml={1}>New term...</Text>
                </Link>
                <IconButton size="xs" variant="outline"
                            onClick={addTerm}>
                    <FaPlus/>
                </IconButton>
            </HStack>
            <Separator w="100%"/>
            <Button alignSelf="end" w="100px" mt={4}
                    onClick={submit}
            >Submit</Button>
        </>
    )
}