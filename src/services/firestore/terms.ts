import {collection, getDocs, query, where} from "firebase/firestore";
import {Term} from "@/model";
import {db} from "@/services/firebase.ts";

const TERMS_COLLECTION = 'terms'

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