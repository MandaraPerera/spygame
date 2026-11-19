import type {Log, LogAction, LogType} from "@/model";
import {pluralize} from "./array";
import {isStringList, toDate, toStringOrNull} from "./parse";

const LOG_TYPES: readonly LogType[] = ["suggestion", "category", "term"]
const LOG_ACTIONS: readonly LogAction[] = ["approved", "denied", "created", "updated", "deleted"]

function toLogType(data: Record<string, unknown>): LogType | null {
    const type = LOG_TYPES.find((known) => known === data.type)
    if (type) return type
    // Older entries had no type; only suggestions record whether the category was new.
    return typeof data.isNewCategory === "boolean" ? "suggestion" : null
}

// Logs are written by admins, but older versions of the app wrote another shape, so nothing is assumed.
export function parseLog(id: string, data: Record<string, unknown>): Log {
    const legacyTerm = toStringOrNull(data.term)

    return {
        id,
        timestamp: toDate(data.timestamp),
        userId: toStringOrNull(data.userId),
        userName: toStringOrNull(data.user),
        type: toLogType(data),
        action: LOG_ACTIONS.find((known) => known === data.action) ?? null,
        category: toStringOrNull(data.category) ?? "(unknown)",
        terms: isStringList(data.terms) ? data.terms : legacyTerm ? [legacyTerm] : [],
        isNewCategory: typeof data.isNewCategory === "boolean" ? data.isNewCategory : null
    }
}

// Who made the change, for the line under a log entry.
export function describeLogAuthor(log: Log, currentUserId: string | null): string {
    if (log.userId !== null && log.userId === currentUserId) return "you"
    if (log.userId !== null) return `admin ${log.userId.slice(0, 6)}`
    return log.userName ?? "an unknown admin"
}

export type LogDescription = {
    title: string
    detail: string | null
}

function listOf(terms: string[]): string | null {
    return terms.length > 0 ? terms.join(", ") : null
}

function countOf(terms: string[]): string {
    return `${terms.length} ${pluralize(terms.length, "term", "terms")}`
}

function describeSuggestion(log: Log): LogDescription {
    const category = `${log.category}${log.isNewCategory ? " (new)" : ""}`

    if (log.action === "approved") {
        return {title: `Approved ${category}`, detail: listOf(log.terms) ?? "No new terms"}
    }
    return {title: `Denied ${category}`, detail: listOf(log.terms)}
}

function describeCategory(log: Log): LogDescription {
    if (log.action === "created") return {title: `Created ${log.category}`, detail: listOf(log.terms)}
    if (log.action === "updated") return {title: `Renamed ${log.terms[0] ?? "a category"} to ${log.category}`, detail: null}
    if (log.action === "deleted") {
        return {title: `Deleted ${log.category}`, detail: log.terms.length > 0 ? `With ${countOf(log.terms)}: ${listOf(log.terms)}` : null}
    }
    return {title: `${log.action} ${log.category}`, detail: listOf(log.terms)}
}

function describeTerm(log: Log): LogDescription {
    if (log.action === "created") return {title: `Added ${countOf(log.terms)} to ${log.category}`, detail: listOf(log.terms)}
    if (log.action === "updated") {
        return {title: `Renamed ${log.terms[0] ?? "a term"} to ${log.terms[1] ?? "?"}`, detail: `In ${log.category}`}
    }
    if (log.action === "deleted") return {title: `Deleted ${log.terms[0] ?? "a term"}`, detail: `From ${log.category}`}
    return {title: `${log.action} ${log.category}`, detail: listOf(log.terms)}
}

// A sentence per log entry; see src/model/log.ts for what each kind of entry stores.
export function describeLog(log: Log): LogDescription {
    if (log.action === null || log.type === null) {
        return {title: `${log.action ?? "Changed"} ${log.category}`, detail: listOf(log.terms)}
    }
    if (log.type === "suggestion") return describeSuggestion(log)
    if (log.type === "category") return describeCategory(log)
    return describeTerm(log)
}
