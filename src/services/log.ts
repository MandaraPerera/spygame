import {
    collection,
    doc,
    getCountFromServer,
    getDocs,
    limit,
    orderBy,
    query,
    type QueryDocumentSnapshot,
    serverTimestamp,
    startAfter,
    type WriteBatch
} from "firebase/firestore";
import type {LogData, PaginatedLogs} from "@/model";
import {parseLog} from "@/utils";
import {readCurrentUserId} from "./auth";
import {LOGS_COLLECTION} from "./collections";
import {db} from "./firebase";

// Logs are written in the same batch as the change they describe, so there is never one without the other.
export function addLogToBatch(batch: WriteBatch, logData: Omit<LogData, "userId">) {
    batch.set(doc(collection(db, LOGS_COLLECTION)), {
        ...logData,
        userId: readCurrentUserId(),
        timestamp: serverTimestamp()
    })
}

// Newest first. One extra document is read to know whether there is a next page.
export async function readLogsPaginated(pageSize: number, cursor?: QueryDocumentSnapshot): Promise<PaginatedLogs> {
    const constraints = [orderBy('timestamp', 'desc'), limit(pageSize + 1)]
    const logsRef = collection(db, LOGS_COLLECTION)
    const logsQuery = cursor
        ? query(logsRef, ...constraints, startAfter(cursor))
        : query(logsRef, ...constraints)

    const querySnapshot = await getDocs(logsQuery)
    const hasMore = querySnapshot.docs.length > pageSize
    const visibleDocs = hasMore ? querySnapshot.docs.slice(0, pageSize) : querySnapshot.docs

    return {
        logs: visibleDocs.map((logDoc) => parseLog(logDoc.id, logDoc.data())),
        cursor: hasMore ? visibleDocs[visibleDocs.length - 1] : undefined
    }
}

export async function readAmountOfLogs() {
    const querySnapshot = await getCountFromServer(collection(db, LOGS_COLLECTION))
    return querySnapshot.data().count
}
