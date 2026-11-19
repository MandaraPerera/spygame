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

export function toStringOrNull(value: unknown): string | null {
    return typeof value === "string" ? value : null
}
