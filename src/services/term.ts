import {
    collection,
    doc,
    getCountFromServer,
    getDoc,
    getDocs,
    query,
    where,
    writeBatch
} from "firebase/firestore";
import type {AddedTerms, Category, Term, TermCounts} from "@/model";
import {chunk, nameKey, toContentSource, validateTermList} from "@/utils";
import {CATEGORIES_COLLECTION, TERMS_COLLECTION} from "./collections";
import {db} from "./firebase";
import {addLogToBatch} from "./log";

// Firestore allows at most 30 values in an `in` filter.
const IN_FILTER_LIMIT = 30

export async function readTermsByCategoryIds(categoryIds: string[]): Promise<Term[]> {
    const termsRef = collection(db, TERMS_COLLECTION)
    const snapshots = await Promise.all(
        chunk(categoryIds, IN_FILTER_LIMIT).map((ids) => getDocs(query(termsRef, where("categoryId", "in", ids))))
    )

    return snapshots.flatMap((querySnapshot) =>
        querySnapshot.docs.map((termDoc): Term => {
            const data = termDoc.data()
            return {id: termDoc.id, value: data.value, categoryId: data.categoryId, source: toContentSource(data)}
        }))
}

export async function readAmountOfTerms() {
    const querySnapshot = await getCountFromServer(collection(db, TERMS_COLLECTION))
    return querySnapshot.data().count
}

// Count queries cost one read per 1000 matching terms, far less than reading the terms themselves.
export async function readTermCounts(categoryIds: string[]): Promise<TermCounts> {
    const termsRef = collection(db, TERMS_COLLECTION)
    const counts = await Promise.all(categoryIds.map(async (categoryId) => {
        const snapshot = await getCountFromServer(query(termsRef, where("categoryId", "==", categoryId)))
        return [categoryId, snapshot.data().count] as const
    }))

    return Object.fromEntries(counts)
}

// One batch: the new terms and the log. Terms the category already has (ignoring case) are skipped and returned,
// so adding the same list twice changes nothing.
export async function createTerms(category: Category, values: string[]): Promise<AddedTerms> {
    const termList = validateTermList(values)
    if (!termList.ok) throw new Error(termList.error)

    const [categoryDoc, existingTerms] = await Promise.all([
        getDoc(doc(db, CATEGORIES_COLLECTION, category.id)),
        readTermsByCategoryIds([category.id])
    ])
    if (!categoryDoc.exists()) {
        throw new Error(`"${category.value}" was deleted.`)
    }

    const knownKeys = new Set(existingTerms.map((term) => nameKey(term.value)))
    const added = termList.terms.filter((term) => !knownKeys.has(nameKey(term)))
    const skipped = termList.terms.filter((term) => knownKeys.has(nameKey(term)))
    if (added.length === 0) {
        return {added, skipped}
    }

    const batch = writeBatch(db)
    added.forEach((term) => {
        batch.set(doc(collection(db, TERMS_COLLECTION)), {value: term, categoryId: category.id, source: "admin"})
    })
    addLogToBatch(batch, {
        type: "term",
        action: "created",
        category: category.value,
        terms: added,
        isNewCategory: null
    })
    await batch.commit()

    return {added, skipped}
}

export async function updateTerm(term: Term, value: string, categoryName: string) {
    const batch = writeBatch(db)
    batch.update(doc(db, TERMS_COLLECTION, term.id), {value})
    addLogToBatch(batch, {
        type: "term",
        action: "updated",
        category: categoryName,
        terms: [term.value, value],
        isNewCategory: null
    })
    await batch.commit()
}

export async function deleteTerm(term: Term, categoryName: string) {
    const batch = writeBatch(db)
    batch.delete(doc(db, TERMS_COLLECTION, term.id))
    addLogToBatch(batch, {
        type: "term",
        action: "deleted",
        category: categoryName,
        terms: [term.value],
        isNewCategory: null
    })
    await batch.commit()
}
