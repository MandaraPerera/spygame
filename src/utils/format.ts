import type {ContentSource} from "@/model";

export function formatDate(timestamp: Date | null): string {
    if (!timestamp) return "Unknown date"

    const day = timestamp.getDate().toString().padStart(2, "0")
    const month = (timestamp.getMonth() + 1).toString().padStart(2, "0")
    const year = timestamp.getFullYear()

    const hour = timestamp.getHours().toString().padStart(2, "0")
    const minute = timestamp.getMinutes().toString().padStart(2, "0")

    return `${day}/${month}/${year} - ${hour}:${minute}`
}

// A message for a toast or an inline alert. Firebase errors carry a readable message.
export function errorMessage(error: unknown): string {
    return error instanceof Error && error.message ? error.message : "Something went wrong. Please try again."
}

const SOURCE_LABELS: Record<ContentSource, string> = {
    original: "Original",
    admin: "Admin",
    community: "Community"
}

// The badge on a category or term in the admin pages.
export function sourceLabel(source: ContentSource): string {
    return SOURCE_LABELS[source]
}
