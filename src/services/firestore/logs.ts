import {addDoc, collection, getCountFromServer, Timestamp} from "firebase/firestore";
import {db} from "@/services/firebase.ts";
import {Log, LogData} from "@/model";

const LOGS_COLLECTION = 'logs'

export const createLog = async (logData: LogData) => {
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

export const getAmountOfLogs = async () => {
    const logsRef = collection(db, LOGS_COLLECTION)
    const querySnapshot = await getCountFromServer(logsRef)
    return querySnapshot.data().count
}