export type Category = {
    id: string
    value: string
    isOriginal: boolean
}

export type CategoryData = Omit<Category, "id">