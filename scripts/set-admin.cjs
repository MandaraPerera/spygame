// Grants, or with --revoke removes, the admin claim that the app and the Firestore rules check.
// Usage: node scripts/set-admin.cjs <email> [--revoke]
// Needs FIREBASE_ADMINSDK_SERVICE_ACCOUNT_PATH in .env (see .env.example).
require("dotenv").config({quiet: true});

const path = require("path");
const {cert, initializeApp} = require("firebase-admin/app");
const {getAuth} = require("firebase-admin/auth");

async function main() {
    const [email, flag] = process.argv.slice(2);
    if (!email) {
        throw new Error("Usage: node scripts/set-admin.cjs <email> [--revoke]");
    }

    const serviceAccountPath = process.env.FIREBASE_ADMINSDK_SERVICE_ACCOUNT_PATH;
    if (!serviceAccountPath) {
        throw new Error("FIREBASE_ADMINSDK_SERVICE_ACCOUNT_PATH is not set (see .env.example).");
    }

    initializeApp({credential: cert(require(path.resolve(process.cwd(), serviceAccountPath)))});

    const auth = getAuth();
    const user = await auth.getUserByEmail(email);
    const isAdmin = flag !== "--revoke";
    await auth.setCustomUserClaims(user.uid, {...(user.customClaims ?? {}), admin: isAdmin});

    console.log(`${isAdmin ? "Granted" : "Revoked"} the admin claim for ${email}. It applies after the next sign-in.`);
}

main().then(() => process.exit(0)).catch((error) => {
    console.error(error.message ?? error);
    process.exit(1);
});
