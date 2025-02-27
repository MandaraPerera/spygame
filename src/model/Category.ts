export type Category = {
    id: string,
    value: string
}

export type CategoryData = Omit<Category, "id">