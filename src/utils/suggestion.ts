import {
    MAX_TERMS_PER_SUGGESTION,
    MIN_TERMS_FOR_NEW_CATEGORY,
    NAME_MAX_LENGTH,
    NAME_MIN_LENGTH,
    TERM_MIN_LENGTH
} from "@/config";
import type {Category, Suggestion, SuggestionData} from "@/model";
import {isStringList, toDate} from "./parse";

export type SuggestionDraft = {
    isNewCategory: boolean
    newCategory: string
    existingCategoryId: string | null
    terms: string[]
}

export type ValidationResult =
    | { ok: true, suggestion: SuggestionData }
    | { ok: false, error: string }

export function normalizeName(value: string): string {
    return value.trim().replace(/\s+/g, " ")
}

export function nameKey(value: string): string {
    return normalizeName(value).toLocaleLowerCase()
}

export function findCategoryByName(categories: Category[], name: string): Category | undefined {
    const key = nameKey(name)
    return categories.find((category) => nameKey(category.value) === key)
}

export function checkLength(value: string, label: string, minLength = NAME_MIN_LENGTH): string | null {
    if (value.length < minLength) return `${label} needs a minimum of ${minLength} characters`
    if (value.length > NAME_MAX_LENGTH) return `${label} can have a maximum of ${NAME_MAX_LENGTH} characters`
    return null
}

export function checkTermLength(value: string, label: string): string | null {
    return checkLength(value, label, TERM_MIN_LENGTH)
}

function resolveCategory(draft: SuggestionDraft, categories: Category[]): ValidationResult | string {
    if (!draft.isNewCategory) {
        const existing = categories.find((category) => category.id === draft.existingCategoryId)
        return existing ? existing.value : {ok: false, error: "Pick a category"}
    }

    const category = normalizeName(draft.newCategory)
    if (category.length === 0) return {ok: false, error: "Name the new category"}

    const lengthError = checkLength(category, "Category")
    if (lengthError) return {ok: false, error: lengthError}

    if (findCategoryByName(categories, category)) {
        return {ok: false, error: `"${category}" already exists. Pick it under Existing category to add words to it.`}
    }

    return category
}

// existingTerms are the terms the picked category already has; a new category has none.
function resolveTerms(draft: SuggestionDraft, category: string, existingTerms: string[]): ValidationResult | string[] {
    const terms = draft.terms.map(normalizeName)
    const existingKeys = new Set(existingTerms.map(nameKey))

    if (terms.length === 0) return {ok: false, error: "Add at least one word"}
    if (terms.length > MAX_TERMS_PER_SUGGESTION) {
        return {ok: false, error: `A suggestion can have at most ${MAX_TERMS_PER_SUGGESTION} words`}
    }
    if (draft.isNewCategory && terms.length < MIN_TERMS_FOR_NEW_CATEGORY) {
        return {ok: false, error: `A new category needs at least ${MIN_TERMS_FOR_NEW_CATEGORY} words`}
    }

    const seen = new Set<string>()
    for (const term of terms) {
        if (term.length === 0) return {ok: false, error: "Fill in or remove the empty words"}

        const lengthError = checkTermLength(term, `"${term}"`)
        if (lengthError) return {ok: false, error: lengthError}

        const key = nameKey(term)
        if (seen.has(key)) return {ok: false, error: `"${term}" is in the list twice`}
        if (existingKeys.has(key)) return {ok: false, error: `"${term}" is already in ${category}`}
        seen.add(key)
    }

    return terms
}

export function validateSuggestion(draft: SuggestionDraft, categories: Category[],
                                   existingTerms: string[] = []): ValidationResult {
    const category = resolveCategory(draft, categories)
    if (typeof category !== "string") return category

    const terms = resolveTerms(draft, category, draft.isNewCategory ? [] : existingTerms)
    if (!Array.isArray(terms)) return terms

    return {ok: true, suggestion: {category, terms, isNewCategory: draft.isNewCategory}}
}

// Suggestions are written by anonymous visitors, so a stored document can have any shape.
export function parseSuggestion(id: string, data: Record<string, unknown>): Suggestion {
    const category = typeof data.category === "string" ? data.category : null
    const terms = isStringList(data.terms) ? data.terms : null
    const isNewCategory = typeof data.isNewCategory === "boolean" ? data.isNewCategory : null
    const timestamp = toDate(data.timestamp)

    return {
        id,
        category: category ?? "(invalid suggestion)",
        terms: terms ?? [],
        isNewCategory: isNewCategory ?? false,
        timestamp,
        isValid: category !== null && terms !== null && isNewCategory !== null && timestamp !== null
    }
}
