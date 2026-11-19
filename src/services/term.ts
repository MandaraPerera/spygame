import {addDoc, collection, getCountFromServer, getDocs, query, where} from "firebase/firestore";
import type {Term, TermData} from "@/model";
import {db} from "@/services";

const TERMS_COLLECTION = 'terms'

export async function createTerm(termData: TermData) {
    const termsRef = collection(db, TERMS_COLLECTION)
    const termDoc = await addDoc(termsRef, termData)

    return {id: termDoc.id, ...termData} as Term
}

export async function readTermsByCategoryIds(categoryIds: string[]) {
    const terms: Term[] = []

    for (const categoryId of categoryIds) {
        const termsRef = collection(db, TERMS_COLLECTION)
        const termsQuery = query(termsRef, where("categoryId", "==", categoryId))
        const querySnapshot = await getDocs(termsQuery)

        terms.push(...(
            querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            })) as Term[]
        ))
    }

    return terms
}

export async function readAmountOfTerms() {
    const termsRef = collection(db, TERMS_COLLECTION)
    const querySnapshot = await getCountFromServer(termsRef)
    return querySnapshot.data().count
}
