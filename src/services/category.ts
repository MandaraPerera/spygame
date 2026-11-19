import {collection, doc, getCountFromServer, getDocs, writeBatch} from "firebase/firestore";
import type {Category} from "@/model";
import {chunk} from "@/utils";
import {db} from "./firebase";
import {addLogToBatch} from "./log";
import {readTermsByCategoryIds, TERMS_COLLECTION} from "./term";

export const CATEGORIES_COLLECTION = 'categories'

// Stay well below Firestore's limit of 500 writes per batch.
const BATCH_SIZE = 450

export async function readCategories(): Promise<Category[]> {
    const querySnapshot = await getDocs(collection(db, CATEGORIES_COLLECTION))
    return querySnapshot.docs.map((categoryDoc) => ({
        id: categoryDoc.id,
        ...categoryDoc.data()
    })) as Category[]
}

export async function readAmountOfCategories() {
    const querySnapshot = await getCountFromServer(collection(db, CATEGORIES_COLLECTION))
    return querySnapshot.data().count
}

export async function updateCategory(category: Category, value: string) {
    const batch = writeBatch(db)
    batch.update(doc(db, CATEGORIES_COLLECTION, category.id), {value})
    addLogToBatch(batch, {
        type: "category",
        action: "updated",
        category: value,
        terms: [category.value],
        isNewCategory: null
    })
    await batch.commit()
}

// Terms go first: if a batch fails, the category is still there and a retry finishes the job.
export async function deleteCategory(category: Category) {
    const terms = await readTermsByCategoryIds([category.id])

    for (const termsChunk of chunk(terms, BATCH_SIZE)) {
        const batch = writeBatch(db)
        termsChunk.forEach((term) => batch.delete(doc(db, TERMS_COLLECTION, term.id)))
        await batch.commit()
    }

    const batch = writeBatch(db)
    batch.delete(doc(db, CATEGORIES_COLLECTION, category.id))
    addLogToBatch(batch, {
        type: "category",
        action: "deleted",
        category: category.value,
        terms: terms.map((term) => term.value),
        isNewCategory: null
    })
    await batch.commit()
}
