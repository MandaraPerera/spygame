import type {ContentSource} from "./source";

export type Category = {
    id: string
    value: string
    source: ContentSource
}

export type CategoryData = Omit<Category, "id">