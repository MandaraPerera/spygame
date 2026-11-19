export type Term = {
    id: string
    value: string
    categoryId: string
    isOriginal: boolean
}

export type TermData = Omit<Term, "id">

export type TermValue = Omit<Term, "id" | "categoryId">