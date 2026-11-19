require("dotenv").config();

const {cert, initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");

const serviceAccountPath = process.env.FIREBASE_ADMINSDK_SERVICE_ACCOUNT_PATH;

if (!serviceAccountPath) {
    console.error("Error: FIREBASE_ADMINSDK_SERVICE_ACCOUNT_PATH is not set in the environment variables.");
    process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

const dataPath = path.join(__dirname, "data.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

async function clearCollection(collection) {
    const collectionRef = db.collection(collection);
    const snapshot = await collectionRef.get();

    const batch = db.batch();
    snapshot.forEach((doc) => {
        batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Cleared collection: ${collection}`);
}

async function seedData() {
    try {
        // Clear collections
        await clearCollection("categories");
        await clearCollection("terms");

        // Seed categories
        const categoriesIdMap = {};
        const categoriesRef = db.collection("categories");
        const categoriesBatch = db.batch();
        data.categories.forEach((category, index) => {
            const docRef = categoriesRef.doc();
            categoriesBatch.set(docRef, category);
            categoriesIdMap[index + 1] = docRef.id;
        });
        await categoriesBatch.commit();
        console.log("Collection seeded: categories");

        // Seed terms
        const termsRef = db.collection("terms");
        const termsBatch = db.batch();
        data.terms.forEach((term) => {
            const termData = {
                ...term,
                categoryId: categoriesIdMap[term.categoryId]
            };
            const docRef = termsRef.doc();
            termsBatch.set(docRef, termData);
        });
        await termsBatch.commit();
        console.log("Collection seeded: terms");
    } catch (e) {
        console.error(e);
    }
}

seedData().then(() => process.exit());