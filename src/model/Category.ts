import {TermValues} from "@/model";

export type Category = {
    id: string,
    value: string
}

export type CategoryData = Omit<Category, "id">

export type CategoryWithTerms = {
    value: string,
    terms: TermValues[]
}