export type Term = {
    id: string,
    value: string,
    categoryId: string
}

export type TermData = Omit<Term, "id">

export type TermValues = Omit<TermData, "categoryId">