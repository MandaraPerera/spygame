// Fails when a production bundle assigns the App Check debug token a literal value.
// Runs before every `firebase deploy` of hosting (see firebase.json) and in CI.
import {readdirSync, readFileSync} from "node:fs";
import {join} from "node:path";

const assetsDir = join(process.cwd(), "dist", "assets")
const tokenAssignment = /FIREBASE_APPCHECK_DEBUG_TOKEN\s*=\s*["'`]/

let files
try {
    files = readdirSync(assetsDir).filter((file) => file.endsWith(".js"))
} catch {
    console.error("dist/assets not found: run `npm run build` first.")
    process.exit(1)
}

const offenders = files.filter((file) => tokenAssignment.test(readFileSync(join(assetsDir, file), "utf8")))

if (offenders.length > 0) {
    console.error(`An App Check debug token is inlined in: ${offenders.join(", ")}. Do not deploy this build.`)
    process.exit(1)
}

console.log(`Bundle check passed: no App Check debug token in ${files.length} files.`)
