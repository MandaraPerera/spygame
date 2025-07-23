import {addDoc, collection, getCountFromServer, getDocs, query, where} from "firebase/firestore";
import {Term, TermData} from "@/model";
import {db} from "@/services/firebase.ts";

const TERMS_COLLECTION = 'terms'

export const createTerm = async (termData: TermData) => {
    const termsRef = collection(db, TERMS_COLLECTION)
    const termDoc = await addDoc(termsRef, termData)

    return {id: termDoc.id, ...termData} as Term
}

export const getAllTermsByCategoryId = async (categoryIds: string[]) => {
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

export const getAmountOfTerms = async () => {
    const termsRef = collection(db, TERMS_COLLECTION)
    const querySnapshot = await getCountFromServer(termsRef)
    return querySnapshot.data().count
}