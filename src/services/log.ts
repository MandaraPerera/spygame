import {
    collection,
    doc,
    getCountFromServer,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    type Timestamp,
    type WriteBatch
} from "firebase/firestore";
import type {Log, LogData} from "@/model";
import {readCurrentUserId} from "./auth";
import {db} from "./firebase";

const LOGS_COLLECTION = 'logs'

// Logs are written in the same batch as the change they describe, so there is never one without the other.
export function addLogToBatch(batch: WriteBatch, logData: Omit<LogData, "userId">) {
    batch.set(doc(collection(db, LOGS_COLLECTION)), {
        ...logData,
        userId: readCurrentUserId(),
        timestamp: serverTimestamp()
    })
}

export async function readLogs(maxLogs: number): Promise<Log[]> {
    const logsQuery = query(collection(db, LOGS_COLLECTION), orderBy('timestamp', 'desc'), limit(maxLogs))
    const querySnapshot = await getDocs(logsQuery)

    return querySnapshot.docs.map((logDoc) => {
        const data = logDoc.data()
        return {
            ...data,
            id: logDoc.id,
            timestamp: (data.timestamp as Timestamp | undefined)?.toDate() ?? null
        } as Log
    })
}

export async function readAmountOfLogs() {
    const querySnapshot = await getCountFromServer(collection(db, LOGS_COLLECTION))
    return querySnapshot.data().count
}
