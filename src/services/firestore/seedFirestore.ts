import {collection, doc, getDocs, writeBatch} from "firebase/firestore"
import {db} from "@/services/firebase.ts";
import {CategoryData, TermData} from "@/model";

type Data = {
    categories: CategoryData[],
    terms: TermData[]
}

export async function seedFirestore() {
    await clearCollection("categories")
    await clearCollection("terms")

    const data = await getData();
    await seedCollections(data)
}

async function getData() {
    return await fetch("/data.json")
        .then((response) => response.json())
        .catch((error) => console.error(error));
}

async function clearCollection(collectionName: string) {
    const collectionQuery = collection(db, collectionName)
    const querySnapshot = await getDocs(collectionQuery)

    const batch = writeBatch(db)
    querySnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref)
    })
    await batch.commit()
}

async function seedCollections(data: Data) {
    // Categories
    const categoriesIdMap: string[] = []
    const categoriesRef = collection(db, "categories")
    const categoriesBatch = writeBatch(db)

    data.categories.forEach((category: CategoryData, index: number) => {
        const docRef = doc(categoriesRef)
        categoriesBatch.set(docRef, category)
        categoriesIdMap[index] = docRef.id
    })

    await categoriesBatch.commit()

    // Terms
    const termsRef = collection(db, "terms")
    const termsBatch = writeBatch(db)

    data.terms.forEach((term: TermData) => {
        const termData: TermData = {
            ...term,
            categoryId: categoriesIdMap[parseInt(term.categoryId) - 1]
        }
        const docRef = doc(termsRef)
        termsBatch.set(docRef, termData)
    })

    await termsBatch.commit()
}