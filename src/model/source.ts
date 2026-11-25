// Where a category or term comes from: the seed data, an admin, or an approved suggestion.
export type ContentSource = "original" | "admin" | "community"

export const CONTENT_SOURCES: readonly ContentSource[] = ["original", "admin", "community"]
