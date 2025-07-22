import {
    addDoc,
    collection,
    getCountFromServer,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    QueryDocumentSnapshot,
    startAfter,
    Timestamp
} from "firebase/firestore";
import {db} from "@/services/firebase.ts";
import {Suggestion, SuggestionData} from "@/model";

const SUGGESTION_COLLECTION = "suggestions"

export const createSuggestion = async (suggestionData: SuggestionData) => {
    const suggestionsRef = collection(db, SUGGESTION_COLLECTION)
    const suggestionDoc = await addDoc(suggestionsRef, {
        ...suggestionData,
        timestamp: Timestamp.now()
    })
    return {
        id: suggestionDoc.id,
        ...suggestionData
    } as Suggestion
}

export const getAmountOfSuggestions = async () => {
    const suggestionsRef = collection(db, SUGGESTION_COLLECTION)
    const querySnapshot = await getCountFromServer(suggestionsRef)
    return querySnapshot.data().count
}


export const getAllSuggestionsPaginated = async (pageSize: number, cursor?: QueryDocumentSnapshot): Promise<PaginatedSuggestions> => {
    const constraints = [
        orderBy('timestamp', 'asc'),
        limit(pageSize + 1)
    ]

    const suggestionsRef = collection(db, SUGGESTION_COLLECTION)
    const suggestionsQuery = cursor
        ? query(suggestionsRef, ...constraints, startAfter(cursor))
        : query(suggestionsRef, ...constraints)

    const querySnapshot = await getDocs(suggestionsQuery)

    const hasMore = querySnapshot.docs.length > pageSize
    const visibleDocs = hasMore ? querySnapshot.docs.slice(0, pageSize) : querySnapshot.docs

    return {
        suggestions: visibleDocs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            timestamp: (doc.data().timestamp as unknown as Timestamp).toDate(),
        })) as Suggestion[],
        cursor: hasMore ? visibleDocs[visibleDocs.length - 1] : undefined
    }
}

export const listenSuggestions = (pageSize: number, onSuccess: () => void, onError?: (error: Error) => void) => {
    const suggestionsRef = collection(db, SUGGESTION_COLLECTION)
    const suggestionsQuery = query(suggestionsRef,
        orderBy('timestamp', 'asc'),
        limit(pageSize + 1)
    )
    return onSnapshot(suggestionsQuery, () => {
        onSuccess()
    }, onError)
}

export interface PaginatedSuggestions {
    suggestions: Suggestion[],
    cursor?: QueryDocumentSnapshot
}