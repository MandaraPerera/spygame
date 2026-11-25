import {CONTENT_SOURCES, type ContentSource} from "@/model";

// Helpers for reading Firestore documents whose shape is not guaranteed.

export function isStringList(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((item) => typeof item === "string")
}

export function toDate(value: unknown): Date | null {
    if (value instanceof Date) return value
    if (typeof value === "object" && value !== null && "toDate" in value && typeof value.toDate === "function") {
        const date: unknown = value.toDate()
        return date instanceof Date ? date : null
    }
    return null
}

// Documents written before the source field have isOriginal instead; any of those that is not original is
// counted as a community one until scripts/migrate-source.cjs has run.
export function toContentSource(data: Record<string, unknown>): ContentSource {
    const source = data.source
    if (CONTENT_SOURCES.some((known) => known === source)) return source as ContentSource
    return data.isOriginal === true ? "original" : "community"
}

export function toStringOrNull(value: unknown): string | null {
    return typeof value === "string" ? value : null
}
