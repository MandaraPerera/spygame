// Fills the local emulators (`npm run emulators`) for `npm run dev:emulators`: the original content from
// data/data.json, a few suggestions to review (one of them malformed) and an admin account.
// Usage: npm run emulators:seed. It never reaches a live project: the hosts below force the emulators and the
// project id starts with `demo-`. Re-running replaces the suggestions and keeps everything else.
process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8181";
process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";

const fs = require("fs");
const path = require("path");
const {initializeApp} = require("firebase-admin/app");
const {getAuth} = require("firebase-admin/auth");
const {getFirestore, Timestamp} = require("firebase-admin/firestore");
const {seed} = require("../data/seed.cjs");

const PROJECT_ID = "demo-spygame";

// An emulator-only account; it does not exist anywhere else.
const ADMIN_EMAIL = "admin@spygame.test";
const ADMIN_PASSWORD = "emulator-admin";

const minutesAgo = (minutes) => Timestamp.fromMillis(Date.now() - minutes * 60 * 1000);

const SUGGESTIONS = [
    {
        category: "Animals",
        terms: ["Lion", "Tiger", "Zebra", "Giraffe", "Elephant", "Penguin"],
        isNewCategory: true,
        timestamp: minutesAgo(30)
    },
    {
        // "Belgium" is already in the game, so the review shows it as a duplicate.
        category: "Countries",
        terms: ["Belgium", "Luxembourg", "Iceland"],
        isNewCategory: false,
        timestamp: minutesAgo(20)
    },
    {
        category: "Sports",
        terms: ["Curling", "Fencing", "Rowing", "Archery", "Lacrosse"],
        isNewCategory: true,
        timestamp: minutesAgo(10)
    },
    {
        // What a direct write could store if the rules were not deployed: it can only be denied.
        category: "Broken",
        terms: "not a list",
        isNewCategory: true,
        timestamp: minutesAgo(5)
    }
];

async function seedAdmin() {
    const auth = getAuth();
    const user = await auth.getUserByEmail(ADMIN_EMAIL)
        .catch(() => auth.createUser({email: ADMIN_EMAIL, password: ADMIN_PASSWORD}));
    await auth.setCustomUserClaims(user.uid, {admin: true});
}

async function seedSuggestions(db) {
    const suggestionsRef = db.collection("suggestions");
    const batch = db.batch();
    (await suggestionsRef.get()).docs.forEach((doc) => batch.delete(doc.ref));
    SUGGESTIONS.forEach((suggestion) => batch.set(suggestionsRef.doc(), suggestion));
    await batch.commit();
}

async function main() {
    initializeApp({projectId: PROJECT_ID});
    const db = getFirestore();
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "data.json"), "utf-8"));

    await seed(db, data);
    await seedSuggestions(db);
    await seedAdmin();

    console.log(`Added ${SUGGESTIONS.length} suggestions and the admin ${ADMIN_EMAIL} (password in this script).`);
}

main().then(() => process.exit(0)).catch((error) => {
    console.error(error.message ?? error);
    console.error("Are the emulators running? Start them with `npm run emulators`.");
    process.exit(1);
});
