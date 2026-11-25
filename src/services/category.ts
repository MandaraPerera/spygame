import {collection, doc, getCountFromServer, getDocs, writeBatch} from "firebase/firestore";
import type {Category} from "@/model";
import {checkLength, chunk, findCategoryByName, normalizeName, toContentSource, validateTermList} from "@/utils";
import {BATCH_SIZE, CATEGORIES_COLLECTION, TERMS_COLLECTION} from "./collections";
import {db} from "./firebase";
import {addLogToBatch} from "./log";
import {readTermsByCategoryIds} from "./term";

export async function readCategories(): Promise<Category[]> {
    const querySnapshot = await getDocs(collection(db, CATEGORIES_COLLECTION))
    return querySnapshot.docs.map((categoryDoc): Category => {
        const data = categoryDoc.data()
        return {id: categoryDoc.id, value: data.value, source: toContentSource(data)}
    })
}

export async function readAmountOfCategories() {
    const querySnapshot = await getCountFromServer(collection(db, CATEGORIES_COLLECTION))
    return querySnapshot.data().count
}

// One batch: the category, its first terms and the log. A category is never created empty, because the game
// cannot deal from it.
export async function createCategory(name: string, terms: string[]): Promise<Category> {
    const value = normalizeName(name)
    const lengthError = checkLength(value, "Category")
    if (lengthError) throw new Error(lengthError)

    const termList = validateTermList(terms)
    if (!termList.ok) throw new Error(termList.error)

    if (findCategoryByName(await readCategories(), value)) {
        throw new Error(`"${value}" already exists.`)
    }

    const batch = writeBatch(db)
    const categoryRef = doc(collection(db, CATEGORIES_COLLECTION))
    batch.set(categoryRef, {value, source: "admin"})
    termList.terms.forEach((term) => {
        batch.set(doc(collection(db, TERMS_COLLECTION)), {value: term, categoryId: categoryRef.id, source: "admin"})
    })
    addLogToBatch(batch, {
        type: "category",
        action: "created",
        category: value,
        terms: termList.terms,
        isNewCategory: null
    })
    await batch.commit()

    return {id: categoryRef.id, value, source: "admin"}
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
