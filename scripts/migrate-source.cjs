// Replaces isOriginal with source on categories and terms written before the source field:
// - isOriginal: true becomes "original";
// - isOriginal: false becomes "admin" when the logs show an admin created it, and "community" otherwise.
// The logs store names, not ids, so creations are followed through later renames and deletions.
// Usage: node scripts/migrate-source.cjs [--write]. Without --write it only prints what it would change.
// With FIRESTORE_EMULATOR_HOST set it migrates the emulator instead of the live project.
require("dotenv").config({quiet: true});

const path = require("path");
const {cert, initializeApp} = require("firebase-admin/app");
const {FieldValue, getFirestore} = require("firebase-admin/firestore");

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

// Same as nameKey in src/utils/suggestion.ts.
const nameKey = (value) => String(value).trim().replace(/\s+/g, " ").toLocaleLowerCase();
const termKey = (category, term) => `${nameKey(category)}\n${nameKey(term)}`;

// Replays the admin logs, oldest first, into the categories and terms an admin created that still exist.
function readAdminContent(logs) {
    const categories = new Set();
    let terms = new Set();

    const renameCategory = (from, to) => {
        if (categories.delete(nameKey(from))) categories.add(nameKey(to));
        const prefix = `${nameKey(from)}\n`;
        terms = new Set([...terms].map((key) => key.startsWith(prefix) ? `${nameKey(to)}\n${key.slice(prefix.length)}` : key));
    };

    for (const log of logs) {
        const values = Array.isArray(log.terms) ? log.terms : [];

        if (log.type === "category" && log.action === "created") {
            categories.add(nameKey(log.category));
            values.forEach((term) => terms.add(termKey(log.category, term)));
        } else if (log.type === "category" && log.action === "updated" && values[0]) {
            renameCategory(values[0], log.category);
        } else if (log.type === "category" && log.action === "deleted") {
            renameCategory(log.category, "\u0000deleted");
        } else if (log.type === "term" && log.action === "created") {
            values.forEach((term) => terms.add(termKey(log.category, term)));
        } else if (log.type === "term" && log.action === "updated" && values.length === 2) {
            if (terms.delete(termKey(log.category, values[0]))) terms.add(termKey(log.category, values[1]));
        } else if (log.type === "term" && log.action === "deleted") {
            values.forEach((term) => terms.delete(termKey(log.category, term)));
        }
    }

    return {categories, terms};
}

function sourceOf(doc, isAdmin) {
    if (doc.get("isOriginal") === true) return "original";
    return isAdmin ? "admin" : "community";
}

async function main() {
    const target = initialize();
    const write = process.argv.includes("--write");
    const db = getFirestore();

    const [categories, terms, logs] = await Promise.all([
        db.collection("categories").get(),
        db.collection("terms").get(),
        db.collection("logs").orderBy("timestamp", "asc").get()
    ]);
    const admin = readAdminContent(logs.docs.map((doc) => doc.data()));
    const categoryNames = new Map(categories.docs.map((doc) => [doc.id, String(doc.get("value"))]));

    const changes = [];
    for (const doc of categories.docs) {
        if (doc.get("source") !== undefined) continue;
        const source = sourceOf(doc, admin.categories.has(nameKey(doc.get("value"))));
        changes.push({ref: doc.ref, source, label: `category "${doc.get("value")}"`});
    }
    for (const doc of terms.docs) {
        if (doc.get("source") !== undefined) continue;
        const categoryName = categoryNames.get(doc.get("categoryId")) ?? "";
        const source = sourceOf(doc, admin.terms.has(termKey(categoryName, doc.get("value"))));
        changes.push({ref: doc.ref, source, label: `term "${doc.get("value")}" in "${categoryName}"`});
    }

    const counts = {original: 0, admin: 0, community: 0};
    changes.forEach((change) => counts[change.source]++);
    changes.filter((change) => change.source !== "original")
        .forEach((change) => console.log(`${change.source.padEnd(9)} ${change.label}`));
    console.log(`${target}: ${changes.length} documents without a source ` +
        `(${counts.original} original, ${counts.admin} admin, ${counts.community} community).`);

    if (!write) {
        console.log("Dry run: nothing was written. Run again with --write to apply.");
        return;
    }

    for (let index = 0; index < changes.length; index += BATCH_SIZE) {
        const batch = db.batch();
        changes.slice(index, index + BATCH_SIZE)
            .forEach((change) => batch.update(change.ref, {source: change.source, isOriginal: FieldValue.delete()}));
        await batch.commit();
    }
    console.log(`Migrated ${changes.length} documents.`);
}

main().then(() => process.exit(0)).catch((error) => {
    console.error(error);
    process.exit(1);
});
