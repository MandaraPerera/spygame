import {readFileSync} from "node:fs";
import {
    assertFails,
    assertSucceeds,
    initializeTestEnvironment,
    type RulesTestEnvironment
} from "@firebase/rules-unit-testing";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    type Firestore,
    getDocs,
    serverTimestamp,
    setDoc,
    Timestamp,
    writeBatch
} from "firebase/firestore";
import {afterAll, beforeAll, beforeEach, describe, it} from "vitest";

let testEnv: RulesTestEnvironment

beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
        projectId: "demo-spygame",
        firestore: {rules: readFileSync("firestore.rules", "utf8")}
    })
})

afterAll(async () => {
    await testEnv.cleanup()
})

beforeEach(async () => {
    await testEnv.clearFirestore()
})

const anonymous = () => testEnv.unauthenticatedContext().firestore() as unknown as Firestore
const signedIn = () => testEnv.authenticatedContext("visitor").firestore() as unknown as Firestore
const admin = () => testEnv.authenticatedContext("admin", {admin: true}).firestore() as unknown as Firestore

const suggestion = (overrides: object = {}) => ({
    category: "Animals",
    terms: ["Lion", "Tiger", "Zebra", "Giraffe", "Elephant"],
    isNewCategory: true,
    timestamp: serverTimestamp(),
    ...overrides
})

const log = (overrides: object = {}) => ({
    userId: "admin",
    type: "suggestion",
    action: "approved",
    category: "Animals",
    terms: ["Lion"],
    isNewCategory: true,
    timestamp: serverTimestamp(),
    ...overrides
})

async function seedSuggestion(id: string) {
    await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore() as unknown as Firestore, "suggestions", id), {
            ...suggestion(),
            timestamp: Timestamp.now()
        })
    })
}

describe("categories and terms", () => {
    it("can be read by anyone", async () => {
        await assertSucceeds(getDocs(collection(anonymous(), "categories")))
        await assertSucceeds(getDocs(collection(anonymous(), "terms")))
    })

    it("cannot be written by visitors or signed-in non-admins", async () => {
        const term = {value: "Lion", categoryId: "animals", isOriginal: false}
        await assertFails(addDoc(collection(anonymous(), "terms"), term))
        await assertFails(addDoc(collection(signedIn(), "terms"), term))
        await assertFails(addDoc(collection(signedIn(), "categories"), {value: "Animals", isOriginal: false}))
    })

    it("can be written by admins in the expected shape only", async () => {
        await assertSucceeds(addDoc(collection(admin(), "terms"), {value: "Lion", categoryId: "a", isOriginal: false}))
        await assertFails(addDoc(collection(admin(), "terms"), {value: "Lion", categoryId: "a", isOriginal: false, x: 1}))
        await assertFails(addDoc(collection(admin(), "terms"), {value: "a".repeat(21), categoryId: "a", isOriginal: false}))
        await assertFails(addDoc(collection(admin(), "categories"), {value: "Abc", isOriginal: false}))
    })
})

describe("suggestions", () => {
    it("can be created by anyone in the expected shape", async () => {
        await assertSucceeds(addDoc(collection(anonymous(), "suggestions"), suggestion()))
        await assertSucceeds(addDoc(collection(anonymous(), "suggestions"),
            suggestion({terms: Array.from({length: 50}, (_, i) => `Term ${i}`)})))
    })

    it("reject a client-chosen timestamp", async () => {
        await assertFails(addDoc(collection(anonymous(), "suggestions"), suggestion({timestamp: Timestamp.fromMillis(0)})))
        await assertFails(addDoc(collection(anonymous(), "suggestions"), suggestion({timestamp: 0})))
    })

    it("reject malformed documents", async () => {
        const suggestions = collection(anonymous(), "suggestions")
        await assertFails(addDoc(suggestions, suggestion({terms: "Lion"})))
        await assertFails(addDoc(suggestions, suggestion({terms: [1, 2]})))
        await assertFails(addDoc(suggestions, suggestion({terms: []})))
        await assertFails(addDoc(suggestions, suggestion({terms: Array.from({length: 51}, (_, i) => `Term ${i}`)})))
        await assertFails(addDoc(suggestions, suggestion({terms: ["Lion", 2]})))
        await assertFails(addDoc(suggestions, suggestion({terms: ["Lion", "x".repeat(1000)]})))
        await assertFails(addDoc(suggestions, suggestion({category: "Abc"})))
        await assertFails(addDoc(suggestions, suggestion({isNewCategory: "yes"})))
        await assertFails(addDoc(suggestions, suggestion({extra: true})))
    })

    it("cannot be read or deleted by visitors or signed-in non-admins", async () => {
        await seedSuggestion("s1")
        await assertFails(getDocs(collection(anonymous(), "suggestions")))
        await assertFails(getDocs(collection(signedIn(), "suggestions")))
        await assertFails(deleteDoc(doc(signedIn(), "suggestions", "s1")))
    })

    it("can be read and deleted by admins", async () => {
        await seedSuggestion("s1")
        await assertSucceeds(getDocs(collection(admin(), "suggestions")))
        await assertSucceeds(deleteDoc(doc(admin(), "suggestions", "s1")))
    })
})

describe("logs", () => {
    it("can be written by an admin for themselves only", async () => {
        await assertSucceeds(addDoc(collection(admin(), "logs"), log()))
        await assertFails(addDoc(collection(admin(), "logs"), log({userId: "someone-else"})))
        await assertFails(addDoc(collection(admin(), "logs"), log({action: "hacked"})))
        await assertFails(addDoc(collection(signedIn(), "logs"), log({userId: "visitor"})))
    })

    it("cannot be changed or deleted", async () => {
        const logRef = await addDoc(collection(admin(), "logs"), log())
        await assertFails(setDoc(logRef, log({action: "denied"})))
        await assertFails(deleteDoc(logRef))
    })
})

describe("approving a suggestion", () => {
    it("succeeds as one batch for an admin", async () => {
        await seedSuggestion("s1")
        const db = admin()
        const batch = writeBatch(db)
        const categoryRef = doc(collection(db, "categories"))
        batch.set(categoryRef, {value: "Animals", isOriginal: false})
        batch.set(doc(collection(db, "terms")), {value: "Lion", categoryId: categoryRef.id, isOriginal: false})
        batch.set(doc(collection(db, "logs")), log())
        batch.delete(doc(db, "suggestions", "s1"))

        await assertSucceeds(batch.commit())
    })

    it("writes nothing when one term breaks the rules", async () => {
        await seedSuggestion("s1")
        const db = admin()
        const batch = writeBatch(db)
        batch.set(doc(collection(db, "terms")), {value: "Lion", categoryId: "a", isOriginal: false})
        batch.set(doc(collection(db, "terms")), {value: "x".repeat(21), categoryId: "a", isOriginal: false})
        batch.delete(doc(db, "suggestions", "s1"))

        await assertFails(batch.commit())
        await assertSucceeds(getDocs(collection(admin(), "suggestions")))
    })
})
