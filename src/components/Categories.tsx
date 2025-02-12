import {Grid} from "@chakra-ui/react";
import {CategoryCard} from "./CategoryCard.tsx";
import {Category} from "../model/Category.ts";

export function Categories() {
    const categories: Category[] = [
        {id: "1", name: "Countries"},
        {id: "2", name: "Objects"},
        {id: "3", name: "Locations"},
        {id: "4", name: "Snowbunnies"},
        {id: "5", name: "Latinas"},
        {id: "6", name: "Baddies"},
    ]

    return (
        <Grid
            templateColumns="repeat(2, 1fr)"
            gap={4}
        >
            {
                categories.map((category) => (
                    <CategoryCard category={category}/>
                ))
            }
        </Grid>
    )
}