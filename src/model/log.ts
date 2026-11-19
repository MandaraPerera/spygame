import type {QueryDocumentSnapshot} from "firebase/firestore";

export type LogType = "suggestion" | "category" | "term"

export type LogAction = "approved" | "denied" | "created" | "updated" | "deleted"

// What is written. What `category` and `terms` hold depends on the change:
// - suggestion approved/denied: the suggested category, and the terms that were added (approved) or suggested (denied)
// - category created: the new name and its first terms; updated: the new name and [old name]; deleted: the name
//   and the terms that went with it
// - term created: the category and the added terms; updated: the category and [old, new]; deleted: the category
//   and [term]
export type LogData = {
    userId: string
    type: LogType
    action: LogAction
    category: string
    terms: string[]
    isNewCategory: boolean | null
}

// What is read. Entries written by older versions of the app have no `userId`, `type` or `terms`, but a `user` name
// and a single `term`, so those fields can be missing (see parseLog).
export type Log = Omit<LogData, "userId" | "type" | "action"> & {
    id: string
    timestamp: Date | null
    userId: string | null
    userName: string | null
    type: LogType | null
    action: LogAction | null
}

export type PaginatedLogs = {
    logs: Log[]
    cursor?: QueryDocumentSnapshot
}
