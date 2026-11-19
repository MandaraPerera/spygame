export type LogType = "suggestion" | "category" | "term"

export type LogAction = "approved" | "denied" | "updated" | "deleted"

export type Log = {
    id: string
    timestamp: Date | null
    userId: string
    type: LogType
    action: LogAction
    category: string
    terms: string[]
    isNewCategory: boolean | null
}

export type LogData = Omit<Log, "id" | "timestamp">
