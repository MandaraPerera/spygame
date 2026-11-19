import {addDoc, collection, getCountFromServer, Timestamp} from "firebase/firestore";
import type {Log, LogData} from "@/model";
import {db} from "@/services";

const LOGS_COLLECTION = 'logs'

export async function createLog(logData: LogData) {
    const logsRef = collection(db, LOGS_COLLECTION)
    const logDoc = await addDoc(logsRef, {
        ...logData,
        timestamp: Timestamp.now()
    })
    return {
        id: logDoc.id,
        ...logData
    } as Log
}

export async function readAmountOfLogs() {
    const logsRef = collection(db, LOGS_COLLECTION)
    const querySnapshot = await getCountFromServer(logsRef)
    return querySnapshot.data().count
}
