export type Category = {
    id: string,
    value: string,
    original: boolean
}

export type CategoryData = Omit<Category, "id">