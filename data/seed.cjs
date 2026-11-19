// Seeds the original categories and terms from data/data.json.
// Usage: node data/seed.cjs [--yes]
// - A category is matched by name and keeps its id, so saved selections and approved terms keep working.
// - Only original terms (isOriginal: true) are replaced; terms from approved suggestions are kept.
// - With FIRESTORE_EMULATOR_HOST set, it seeds the local emulator instead of the live project.
require("dotenv").config({quiet: true});

const fs = require("fs");
const path = require("path");
const readline = require("readline/promises");
const {cert, initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");

// Stay below Firestore's limit of 500 writes per batch.
const BATCH_SIZE = 450;

function initialize() {
    if (process.env.FIRESTORE_EMULATOR_HOST) {
        const projectId = process.env.GCLOUD_PROJECT ?? "demo-spygame";
        initializeApp({projectId});
        return `the emulator (${projectId})`;
    }

    const serviceAccountPath = process.env.FIREBASE_ADMINSDK_SERVICE_ACCOUNT_PATH;
    if (!serviceAccountPath) {
        throw new Error("FIREBASE_ADMINSDK_SERVICE_ACCOUNT_PATH is not set (see .env.example).");
    }

    const serviceAccount = require(path.resolve(process.cwd(), serviceAccountPath));
    initializeApp({credential: cert(serviceAccount)});
    return `the LIVE project ${serviceAccount.project_id}`;
}

async function confirm(target) {
    if (process.argv.includes("--yes")) return true;

    const prompt = readline.createInterface({input: process.stdin, output: process.stdout});
    const answer = await prompt.question(`Seed ${target}? Its original terms will be replaced. Type "yes": `);
    prompt.close();
    return answer.trim().toLowerCase() === "yes";
}

async function commitInBatches(db, operations) {
    for (let index = 0; index < operations.length; index += BATCH_SIZE) {
        const batch = db.batch();
        operations.slice(index, index + BATCH_SIZE).forEach((operation) => operation(batch));
        await batch.commit();
    }
}

async function seed(db, data) {
    const categoriesRef = db.collection("categories");
    const termsRef = db.collection("terms");

    const existingCategories = await categoriesRef.get();
    const idByName = new Map(existingCategories.docs.map((doc) => [String(doc.get("value")).toLowerCase(), doc.id]));

    const categoryIds = {};
    const operations = data.categories.map((category, index) => {
        const knownId = idByName.get(category.value.toLowerCase());
        const categoryRef = knownId ? categoriesRef.doc(knownId) : categoriesRef.doc();
        categoryIds[index + 1] = categoryRef.id;
        return (batch) => batch.set(categoryRef, category);
    });

    const unknownCategory = data.terms.find((term) => !categoryIds[term.categoryId]);
    if (unknownCategory) {
        throw new Error(`Term "${unknownCategory.value}" points to unknown category ${unknownCategory.categoryId}.`);
    }

    const originalTerms = await termsRef.where("isOriginal", "==", true).get();
    operations.push(...originalTerms.docs.map((doc) => (batch) => batch.delete(doc.ref)));
    operations.push(...data.terms.map((term) => (batch) =>
        batch.set(termsRef.doc(), {...term, categoryId: categoryIds[term.categoryId]})));

    // With today's data this is a single batch, so the game never sees a half-seeded state.
    await commitInBatches(db, operations);
    console.log(`Seeded ${data.categories.length} categories and ${data.terms.length} terms; ` +
        `replaced ${originalTerms.size} original terms.`);
}

async function main() {
    const target = initialize();
    if (!(await confirm(target))) {
        console.log("Cancelled.");
        return;
    }

    const data = JSON.parse(fs.readFileSync(path.join(__dirname, "data.json"), "utf-8"));
    await seed(getFirestore(), data);
}

main().then(() => process.exit(0)).catch((error) => {
    console.error(error);
    process.exit(1);
});
