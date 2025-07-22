export type Log = {
    id: string
    timestamp: Date
    user: string
    action: "approved" | "denied"
    isNewCategory: boolean
    term: string | null
    category: string
}

export type LogData = Omit<Omit<Log, "id">, "timestamp">