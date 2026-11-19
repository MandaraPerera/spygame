import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getCountFromServer,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    type QueryDocumentSnapshot,
    startAfter,
    Timestamp
} from "firebase/firestore";
import type {PaginatedSuggestions, Suggestion, SuggestionData} from "@/model";
import {db} from "@/services";

const SUGGESTION_COLLECTION = "suggestions"

export async function createSuggestion(suggestionData: SuggestionData) {
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

export async function readAmountOfSuggestions() {
    const suggestionsRef = collection(db, SUGGESTION_COLLECTION)
    const querySnapshot = await getCountFromServer(suggestionsRef)
    return querySnapshot.data().count
}

export async function readSuggestionsPaginated(pageSize: number, cursor?: QueryDocumentSnapshot): Promise<PaginatedSuggestions> {
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

export function listenSuggestions(pageSize: number, onSuccess: () => void, onError?: (error: Error) => void) {
    const suggestionsRef = collection(db, SUGGESTION_COLLECTION)
    const suggestionsQuery = query(suggestionsRef,
        orderBy('timestamp', 'asc'),
        limit(pageSize + 1)
    )
    return onSnapshot(suggestionsQuery, () => {
        onSuccess()
    }, onError)
}

export function deleteSuggestion(suggestionId: string) {
    const suggestionRef = doc(db, SUGGESTION_COLLECTION, suggestionId)
    return deleteDoc(suggestionRef)
}
