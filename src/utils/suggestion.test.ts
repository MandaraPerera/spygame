import {describe, expect, it} from "vitest";
import type {Category} from "@/model";
import {normalizeName, parseSuggestion, type SuggestionDraft, validateSuggestion} from "./suggestion";

const categories: Category[] = [
    {id: "countries", value: "Countries", isOriginal: true},
    {id: "sports", value: "Sports", isOriginal: true}
]

const fiveTerms = ["Lion", "Tiger", "Zebra", "Giraffe", "Elephant"]

function draft(overrides: Partial<SuggestionDraft>): SuggestionDraft {
    return {isNewCategory: false, newCategory: "", existingCategoryId: "countries", terms: ["Belgium"], ...overrides}
}

function errorOf(overrides: Partial<SuggestionDraft>): string | null {
    const result = validateSuggestion(draft(overrides), categories)
    return result.ok ? null : result.error
}

describe("validateSuggestion", () => {
    it("accepts terms for an existing category and sends its stored name", () => {
        expect(validateSuggestion(draft({}), categories)).toEqual({
            ok: true,
            suggestion: {category: "Countries", terms: ["Belgium"], isNewCategory: false}
        })
    })

    it("needs a selected category in Existing mode, whatever was typed in New mode", () => {
        expect(errorOf({existingCategoryId: null, newCategory: "Pizzas"})).toBe("Pick a category")
    })

    it("needs a name in New mode", () => {
        expect(errorOf({isNewCategory: true, newCategory: "   ", terms: fiveTerms})).toBe("Name the new category")
    })

    it("checks the category length after trimming", () => {
        expect(errorOf({isNewCategory: true, newCategory: " Abc ", terms: fiveTerms}))
            .toBe("Category needs a minimum of 4 characters")
        expect(errorOf({isNewCategory: true, newCategory: "Abcd", terms: fiveTerms})).toBeNull()
        expect(errorOf({isNewCategory: true, newCategory: "a".repeat(20), terms: fiveTerms})).toBeNull()
        expect(errorOf({isNewCategory: true, newCategory: "a".repeat(21), terms: fiveTerms}))
            .toBe("Category can have a maximum of 20 characters")
    })

    it("rejects a new category that already exists, ignoring case and spaces", () => {
        expect(errorOf({isNewCategory: true, newCategory: "  countries ", terms: fiveTerms}))
            .toBe('"countries" already exists. Pick it under Existing category to add words to it.')
    })

    it("needs five terms for a new category", () => {
        expect(errorOf({isNewCategory: true, newCategory: "Animals", terms: fiveTerms.slice(0, 4)}))
            .toBe("A new category needs at least 5 words")
    })

    it("rejects terms that are only spaces", () => {
        expect(errorOf({terms: ["    "]})).toBe("Fill in or remove the empty words")
    })

    it("rejects duplicate terms, ignoring case", () => {
        expect(errorOf({terms: ["Belgium", "belgium "]})).toBe('"belgium" is in the list twice')
    })

    it("limits the number of terms", () => {
        const terms = Array.from({length: 51}, (_, index) => `Term ${index}`)
        expect(errorOf({terms})).toBe("A suggestion can have at most 50 words")
    })

    it("sends trimmed terms", () => {
        const result = validateSuggestion(draft({terms: ["  New   Zealand "]}), categories)
        expect(result.ok && result.suggestion.terms).toEqual(["New Zealand"])
    })
})

describe("normalizeName", () => {
    it("trims and collapses spaces", () => {
        expect(normalizeName("  New   York  ")).toBe("New York")
    })
})

describe("parseSuggestion", () => {
    const timestamp = {toDate: () => new Date(2026, 0, 1)}

    it("reads a valid document", () => {
        const suggestion = parseSuggestion("s1", {category: "Animals", terms: ["Lion"], isNewCategory: true, timestamp})

        expect(suggestion).toEqual({
            id: "s1",
            category: "Animals",
            terms: ["Lion"],
            isNewCategory: true,
            timestamp: new Date(2026, 0, 1),
            isValid: true
        })
    })

    it("does not throw on a timestamp that is not a Timestamp", () => {
        const suggestion = parseSuggestion("s2", {category: "Animals", terms: ["Lion"], isNewCategory: true, timestamp: 0})

        expect(suggestion.isValid).toBe(false)
        expect(suggestion.timestamp).toBeNull()
    })

    it("does not throw on terms that are not a list of strings", () => {
        expect(parseSuggestion("s3", {category: "Animals", terms: "x", isNewCategory: true, timestamp}))
            .toMatchObject({terms: [], isValid: false})
        expect(parseSuggestion("s4", {category: "Animals", terms: [1], isNewCategory: true, timestamp}))
            .toMatchObject({terms: [], isValid: false})
    })
})
