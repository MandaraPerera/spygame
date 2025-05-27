import {collection, getDocs} from "firebase/firestore";
import {db} from "@/services/firebase.ts";
import {Category} from "@/model";

const CATEGORIES_COLLECTION = 'categories'

export const getAllCategories = async () => {
    const querySnapshot = await getDocs(collection(db, CATEGORIES_COLLECTION))
    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    })) as Category[]
}