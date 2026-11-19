export type Log = {
    id: string
    timestamp: Date
    user: string
    type: "suggestion" | "category" | "term"
    action: "approved" | "denied" | "created" | "updated" | "deleted"
    isNewCategory: boolean | null
    term: string | null
    category: string
}

export type LogData = Omit<Omit<Log, "id">, "timestamp">