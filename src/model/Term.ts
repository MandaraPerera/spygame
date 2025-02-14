export type Term = {
    id: string,
    value: string,
    original: boolean,
    categoryId: string
}

export type TermData = Omit<Term, "id">