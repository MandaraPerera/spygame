import {addDoc, collection, getCountFromServer, getDocs, query, where} from "firebase/firestore";
import type {Category, CategoryData} from "@/model";
import {db} from "@/services";

const CATEGORIES_COLLECTION = 'categories'

export async function createCategory(categoryData: CategoryData) {
    const categoriesRef = collection(db, CATEGORIES_COLLECTION)
    const categoryDoc = await addDoc(categoriesRef, categoryData)

    return {id: categoryDoc.id, ...categoryData} as Category
}

export async function readCategoryIdByName(categoryName: string) {
    const categoriesRef = collection(db, CATEGORIES_COLLECTION)
    const categoriesQuery = query(categoriesRef, where("value", "==", categoryName))
    const querySnapshot = await getDocs(categoriesQuery)

    const doc = querySnapshot.docs[0]
    if (!doc) {
        throw new Error(`Category with name ${categoryName} not found`)
    }

    return doc.id
}

export async function readCategories() {
    const querySnapshot = await getDocs(collection(db, CATEGORIES_COLLECTION))
    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    })) as Category[]
}

export async function readAmountOfCategories() {
    const categoriesRef = collection(db, CATEGORIES_COLLECTION)
    const querySnapshot = await getCountFromServer(categoriesRef)
    return querySnapshot.data().count
}
