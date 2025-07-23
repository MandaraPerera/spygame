import {addDoc, collection, getCountFromServer, getDocs, query, where} from "firebase/firestore";
import {db} from "@/services/firebase.ts";
import {Category, CategoryData} from "@/model";

const CATEGORIES_COLLECTION = 'categories'

export const createCategory = async (categoryData: CategoryData) => {
    const categoriesRef = collection(db, CATEGORIES_COLLECTION)
    const categoryDoc = await addDoc(categoriesRef, categoryData)

    return {id: categoryDoc.id, ...categoryData} as Category
}

export const getCategoryIdByName = async (categoryName: string) => {
    const categoriesRef = collection(db, CATEGORIES_COLLECTION)
    const categoriesQuery = query(categoriesRef, where("value", "==", categoryName))
    const querySnapshot = await getDocs(categoriesQuery)

    const doc = querySnapshot.docs[0]
    if (!doc) {
        throw new Error(`Category with name ${categoryName} not found`)
    }

    return doc.id
}

export const getAllCategories = async () => {
    const querySnapshot = await getDocs(collection(db, CATEGORIES_COLLECTION))
    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    })) as Category[]
}

export const getAmountOfCategories = async () => {
    const categoriesRef = collection(db, CATEGORIES_COLLECTION)
    const querySnapshot = await getCountFromServer(categoriesRef)
    return querySnapshot.data().count
}