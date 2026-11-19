import {
    addDoc,
    collection,
    doc,
    getCountFromServer,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    type QueryDocumentSnapshot,
    serverTimestamp,
    startAfter,
    type WriteBatch,
    writeBatch
} from "firebase/firestore";
import type {PaginatedSuggestions, Suggestion, SuggestionData} from "@/model";
import {checkLength, findCategoryByName, nameKey, normalizeName, parseSuggestion} from "@/utils";
import {CATEGORIES_COLLECTION, readCategories} from "./category";
import {db} from "./firebase";
import {addLogToBatch} from "./log";
import {readTermsByCategoryIds, TERMS_COLLECTION} from "./term";

const SUGGESTIONS_COLLECTION = "suggestions"

export async function createSuggestion(suggestionData: SuggestionData) {
    await addDoc(collection(db, SUGGESTIONS_COLLECTION), {
        ...suggestionData,
        timestamp: serverTimestamp()
    })
}

export async function readAmountOfSuggestions() {
    const querySnapshot = await getCountFromServer(collection(db, SUGGESTIONS_COLLECTION))
    return querySnapshot.data().count
}

export async function readSuggestionsPaginated(pageSize: number, cursor?: QueryDocumentSnapshot): Promise<PaginatedSuggestions> {
    const constraints = [
        orderBy('timestamp', 'asc'),
        limit(pageSize + 1)
    ]

    const suggestionsRef = collection(db, SUGGESTIONS_COLLECTION)
    const suggestionsQuery = cursor
        ? query(suggestionsRef, ...constraints, startAfter(cursor))
        : query(suggestionsRef, ...constraints)

    const querySnapshot = await getDocs(suggestionsQuery)

    const hasMore = querySnapshot.docs.length > pageSize
    const visibleDocs = hasMore ? querySnapshot.docs.slice(0, pageSize) : querySnapshot.docs

    return {
        suggestions: visibleDocs.map((suggestionDoc) => parseSuggestion(suggestionDoc.id, suggestionDoc.data())),
        cursor: hasMore ? visibleDocs[visibleDocs.length - 1] : undefined
    }
}

// Watches only the newest suggestion: new submissions arrive last in the review order. The first snapshot and
// this device's own writes are skipped, because the mutations that cause them already refresh the list.
export function listenNewSuggestions(onNewSuggestion: () => void, onError: (error: Error) => void) {
    const newestQuery = query(collection(db, SUGGESTIONS_COLLECTION), orderBy('timestamp', 'desc'), limit(1))
    let isFirstSnapshot = true

    return onSnapshot(newestQuery, (querySnapshot) => {
        if (isFirstSnapshot) {
            isFirstSnapshot = false
            return
        }

        const hasNewSuggestion = querySnapshot.docChanges().some((change) => change.type === "added")
        if (hasNewSuggestion && !querySnapshot.metadata.hasPendingWrites) {
            onNewSuggestion()
        }
    }, onError)
}

async function resolveCategoryId(batch: WriteBatch, suggestion: Suggestion): Promise<string> {
    const existingCategory = findCategoryByName(await readCategories(), suggestion.category)
    if (existingCategory) {
        return existingCategory.id
    }

    if (!suggestion.isNewCategory) {
        throw new Error(`The category "${suggestion.category}" no longer exists. Deny this suggestion instead.`)
    }

    const lengthError = checkLength(normalizeName(suggestion.category), "The category")
    if (lengthError) {
        throw new Error(`${lengthError}. Deny this suggestion instead.`)
    }

    const categoryRef = doc(collection(db, CATEGORIES_COLLECTION))
    batch.set(categoryRef, {value: normalizeName(suggestion.category), isOriginal: false})
    return categoryRef.id
}

async function selectNewTerms(suggestion: Suggestion, categoryId: string): Promise<string[]> {
    const knownKeys = new Set((await readTermsByCategoryIds([categoryId])).map((term) => nameKey(term.value)))
    const newTerms: string[] = []

    for (const rawTerm of suggestion.terms) {
        const term = normalizeName(rawTerm)
        const lengthError = checkLength(term, `"${term}"`)
        if (lengthError) {
            throw new Error(`${lengthError}. Deny this suggestion instead.`)
        }

        if (!knownKeys.has(nameKey(term))) {
            knownKeys.add(nameKey(term))
            newTerms.push(term)
        }
    }

    return newTerms
}

// One batch: the category (when new), every term, the log and the removal of the suggestion are written
// together or not at all. Terms that the category already has are skipped.
export async function approveSuggestion(suggestion: Suggestion) {
    if (!suggestion.isValid) {
        throw new Error("This suggestion is malformed and can only be denied.")
    }

    const batch = writeBatch(db)
    const categoryId = await resolveCategoryId(batch, suggestion)
    const newTerms = await selectNewTerms(suggestion, categoryId)

    newTerms.forEach((term) => {
        batch.set(doc(collection(db, TERMS_COLLECTION)), {value: term, categoryId, isOriginal: false})
    })
    addLogToBatch(batch, {
        type: "suggestion",
        action: "approved",
        category: normalizeName(suggestion.category),
        terms: newTerms,
        isNewCategory: suggestion.isNewCategory
    })
    batch.delete(doc(db, SUGGESTIONS_COLLECTION, suggestion.id))

    await batch.commit()
}

export async function denySuggestion(suggestion: Suggestion) {
    const batch = writeBatch(db)
    addLogToBatch(batch, {
        type: "suggestion",
        action: "denied",
        category: suggestion.category,
        terms: suggestion.terms,
        isNewCategory: suggestion.isNewCategory
    })
    batch.delete(doc(db, SUGGESTIONS_COLLECTION, suggestion.id))

    await batch.commit()
}
