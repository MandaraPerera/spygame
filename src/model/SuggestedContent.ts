export type SuggestedContent = {
    id: string
    timestamp: Date
    category: string
    terms: string[]
    isNewCategory: boolean
}

export type SuggestedContentData = Omit<Omit<SuggestedContent, "id">, "timestamp">