import {addDoc, collection, Timestamp} from "firebase/firestore";
import {db} from "@/services/firebase.ts";
import {SuggestedContent, SuggestedContentData} from "@/model";

const SUGGESTED_CONTENT_COLLECTION = "suggestedContent"

export const createSuggestedContent = async (suggestedContentData: SuggestedContentData) => {
    const suggestedContentRef = collection(db, SUGGESTED_CONTENT_COLLECTION)
    const suggestedContentDoc = await addDoc(suggestedContentRef, {
        ...suggestedContentData,
        timestamp: Timestamp.now()
    })
    return {
        id: suggestedContentDoc.id,
        ...suggestedContentData
    } as SuggestedContent
}