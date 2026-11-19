import type {QueryDocumentSnapshot} from "firebase/firestore";

export type Suggestion = {
    id: string
    timestamp: Date | null
    category: string
    terms: string[]
    isNewCategory: boolean
    isValid: boolean
}

export type SuggestionData = Omit<Suggestion, "id" | "timestamp" | "isValid">

export type PaginatedSuggestions = {
    suggestions: Suggestion[]
    cursor?: QueryDocumentSnapshot
}
