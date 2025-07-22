export type Suggestion = {
    id: string
    timestamp: Date
    category: string
    terms: string[]
    isNewCategory: boolean
}

export type SuggestionData = Omit<Omit<Suggestion, "id">, "timestamp">