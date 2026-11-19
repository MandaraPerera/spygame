import {
    collection,
    doc,
    getCountFromServer,
    getDocs,
    query,
    where,
    writeBatch
} from "firebase/firestore";
import type {Term} from "@/model";
import {chunk} from "@/utils";
import {db} from "./firebase";
import {addLogToBatch} from "./log";

export const TERMS_COLLECTION = 'terms'

// Firestore allows at most 30 values in an `in` filter.
const IN_FILTER_LIMIT = 30

export async function readTermsByCategoryIds(categoryIds: string[]): Promise<Term[]> {
    const termsRef = collection(db, TERMS_COLLECTION)
    const snapshots = await Promise.all(
        chunk(categoryIds, IN_FILTER_LIMIT).map((ids) => getDocs(query(termsRef, where("categoryId", "in", ids))))
    )

    return snapshots.flatMap((querySnapshot) =>
        querySnapshot.docs.map((termDoc) => ({id: termDoc.id, ...termDoc.data()}) as Term))
}

export async function readAmountOfTerms() {
    const querySnapshot = await getCountFromServer(collection(db, TERMS_COLLECTION))
    return querySnapshot.data().count
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
