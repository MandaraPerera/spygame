import {Card} from "@chakra-ui/react";
import {Category} from "../model/Category.ts";

interface CategoryCardProps {
    category: Category;
}

export function CategoryCard({category}: CategoryCardProps) {
    return (
        <Card.Root>
            <Card.Body>
                {category.name}
            </Card.Body>
        </Card.Root>
    )
}