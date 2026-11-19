import {
    MAX_TERMS_PER_SUGGESTION,
    MIN_TERMS_FOR_NEW_CATEGORY,
    NAME_MAX_LENGTH,
    NAME_MIN_LENGTH
} from "@/config";
import type {Category, Suggestion, SuggestionData} from "@/model";

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

export function checkLength(value: string, label: string): string | null {
    if (value.length < NAME_MIN_LENGTH) return `${label} needs a minimum of ${NAME_MIN_LENGTH} characters`
    if (value.length > NAME_MAX_LENGTH) return `${label} can have a maximum of ${NAME_MAX_LENGTH} characters`
    return null
}

function resolveCategory(draft: SuggestionDraft, categories: Category[]): ValidationResult | string {
    if (!draft.isNewCategory) {
        const existing = categories.find((category) => category.id === draft.existingCategoryId)
        return existing ? existing.value : {ok: false, error: "Category is not selected"}
    }

    const category = normalizeName(draft.newCategory)
    if (category.length === 0) return {ok: false, error: "Category is not set"}

    const lengthError = checkLength(category, "Category")
    if (lengthError) return {ok: false, error: lengthError}

    if (findCategoryByName(categories, category)) {
        return {ok: false, error: `"${category}" already exists. Switch to Existing to add terms to it.`}
    }

    return category
}

function resolveTerms(draft: SuggestionDraft): ValidationResult | string[] {
    const terms = draft.terms.map(normalizeName)

    if (terms.length === 0) return {ok: false, error: "Add at least one term"}
    if (terms.length > MAX_TERMS_PER_SUGGESTION) {
        return {ok: false, error: `A suggestion can have a maximum of ${MAX_TERMS_PER_SUGGESTION} terms`}
    }
    if (draft.isNewCategory && terms.length < MIN_TERMS_FOR_NEW_CATEGORY) {
        return {ok: false, error: `For a new category, submit at least ${MIN_TERMS_FOR_NEW_CATEGORY} terms`}
    }

    const seen = new Set<string>()
    for (const term of terms) {
        if (term.length === 0) return {ok: false, error: "Fill in or remove the empty terms"}

        const lengthError = checkLength(term, `"${term}"`)
        if (lengthError) return {ok: false, error: lengthError}

        const key = nameKey(term)
        if (seen.has(key)) return {ok: false, error: `"${term}" is in the list twice`}
        seen.add(key)
    }

    return terms
}

export function validateSuggestion(draft: SuggestionDraft, categories: Category[]): ValidationResult {
    const category = resolveCategory(draft, categories)
    if (typeof category !== "string") return category

    const terms = resolveTerms(draft)
    if (!Array.isArray(terms)) return terms

    return {ok: true, suggestion: {category, terms, isNewCategory: draft.isNewCategory}}
}

function isStringList(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((item) => typeof item === "string")
}

function toDate(value: unknown): Date | null {
    if (value instanceof Date) return value
    if (typeof value === "object" && value !== null && "toDate" in value && typeof value.toDate === "function") {
        const date: unknown = value.toDate()
        return date instanceof Date ? date : null
    }
    return null
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
