import {MAX_TERMS_PER_ADD} from "@/config";
import {checkTermLength, nameKey, normalizeName} from "./suggestion";

export type TermListResult =
    | { ok: true, terms: string[] }
    | { ok: false, error: string }

// One term per line; blank lines are ignored and spaces are normalised.
export function splitLines(text: string): string[] {
    return text.split(/\r?\n/).map(normalizeName).filter((line) => line.length > 0)
}

// Checks a list of terms an admin adds. Terms that the category already has are not an error here: the service
// skips them, because only it reads the category's current terms.
export function validateTermList(terms: string[], minTerms = 1): TermListResult {
    const normalized = terms.map(normalizeName).filter((term) => term.length > 0)

    if (normalized.length < minTerms) {
        return {ok: false, error: minTerms === 1 ? "Add at least one term" : `Add at least ${minTerms} terms`}
    }
    if (normalized.length > MAX_TERMS_PER_ADD) {
        return {ok: false, error: `Add at most ${MAX_TERMS_PER_ADD} terms at a time`}
    }

    const seen = new Set<string>()
    for (const term of normalized) {
        const lengthError = checkTermLength(term, `"${term}"`)
        if (lengthError) return {ok: false, error: lengthError}

        const key = nameKey(term)
        if (seen.has(key)) return {ok: false, error: `"${term}" is in the list twice`}
        seen.add(key)
    }

    return {ok: true, terms: normalized}
}
