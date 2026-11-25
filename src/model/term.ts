import type {ContentSource} from "./source";

export type Term = {
    id: string
    value: string
    categoryId: string
    source: ContentSource
}

export type TermData = Omit<Term, "id">

// The number of terms per category id.
export type TermCounts = Record<string, number>

// The result of adding terms: the ones written, and the ones the category already had.
export type AddedTerms = {
    added: string[]
    skipped: string[]
}
