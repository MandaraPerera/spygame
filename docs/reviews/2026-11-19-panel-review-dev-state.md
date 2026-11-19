# Panel review `dev-state`: spygame

Date: 19 November 2026. Status: **processed the same day; see Follow-up**.
Scope: state review of branch `dev` at `a31e557` (= `origin/dev`, 42 commits), read from the working tree, including one
uncommitted edit to `src/services/firebase.ts` (+3/-1). About 2,770 source lines in `src/` plus about 330 lines of
config, CI and seed; there are no tests. Read in full: the Firestore and hosting config, auth and routing, all services,
hooks and models, all pages and feature components, the seed script, the build config and both workflows. Sampled:
the Chakra CLI snippets in `src/components/ui/`, `data/data.json` and `package-lock.json`. No neighbour repo; no earlier
reviews. Findings are in order of importance.
Panel: security (Fable), correctness (Fable), architecture (Opus), performance (Opus), maintainability (Opus),
ui (Opus); skeptic (Fable, two instances split by area); effort high; tier default; the skeptic verified Critical, High
and Medium candidates; security checklist OWASP, with `references/mobile-client.md` and `references/api-server.md`.
Not covered: the deployed Firebase configuration (live Firestore rules, App Check enforcement, the Auth sign-up setting,
API key restrictions, service-account roles) was not read, so findings 2, 7, 12 and 13 depend on it. The
lower-severity notes were not independently verified. Lint, tests and build were not run by this review. The security
pass ran `npm audit --package-lock-only`, which queries the npm registry.

| # | Severity | Finding | Raised by | Verdict |
|---|---|---|---|---|
| 1 | High | Lowering the player count leaves the spy count, so PLAY freezes the tab or deals too many spies | correctness, performance, ui, maintainability | Confirmed |
| 2 | High | The repo's Firestore rules are an expired catch-all; a full deploy takes the app down | security, correctness, architecture | Confirmed (repo), Plausible (live) |
| 3 | Medium | Play shows its skeleton forever when no term is available | correctness, ui, maintainability | Confirmed |
| 4 | Medium | Suggest Submit has no pending guard and no error handling | performance, ui, correctness | Confirmed |
| 5 | Medium | The Suggest form submits a category the screen no longer shows | correctness, ui, maintainability | Confirmed |
| 6 | Medium | Approving a suggestion is not atomic and deletes it even when it failed | correctness, architecture, performance, maintainability | Confirmed (structure), Plausible (term loss) |
| 7 | Medium | The uncommitted edit inlines the App Check debug token into local production builds | security, architecture, maintainability | Confirmed |
| 8 | Medium | The auth loading state is never true, so admin pages flash "Not Authorized" | maintainability, correctness, ui | Confirmed |
| 9 | Medium | A failed load of the review queue is shown as an empty queue | ui, security | Confirmed |
| 10 | Medium | Suggestion rows are keyed by index, so an error moves to the next suggestion | maintainability, ui, correctness | Confirmed |
| 11 | Medium | `seed.cjs` wipes approved content in production, is not atomic and exits 0 on failure | correctness, security | Confirmed |
| 12 | Medium | Anyone can store a malformed suggestion that breaks the admin queue | security, correctness | Confirmed (code), conditional on live rules |
| 13 | Medium | Anonymous suggestion creation has no limit | security | Plausible |
| 14 | Medium | No tests, and CI deploys to live after a build only | maintainability, architecture | Confirmed |
| 15 | Low | Admin pages start their Firestore reads before the guard decides | architecture, security | Confirmed |
| 16 | Low | Starting a game loads terms one category at a time and reads all of them | performance | Confirmed |
| 17 | Low | The suggestions listener only invalidates, multiplying reads per action | performance | Confirmed (cost), Plausible (lost Load More) |
| 18 | Low | Logs and the admin data pages have nothing behind them; Deny is one tap | architecture, correctness, maintainability, security | Confirmed |
| 19 | Low | The reveal screen shows no "player N of M" and EXIT re-deals without confirmation | ui | Confirmed as fact |
| 20 | Low | README says `npm run lint` sorts imports, but it does not | maintainability | Confirmed |


## Follow-up (19 November 2026)

All 20 findings were worked on the same day. After the changes: lint passes, 37 unit and
component tests pass, the 12 rules tests pass on the Firestore emulator, the production build passes, and a build
with a fake debug token set on purpose does not contain it.

| # | Outcome |
|---|---|
| 1 | Fixed. Spies are clamped on every read and when players change; spies are drawn with a Fisher-Yates shuffle. |
| 2 | Fixed in the repo: real per-collection rules and `scripts/set-admin.cjs`. **Not deployed**: see "Left for you". |
| 3 | Fixed. Error, no-selection and no-words states; settings store category ids, unknown ids are ignored. |
| 4 | Fixed. The confirm button shows a pending state; a failed submission shows an error toast. |
| 5 | Fixed. Separate state per mode, controlled select, trimmed and de-duplicated terms, existing names rejected. |
| 6 | Fixed. `approveSuggestion` is one `writeBatch` in the service layer, with the log; errors show in the row. |
| 7 | Fixed. Debug token only in development builds, `.env` moved to `.env.development.local`, bundle check in CI and in the hosting predeploy, old `dist/` deleted. Token revocation is left for you. |
| 8 | Fixed. Auth loading lasts until the first auth state; the admin claim is part of the auth context. |
| 9 | Fixed. The error state is checked first. |
| 10 | Fixed. Rows are keyed by id; errors show inline instead of replacing the row. |
| 11 | Fixed. The seed matches categories by name, keeps approved terms, asks for confirmation, fails with exit code 1. |
| 12 | Fixed in the repo. Rules check the shape, the term types (by index) and sizes, and a server timestamp; malformed suggestions show as deny-only; an error boundary was added. Term length is checked on approval, not in the rules (rules expression limit). |
| 13 | Partly. Rules bound the document size. App Check enforcement and a budget alert are console settings, left for you. No bulk deny was added. |
| 14 | Fixed. Vitest and Testing Library, rules tests on the emulator; CI runs lint, tests, rules tests, build and the bundle check with Node and Java pinned. |
| 15 | Fixed. One `ProtectedRoute` layout route around the admin pages, which are now lazy-loaded. |
| 16 | Fixed. Parallel `in` queries and a 30-minute cache without refetch on focus. Terms were not moved into the category document. |
| 17 | Fixed. One listener on the newest suggestion that skips the first snapshot and this device's own writes. |
| 18 | Fixed. Logs are written in the same batch as each approve, deny, rename and delete; Logs, Categories and Terms pages work; Deny asks for confirmation. |
| 19 | Fixed. "Player N of M" and an EXIT confirmation. Browser Back mid-game still leaves without asking. |
| 20 | Fixed. `lint:fix`, README updated, `import/extensions` rule, `allowImportingTsExtensions` off. |

Lower-severity notes: all were addressed except these, which were left on purpose:

- A full `script-src` CSP: only `frame-ancestors`, `object-src` and `base-uri` were added, because a script policy
  needs testing against reCAPTCHA Enterprise in production.
- A separate staging project for PR previews: infrastructure work.
- `src/model/suggestion.ts` still imports the Firestore cursor type, as README §7 places `PaginatedSuggestions` there.
- The main chunk is still about 1.48 MB (447 KB gzip), mostly Chakra UI and Firebase; the admin pages are split off.

Left for you, in the Firebase console or with your credentials:

1. Compare the live Firestore rules with the new `firestore.rules`. Give your admin account the claim with
   `node scripts/set-admin.cjs <email>` before you deploy the rules (`npx firebase deploy --only firestore:rules`).
2. Revoke the App Check debug token that was in the local build and register a new one for development.
3. Enforce App Check for Firestore, set a budget alert, and disable email/password sign-up if you don't need it.
4. Check which roles the `FIREBASE_SERVICE_ACCOUNT_THE_SPYGAME` service account holds.

---

## 1. Lowering the player count leaves the spy count unchanged, so PLAY freezes the tab or breaks the spy limit

| | |
|---|---|
| **Severity** | High |
| **Place** | `src/components/configuration/SelectPlayers.tsx:26-36`, `src/app/pages/Play.tsx:19-28` |
| **Commit** | `2d889ab` "Simplified selection of settings" (Mandara); loop from `e73be7a` "Some quick changes for future way of managing categories and terms" (Mandara) |
| **Raised by** | correctness, performance, ui; also seen by maintainability |
| **Verdict** | Confirmed by the skeptic |

```tsx
// SelectPlayers.tsx:33-35
} else {
    setAmountOfPlayers(amountOfPlayers - 1)
}
// Play.tsx:22-26
const randomSpies = new Set<number>()
while (randomSpies.size < amountOfSpies) {
    const randomNum = Math.floor(Math.random() * (amountOfPlayers))
    randomSpies.add(randomNum)
}
```

The half-of-players cap exists only on increment, in `SelectSpies`. Decrementing players never touches spies, and Home
only checks that a category is selected. With 10 players and 5 spies lowered to 3 players, the set can hold at most 3
values while the loop waits for 5. The loop runs synchronously in a `useState` initialiser, so PLAY hangs the tab. Both
values persist in localStorage (`SettingsContextProvider.tsx:11-12`), so every later PLAY hangs again until the player
finds the Spies dialog. Without a hang the result still breaks README §1: 4 players with 2 spies lowered to 3 gives
2 spies of 3, and 8 with 4 lowered to 4 makes everyone a spy.

Proposal:

- In `decrementAmountOfPlayers`, also `setAmountOfSpies(Math.min(amountOfSpies, Math.floor((amountOfPlayers - 1) / 2)))`.
- Clamp again in `Play` before sampling, since localStorage is input, and draw spies with a Fisher-Yates shuffle of
  `[0..players)` so the draw always ends.
- Test: spy selection with players 3 and spies 5 terminates with 1 spy; a component test that lowering players from 10
  to 3 with 5 spies leaves 1 spy.

---

## 2. The repo's Firestore rules are an expired catch-all; nothing in the repo authorizes access, and a full deploy takes the app down

| | |
|---|---|
| **Severity** | High (Critical if the live rules are open or only require `request.auth != null`) |
| **Place** | `firestore.rules:5-7`, `firebase.json:16-20` |
| **Commit** | `94c1977` "Refactor" (Mandara); catch-all since `26045e7` "ci" (Mandara) |
| **Raised by** | security, correctness, architecture |
| **Verdict** | Confirmed for the repo; Plausible for production. The skeptic lowered it from Critical. |
| **OWASP** | `A01:2025` Broken Access Control, `API5:2023` Broken Function Level Authorization, `API1:2023` BOLA, `M3:2024` |

```
match /{document=**} {
  allow read, write: if request.time < timestamp.date(2025, 6, 26);
}
```
```json
"firestore": {
  "database": "(default)",
  "rules": "firestore.rules",
  "indexes": "firestore.indexes.json"
}
```

The browser talks to Firestore directly, so these rules are the only server-side authorization. The file has only ever
been "allow everything until a date": first 14 March 2025, moved in May 2025 to 26 June 2025. Since that date it denies
everything. If the live site works, its rules were edited in the console and nobody can review them. Three consequences:

- `firebase.json` wires this file into `firebase deploy`. CI deploys hosting only, but a plain `firebase deploy` from a
  laptop publishes the deny-all rule. Home, Play and Suggest then fail, and the admin cannot review.
- README §5 promises that suggested content appears only after approval. Nothing in the repo enforces that, nor
  admin-only writes to `categories` and `terms`. `ProtectedRoute` reads `claims.admin` in the browser only, and nothing
  tracked sets that claim.
- If the live rules are permissive, an anonymous caller using the public config from the bundle (or a self-registered
  email/password user) writes terms straight into the game and reads or deletes `suggestions`.

Proposal:

- Export the live rules into `firestore.rules`, or write them: public read of `categories` and `terms`; `create` only
  on `suggestions` with shape validation (finding 12); read and delete of `suggestions`, all writes to
  `categories`/`terms`, and all of `logs` gated on `request.auth.token.admin == true`; a final
  `match /{document=**} { allow read, write: if false; }`.
- Until that is committed, remove the `firestore` block from `firebase.json` or deploy only with `--only hosting`.
- Commit the script that sets the `admin` claim, and disable email/password self sign-up if it is not needed.
- Test: rules unit tests on the emulator (`@firebase/rules-unit-testing`): an anonymous user reads terms, creates a
  valid suggestion and is denied writes to `terms`; a non-admin is denied reads of `suggestions`; an admin succeeds.

---

## 3. Play shows its loading skeleton forever when no term is available

| | |
|---|---|
| **Severity** | Medium |
| **Place** | `src/app/pages/Play.tsx:34, 70-91`, `src/hooks/useTerms.ts:21`, `src/context/SettingsContextProvider.tsx:13` |
| **Commit** | `b339d75` "Card flip animation with gsap & some minor changes" (Mandara) |
| **Raised by** | correctness, ui; also seen by maintainability |
| **Verdict** | Confirmed by the skeptic, with a correction (below) |

```tsx
// Play.tsx:70
if (isLoading || !term || !spies) {
    // ... skeleton with an EXIT button (lines 71-86)
}
// Play.tsx:89-91
if (isError || !terms) {
    return <Error text={"Error loading terms"}/>
}
// useTerms.ts:21
enabled: !!categoryIds
```

`term` is null whenever `terms` is undefined or empty, so the skeleton branch wins before the error check. Four inputs
reach it, and the user sees placeholders with no message:

- a failed first fetch;
- `/play` opened directly with nothing selected (`!![]` is true, so the query runs and returns `[]`);
- a category with no terms (finding 6 can create one);
- stale category ids. `selectedCategories` stores whole `Category` objects in localStorage, and `seed.cjs` creates new
  random ids on every run. `SelectCategories` compares by `value`, so the stale entries even look selected.

Skeptic's correction: a failed refetch keeps `data` in TanStack Query 5, so the error branch does render, but only in
the one case where a usable term exists. EXIT still works, so nobody is trapped.

Proposal:

- Check `isError` first, then loading, then treat `terms.length === 0` as an explicit "no words in these categories"
  state with a way back to Home.
- Store category ids only and drop ids that are not in the loaded categories; set `enabled: categoryIds.length > 0`.
- Test: render Play with a rejecting query, with `[]`, and with no selection, and assert a message instead of skeletons.

---

## 4. The Suggest Submit button has no pending guard and no error handling: double taps duplicate, failures are silent

| | |
|---|---|
| **Severity** | Medium |
| **Place** | `src/app/pages/Suggest.tsx:137-155, 316`, `src/hooks/useSuggestions.ts:15-17` |
| **Commit** | `8c22a58` "Suggesting Content" (Mandara) |
| **Raised by** | performance, ui, correctness |
| **Verdict** | Confirmed by the skeptic |

```tsx
// Suggest.tsx:144
await addSuggestion.mutateAsync(suggestion, {
    // ... onSuccess: navigate('/') and a success toast (lines 145-153)
})
// Suggest.tsx:316
<Button onClick={onSubmit}>Submit</Button>
// useSuggestions.ts:15-17
onError: async (error) => {
    console.error(error)
}
```

Each tap starts its own mutation and its own `addDoc`, so two taps before the first acknowledgement store two
identical suggestions; approving both inserts every term twice. A rejected write only reaches `console.error`; the
`mutateAsync` rejection is unhandled, no toast appears and the dialog stays open. Offline, `addDoc` does not settle
until the server acknowledges it, so the visitor sees nothing, taps again and queues another write. If the live rules
deny writes (finding 2), every anonymous submission fails this way.

Proposal:

- `<Button loading={addSuggestion.isPending} onClick={onSubmit}>`, and return early in `onSubmit` while pending.
- Wrap the call in try/catch (or use `mutate` with `onError`) and show an error toast.
- Test: tap Submit twice with a pending mock and assert one `createSuggestion` call; reject the mock and assert a toast.

---

## 5. The Suggest form keeps one category value for both modes and submits what the screen no longer shows

| | |
|---|---|
| **Severity** | Medium |
| **Place** | `src/app/pages/Suggest.tsx:37, 86-135, 189-224` |
| **Commit** | `8c22a58` "Suggesting Content" (Mandara) |
| **Raised by** | correctness, ui; also seen by maintainability |
| **Verdict** | Confirmed by the skeptic |

```tsx
const [category, setCategory] = useState<string>("New category...")
// ...
<Switch.Root gap={0} checked={isNewCategory}
             onCheckedChange={(e) => setIsNewCategory(e.checked)}>
// ...
<Editable.Root defaultValue={category}
               onValueCommit={(e) => setCategory(e.value)}>
// ...
<Select.Root size="sm" minW="170px" width="50%" collection={categoriesCollection}
             onValueChange={(e) => setCategory(e.value[0])}>
```

The Select has no `value` prop and the toggle does not reset `category`:

- Type "Pizzas" in New mode, then switch to Existing. The Select shows its placeholder, validation passes on the hidden
  "Pizzas", and the suggestion is stored with `isNewCategory: false`. On approve, the admin gets "Existing category not
  found", and the suggestion can only be denied.
- Pick "Countries" and switch to New. The field is prefilled, and approval creates a second "Countries". There is no
  uniqueness check anywhere, so typing an existing name does the same. The lookup then takes `docs[0]`, and the
  duplicate's terms can never be selected on their own.
- Lengths are checked on the raw string, so four spaces pass the 4-character minimum, and duplicate terms are accepted.

Proposal:

- Reset `category` to the sentinel in `onCheckedChange` and control the Select (`value={isNewCategory ? [] : [category]}`).
- Trim and de-duplicate terms; reject a new category name that matches an existing one case-insensitively.
- Test: type a new name, toggle to Existing, submit, and assert "Category is not selected".

---

## 6. Approving a suggestion is a sequence of separate writes that deletes the suggestion even when it failed

| | |
|---|---|
| **Severity** | Medium |
| **Place** | `src/components/data/SuggestionItem.tsx:34-92` |
| **Commit** | `73ef79f` "Approving/denying suggestions" (Mandara) |
| **Raised by** | correctness, architecture, performance, maintainability; also seen by security |
| **Verdict** | Confirmed for the structure; Plausible for term loss. The skeptic lowered it from High. |

```tsx
await addCategory.mutateAsync(categoryData, {
    onSuccess: async (newCategory) => {
        try {
            for (const term of suggestion.terms) {
                // ... termData (lines 47-51)
                await addTerm.mutateAsync(termData)
            }
        } catch (e) {
            setError((e as Error).message)
        } finally {
            await removeSuggestion.mutateAsync(suggestion.id)
            setLoading(false)
        }
```

The workflow lives in a component, which orchestrates four hooks. Rule 6 (service, hook, component) is inverted, and the
same block is written twice, once per branch. Consequences:

- A server rejection of term 3 of 5 (`permission-denied` or `invalid-argument`) leaves 2 terms live. The `finally` then
  deletes the suggestion, and the other 3 terms are lost. Offline writes are queued rather than rejected, so this needs
  a server-side refusal.
- A rejected `addCategory.mutateAsync` (line 43) has no catch. Both buttons spin forever and the rejection is
  unhandled; `handleDeny` has the same gap.
- The per-call `onSuccess` does not run if the item unmounts first. An admin who navigates away mid-approve leaves a
  category with no terms (feeding finding 3) and the suggestion still queued; approving again creates a duplicate.
- Up to 50 awaited writes in series, each followed by query invalidations.

Proposal:

- Add `approveSuggestion(suggestion)` in `src/services/suggestion.ts` that builds one `writeBatch`: the category (or a
  looked-up id), all terms, the log document (finding 18) and the delete of the suggestion. Expose it as a mutation in
  `useSuggestions` and call it from the component inside try/catch/finally.
- Make category ids deterministic (the normalised name) or check uniqueness in a transaction.
- Test: with a rejected batch, assert that no category or term was written and that the suggestion still exists.

---

## 7. The uncommitted edit inlines the App Check debug token into any production build made with the local `.env`

| | |
|---|---|
| **Severity** | Medium (conditional on a locally built bundle being deployed) |
| **Place** | `src/services/firebase.ts:22-24` (working tree) |
| **Commit** | uncommitted; the same line was removed before in `532d2ce` and `9cce86e` "removed debug token" |
| **Raised by** | security, architecture, maintainability; also seen by performance and correctness |
| **Verdict** | Confirmed by the skeptic, who lowered it from High |
| **OWASP** | `A04:2025` Cryptographic Failures (secret in client), `M1:2024` Improper Credential Usage, `A02:2025` |

```ts
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
self.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN;
```

The local `.env` defines `VITE_FIREBASE_APPCHECK_DEBUG_TOKEN`, and Vite inlines every `VITE_*` value in production
builds. The local `dist/` built on 19 November already contains the token as a string literal; the panel checked this
without printing it. `npm run build && firebase deploy` from this machine would publish it. Anyone who reads the bundle
then mints App Check tokens without reCAPTCHA, and App Check stops proving that requests come from the app. CI builds
have no `.env`, and the SDK ignores `undefined`, so CI deploys are clean. There is no `.firebase/` cache in the checkout
to show that this folder ever deployed. Medium, not High, because App Check is abuse protection, not authorization, and
the token can be revoked.

Proposal:

- `if (import.meta.env.DEV) { self.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN }`
  and move the variable to `.env.development.local`. Declare the global and the env entry in `src/vite-env.d.ts`
  instead of `@ts-expect-error`, and name the variable in README §6.
- Delete the current `dist/`. If a local build was ever deployed, including to a preview channel, revoke the debug token
  in the App Check console.
- Test: a CI step after `vite build` that fails when the bundle assigns `FIREBASE_APPCHECK_DEBUG_TOKEN` a string literal.

---

## 8. The auth loading state is never true, so admin pages flash "Not Authorized" and `/manage-data` never shows it

| | |
|---|---|
| **Severity** | Medium |
| **Place** | `src/context/AuthContextProvider.tsx:14-21`, `src/components/util/ProtectedRoute.tsx:26-32`, `src/app/pages/ManageData.tsx:15` |
| **Commit** | `4cd8507` "Full refactor to improve structure. Updated dependencies and improved Chakra-UI usage." (Mandara); callback from `9405d95` "Authentication" (Mandara) |
| **Raised by** | maintainability, correctness; also seen by ui |
| **Verdict** | Confirmed by the skeptic |

```tsx
// AuthContextProvider.tsx:14-21
const [isLoading, setIsLoading] = useState<boolean>(false)

useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setIsLoading(true);
        setUser(currentUser);
        setIsLoading(false);
    });
// ManageData.tsx:15
if (isLoading || isLoadingUser || !user) {
```

`isLoading` starts false, and the true/false pair in one callback is batched, so no render sees it true. The time before
Firebase restores the session is therefore reported as "resolved, no user". A signed-in admin who reloads
`/suggestions` sees "Not Authorized", then "Checking authorization", then the page. On `/manage-data` the `!user`
condition returns the skeleton before `ProtectedRoute` is reached, so an anonymous visitor gets a permanent skeleton
instead of "Not Authorized". The same provider also shows the "Welcome!" toast on every page load of a signed-in admin.

Proposal:

- `useState(true)`, and only `setIsLoading(false)` in the callback; drop `|| !user` in `ManageData`.
- Test: render `ProtectedRoute` before the auth callback fires and assert the loading state, then both outcomes.

---

## 9. A failed load of the review queue is shown as "There are no suggestions to be reviewed."

| | |
|---|---|
| **Severity** | Medium |
| **Place** | `src/app/pages/Suggestions.tsx:34, 49-60` |
| **Commit** | `0638bd7` "Suggestion reviewing" (Mandara) |
| **Raised by** | ui, security; also raised independently by both skeptics |
| **Verdict** | Confirmed by the skeptic |

```tsx
const suggestions = data?.pages.flatMap((page) => page.suggestions) ?? []
// ...
{isPending || !suggestions ? (
    isError ?
        <Error text="Something went wrong."/> :
// ...
        {suggestions.length === 0 ? (
            <Text>There are no suggestions to be reviewed.</Text>
```

In TanStack Query 5, `isPending` and `isError` never hold together, and `suggestions` is never falsy because of `?? []`,
so the error alert is dead code. After the default retries, a permission-denied read (rules or App Check) or a poison
document (finding 12) tells the admin the queue is empty, while the dashboard counter shows a number.

Proposal:

- Branch on `isError` first, then `isPending`, then the empty list; drop `!suggestions`.
- Test: render with a rejecting `readSuggestionsPaginated` and assert the error text.

---

## 10. Suggestion rows are keyed by index, so after a failed approve the error alert hides the next suggestion

| | |
|---|---|
| **Severity** | Medium |
| **Place** | `src/app/pages/Suggestions.tsx:64-66`, `src/components/data/SuggestionItem.tsx:30-32, 98` |
| **Commit** | `0638bd7` "Suggestion reviewing" (Mandara) |
| **Raised by** | maintainability, ui, correctness; also seen by performance |
| **Verdict** | Confirmed by the skeptic |

```tsx
// Suggestions.tsx:64-66
{suggestions.map((suggestion, index) => (
    <SuggestionItem suggestion={suggestion} key={index}/>
))}
// SuggestionItem.tsx:98
if (error) return <Error text="Something went wrong. Please try again."/>
```

`SuggestionItem` holds `loading`, `error` and `open`. When an approve fails, `error` is set and the `finally` deletes the
suggestion (finding 6). The list shifts up, React reuses the instance at that index for the next suggestion, and that
suggestion renders as the fixed, centred alert until a reload. The "Existing category not found" case (finding 5) keeps
the suggestion, so its row can no longer be denied. Denying any row above it moves the error onto an unrelated one.

Proposal:

- `key={suggestion.id}` (also `key={category.id}` in `Suggest.tsx:239` and `SelectCategories.tsx:39`).
- Show approve errors inline or as a toast and clear them, instead of replacing the row with the fixed `Error`.
- Test: render two items, reject the approve of the first, and assert that the second still shows its buttons.

---

## 11. `data/seed.cjs` deletes all approved content in production, is not atomic and exits 0 on failure

| | |
|---|---|
| **Severity** | Medium (High once approved suggestions exist) |
| **Place** | `data/seed.cjs:26-37, 42-43, 50, 70-75` |
| **Commit** | `73ef79f` "Approving/denying suggestions" (Mandara) |
| **Raised by** | correctness; also seen by security |
| **Verdict** | Confirmed by the skeptic |

```js
await clearCollection("categories");
await clearCollection("terms");
// ...
    const docRef = categoriesRef.doc();
// ...
} catch (e) {
    console.error(e);
}
// ...
seedData().then(() => process.exit());
```

The only Firebase project is production (`.firebaserc`). A re-run deletes every category and term, including those with
`isOriginal: false` (approved suggestions), with no prompt. It runs four separate commits; if a later one fails, the
game is left without categories or terms and the process still exits with code 0. New random ids invalidate every
returning player's saved selection (finding 3). `require(serviceAccountPath)` resolves a relative path against `data/`,
not the working directory that README §6 implies.

Proposal:

- Delete only `isOriginal == true` documents, or upsert with deterministic ids derived from the category name.
- Use `process.exit(1)` in the catch, resolve the path with `path.resolve(process.cwd(), ...)`, and add a confirmation
  or an emulator target.
- Test: an emulator run asserting that a non-original term survives a re-seed and that an error exits non-zero.

---

## 12. Anyone can store a suggestion of any shape, and one malformed document breaks the admin's review queue

| | |
|---|---|
| **Severity** | Medium (conditional on the live rules not validating shape) |
| **Place** | `src/services/suggestion.ts:21-31, 56-60`, `src/components/data/SuggestionItem.tsx:110` |
| **Commit** | `0638bd7` "Suggestion reviewing" (Mandara) |
| **Raised by** | security; also seen by correctness |
| **Verdict** | Confirmed in code by the skeptic; conditional on the live rules |
| **OWASP** | `A05:2025` Injection (untrusted input), `API3:2023` Broken Object Property Level Authorization, `M4:2024` |

```ts
// suggestion.ts:23-26
const suggestionDoc = await addDoc(suggestionsRef, {
    ...suggestionData,
    timestamp: Timestamp.now()
})
// suggestion.ts:56-60
suggestions: visibleDocs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    timestamp: (doc.data().timestamp as unknown as Timestamp).toDate(),
})) as Suggestion[],
```

The limits (4 to 20 characters, at most 50 terms) live only in the Suggest form, and `timestamp` comes from the
visitor's clock. A direct write is enough:

- `{timestamp: 0, ...}` sorts before every Timestamp, so `.toDate()` throws on page 1 every time, and finding 9 shows it
  as an empty queue.
- `terms: "x"` throws at `suggestion.terms.join` during render. There is no error boundary anywhere in `src/`, so the
  whole app unmounts.
- A document without `timestamp` is excluded from the ordered query: it is counted on the dashboard but cannot be seen
  or deleted in the UI.

App Check does not stop this, because a real browser session can get a token.

Proposal:

- Validate on create in the rules: `keys().hasOnly([...])`, types, `category` size 4..20, `terms` a list of 1..50
  strings, `timestamp == request.time`.
- Write with `serverTimestamp()`, and map documents defensively (skip and flag invalid ones).
- Add an error boundary (`errorElement` on the routes or a top-level boundary).
- Test: emulator rules tests for each malformed shape; a unit test of the mapper with a non-Timestamp `timestamp`.

---

## 13. Anonymous suggestion creation has no limit, so one script can exhaust the write quota and bury the queue

| | |
|---|---|
| **Severity** | Medium (conditional on the live rules, App Check enforcement and the billing plan) |
| **Place** | `src/services/suggestion.ts:21-31`, `firestore.rules` |
| **Commit** | `8c22a58` "Suggesting Content" (Mandara) |
| **Raised by** | security |
| **Verdict** | Plausible: the live rules, the App Check enforcement toggle for Firestore and the plan settle it |
| **OWASP** | `API4:2023` Unrestricted Resource Consumption, `API6:2023` Sensitive Business Flows |

```ts
export async function createSuggestion(suggestionData: SuggestionData) {
    const suggestionsRef = collection(db, SUGGESTION_COLLECTION)
    const suggestionDoc = await addDoc(suggestionsRef, {
```

Nothing throttles creation: there is no limit in code or in the repo's rules, and Submit has no pending state
(finding 4). A loop of creates spends the free plan's daily writes, which blocks new suggestions and admin approvals.
On a paid plan it is billed. The admin can only deny one suggestion per tap, ten per page. The skeptic rejected the
claim that players' reads are refused too, since quotas are counted per operation type. Reads can be exhausted
separately, because `terms` must be publicly readable (finding 16).

Proposal:

- Enforce App Check on Firestore and bound document size in rules (finding 12).
- Add a budget alert, plus a bulk delete for the admin. If abuse appears, move creation behind a callable function
  with a per-token throttle.
- Test: an emulator rules test that an oversized suggestion is rejected.

---

## 14. There are no tests, and CI deploys `main` to live after a build only

| | |
|---|---|
| **Severity** | Medium (a process gap, not a defect) |
| **Place** | `package.json:6-12`, `.github/workflows/firebase-hosting-merge.yml:14`, `.github/workflows/firebase-hosting-pull-request.yml:16` |
| **Commit** | `870099b` "init" and `94c1977` "Refactor" (Mandara) |
| **Raised by** | maintainability; also seen by architecture |
| **Verdict** | Confirmed by the skeptic |

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "typegen": "npx @chakra-ui/cli typegen ./src/theme/theme.ts"
},
```
```yaml
      - run: npm ci && npm run build
```

There is no test script or test runner. `tsc -b` blocks type errors, but lint and behaviour are not checked before the
merge workflow deploys to the live channel. Findings 1, 3, 6 and 9 each fail a short unit test. The README §7
conventions that the head commit introduced are enforced by nobody.

Proposal:

- Add Vitest and Testing Library. Extract `pickSpies(players, spies, rng)` and `validateSuggestion(...)` as pure
  functions, and add rules tests on the emulator (finding 2).
- Run `npm run lint && npm test` in both workflows before the build, and pin the Node version.
- Test: the tests named in findings 1, 3, 6 and 9.

---

## 15. Admin pages start their Firestore reads before the guard decides

| | |
|---|---|
| **Severity** | Low (the skeptic lowered it from Medium) |
| **Place** | `src/app/pages/Suggestions.tsx:23-38`, `src/app/pages/ManageData.tsx:11-20`, `src/app/AppRouter.tsx:27-31` |
| **Commit** | `0638bd7` "Suggestion reviewing" (Mandara) |
| **Raised by** | architecture, security; also seen by performance and correctness |
| **Verdict** | Confirmed by the skeptic |
| **OWASP** | `A01:2025` Broken Access Control (defence in depth only) |

```tsx
// Suggestions.tsx:32-38
    } = useSuggestionsRealtime()
    // ...
    return (
        <ProtectedRoute>
// ManageData.tsx:11
const {isLoading, categories, terms, suggestions, logs} = useStats();
```

Every visitor to `/suggestions` starts a `getDocs` and an `onSnapshot` (with no `onError`), and `/manage-data` starts
four count aggregations, before `ProtectedRoute` renders. Whether data reaches the client is the rules question in
finding 2; a client guard is never the control. What remains is wasted reads, uncaught listener errors, and a guard that
every new admin page has to repeat correctly.

Proposal:

- In `AppRouter`, wrap the admin routes in one layout route,
  `<Route element={<ProtectedRoute><Outlet/></ProtectedRoute>}>`, and remove the per-page wrappers.
- Test: render `/suggestions` with no user and assert that `listenSuggestions` and `readSuggestionsPaginated` are not
  called.

---

## 16. Starting a game loads terms one category at a time and reads every term of every selected category

| | |
|---|---|
| **Severity** | Low (Medium on the free plan with real traffic) |
| **Place** | `src/services/term.ts:14-31` |
| **Commit** | `4cd8507` "Full refactor to improve structure. Updated dependencies and improved Chakra-UI usage." (Mandara) |
| **Raised by** | performance; also seen by architecture |
| **Verdict** | Confirmed by the skeptic, who lowered it from Medium |

```ts
for (const categoryId of categoryIds) {
    const termsRef = collection(db, TERMS_COLLECTION)
    const termsQuery = query(termsRef, where("categoryId", "==", categoryId))
    const querySnapshot = await getDocs(termsQuery)
```

Four categories take four serial round trips before the card appears. Each cold start reads all 196 seeded terms, plus
up to 50 per approved suggestion, which caps the free plan's 50,000 reads a day at roughly 250 full-selection cold
starts. The cache lasts five minutes in memory, so an hour of rounds re-reads everything about every five minutes.

Proposal:

- `Promise.all` over the categories, or one `where("categoryId", "in", ids)` query (up to 30 ids). Raise `staleTime`
  for terms, which change only on approval.
- If content grows, store the term values as an array on the category document.
- Test: a service test asserting one query for 4 ids.

---

## 17. The suggestions listener only invalidates, so mount, Load More and each approve or deny refetch every page

| | |
|---|---|
| **Severity** | Low (the skeptic lowered it from Medium; it matters under the flood in finding 13) |
| **Place** | `src/hooks/useSuggestionsRealtime.ts:30-47`, `src/services/suggestion.ts:65-74`, `src/hooks/useSuggestions.ts:20-25` |
| **Commit** | `0638bd7` "Suggestion reviewing" (Mandara) |
| **Raised by** | performance; also seen by security |
| **Verdict** | Confirmed for the cost; Plausible for the lost Load More |

```ts
useEffect(() => {
    const totalSize = PAGE_SIZE * (getSuggestionsPaginated.data?.pages.length ?? 1)
    // ... unsubscribe the previous listener (lines 33-35)
    unsubscribeRef.current = listenSuggestions(
        totalSize,
        () => queryClient.invalidateQueries({queryKey: suggestionKeys.paginated})
    )
    // ... cleanup (lines 42-46)
}, [getSuggestionsPaginated.data?.pages.length, queryClient]);
```

`onSnapshot` always delivers an initial snapshot, and the callback ignores it and invalidates. Mount subscribes twice
(`pages.length` goes from undefined to 1) and fetches page 1 two or three times. Going from 5 to 6 pages costs about 138
reads and 7 serial round trips, where 11 reads would do. Each deny invalidates twice. With `cancelRefetch` defaulting to
true, a deny followed quickly by Load More can cancel the Load More.

Proposal:

- Pick one source of truth: either render from the listener (one `onSnapshot` with a growing limit, written into the
  cache), or keep `getDocs` and skip the first snapshot with a single listener.
- Drop the duplicate invalidation in `removeSuggestion`.
- Test: a hook test with mocked `onSnapshot` and `getDocs` asserting one `getDocs` on mount and one per Load More.

---

## 18. Logs and the admin data pages have nothing behind them, and Deny deletes on one tap

| | |
|---|---|
| **Severity** | Low (the skeptic lowered it from Medium; Medium if an audit trail is a requirement) |
| **Place** | `src/services/log.ts:7`, `src/components/data/SuggestionItem.tsx:90-96, 127`, `src/app/pages/Logs.tsx`, `Categories.tsx`, `Terms.tsx` |
| **Commit** | `73ef79f` "Approving/denying suggestions" (Mandara) |
| **Raised by** | architecture, correctness, maintainability, security |
| **Verdict** | Confirmed by the skeptic |

```tsx
const handleDeny = async () => {
    await removeSuggestion.mutateAsync(suggestion.id)
}

//TODO: add logs
//TODO: confirmation when denying/approving
//TODO: toaster messages
```

`createLog` has no caller, so the dashboard's log count is always 0 and approvals and denials leave no trace.
`/categories`, `/terms` and `/logs` render only a header, so a typo in approved content or a duplicate category
(finding 5) can only be fixed in the Firebase console. Deny sets no loading state and asks for no confirmation, so one
stray tap in an expanded row permanently deletes a visitor's submission.

Proposal:

- Write the log inside the approval batch (finding 6) with `request.auth.uid`, checked in rules, not an email from the
  client.
- Add a confirmation and a pending state to Deny; implement the three pages or remove the routes and tiles until they
  exist.
- Test: approve and deny tests asserting one log document each.

---

## 19. The reveal screen shows no "player N of M" and EXIT re-deals without confirmation

| | |
|---|---|
| **Severity** | Low (design judgement; Medium if turn tracking is wanted) |
| **Place** | `src/app/pages/Play.tsx:66-68, 96-134` |
| **Commit** | `2d889ab` "Simplified selection of settings" and `b339d75` "Card flip animation with gsap & some minor changes" (Mandara) |
| **Raised by** | ui |
| **Verdict** | Confirmed as fact by the skeptic, who lowered it from Medium |

```tsx
<Text>Players: {amountOfPlayers}</Text>
<Text>Spies: {amountOfSpies}</Text>
// ...
{(currentMove + 2) % 2 === 0
    ? "Tap the card to reveal the subject."
    : "Tap again and pass on the phone."}
// ...
<Button w="100%" h="50px" onClick={() => exit()}>
    EXIT
</Button>
```

`isAnimating` blocks taps only during the 0.5 s flip. An extra tap pair after that shows one player the next player's
role, and nothing on screen reveals that a turn was skipped or doubled. EXIT, a reload or browser Back mid-deal,
followed by PLAY, re-draws the spies and the term, so roles already seen become wrong. README §2 is implemented as
written; this is a design gap, not a broken rule.

Proposal:

- Show "Player {floor(currentMove/2)+1} of {amountOfPlayers}" above the card, and confirm EXIT while `currentMove > 0`.
- Test: simulate the card taps and assert the counter after each pair.

---

## 20. README §7 says `npm run lint` sorts imports, but the script does not fix and the extension rule is not enforced

| | |
|---|---|
| **Severity** | Low (the skeptic lowered it from Medium) |
| **Place** | `README.md:86-87`, `package.json:9`, `tsconfig.app.json:23`, `eslint.config.js` |
| **Commit** | `a31e557` "restructured codebase to integratieproject-j3-frontend conventions and updated all packages" (Mandara) |
| **Raised by** | maintainability |
| **Verdict** | Confirmed by the skeptic |

```
- Import through the `@/` barrels, without file extensions, `import type` for types. `npm run lint` sorts the
  imports (`eslint --fix`).
```
```json
"lint": "eslint .",
```

`npm run lint` reports `import/order` errors and sorts nothing without `-- --fix`. `allowImportingTsExtensions` is true
and there is no `import/extensions` rule, so "without file extensions" holds today only by hand (a grep found no
violation). `verbatimModuleSyntax` does enforce `import type`.

Proposal:

- Either `"lint": "eslint . --fix"` and a separate `lint:check` for CI, or change the README. Add
  `import/extensions: ['error', 'never']`.
- Test: the CI lint step from finding 14.

---

## OWASP coverage

| # | Theme | OWASP | Result |
|---|---|---|---|
| 1 | Access control | A01:2025 · API1, API3, API5:2023 · M3:2024 | findings 2, 12, 15; deployed rules not checked |
| 2 | Authentication, tokens and sessions | A07:2025 · API2:2023 · M1, M3:2024 | notes only, not verified (persistent admin session, stale `isAuthorized`); sign-up setting not checked |
| 3 | Injection and untrusted input | A05:2025 · API7, API10:2023 · M4:2024 | finding 12; no XSS, SSRF or query-injection sink found |
| 4 | Cryptography, secrets and transport | A04:2025 · M1, M5, M10:2024 | finding 7; no secret in tracked files or history; API key restriction not checked |
| 5 | Configuration and exposed surface | A02:2025 · API8, API9:2023 · M8:2024 | findings 2, 7; notes (no security headers, `.gitignore` gap); App Check enforcement not checked |
| 6 | Supply chain and integrity | A03, A08:2025 · M2:2024 | notes only, not verified (actions on mutable tags, no `permissions` on the merge workflow); `npm audit`: 0 advisories |
| 7 | Resource consumption | API4:2023 | finding 13 |
| 8 | Design and abuse of business flows | A06:2025 · API6:2023 | findings 2, 13 |
| 9 | Logging, alerting and exceptional conditions | A09, A10:2025 | findings 9, 12, 18; alerting not checked |
| 10 | Data on the client and privacy | M6, M7, M9:2024 | finding 7; notes (Analytics without consent, cache kept after sign-out) |

## Lower-severity notes (not independently verified)

| Place | Note | Raised by |
|---|---|---|
| `src/app/pages/ManageData.tsx:40` | The Categories tile pluralises on `terms === 1` instead of `categories` (both skeptics saw it too) | maintainability, ui, correctness, security |
| `src/app/pages/Play.tsx:29, 34` | The subject is recomputed from live query data; a focus refetch after 5 min can give later players a different subject. Freeze it once loaded (skeptic: Plausible) | performance, ui, correctness |
| `src/app/pages/Play.tsx:35, 120` | `"SPY"` is both the sentinel and a possible term; a term named SPY makes every player a spy. Pass a boolean | correctness |
| `src/services/suggestion.ts:25`, `src/services/log.ts:11` | `Timestamp.now()` is the device clock; use `serverTimestamp()` | correctness, security |
| `src/hooks/useSuggestionsRealtime.ts:37-40` | No `onError` passed to the listener; a rejected listener dies silently | correctness, security |
| `src/components/util/ProtectedRoute.tsx:13-24` | `isAuthorized` is not reset when `user` changes; a second account briefly inherits the verdict | security, architecture, correctness |
| `src/context/AuthContextProvider.tsx` | "Welcome!" toast on every load of a signed-in admin; "Signed Out!" on every load in dev under StrictMode | maintainability, correctness |
| `src/services/firebase.ts:19` | Auth keeps local persistence, so the admin stays signed in on a phone that is passed around. Consider session persistence | security |
| `src/hooks/useAuth.ts:35-48` | Sign-out does not clear the TanStack cache; loaded suggestions stay in memory | security |
| `src/components/configuration/SelectSettings.tsx:18-21` | A sign-out error replaces the dialog with a permanent fixed alert | ui, correctness |
| `src/components/util/Error.tsx:9-23` | Fixed, centred alert with no retry or way back, also used for "Not Authorized" | ui |
| `src/services/firebase.ts:18`, `index.html:11-14` | Analytics starts with no consent prompt; fonts load from Google's servers (EU visitors) | security, ui |
| `firebase.json:2-15` | No `headers` block: no CSP, `frame-ancestors` or `Referrer-Policy` on the origin with the admin login | security |
| `.github/workflows/*.yml` | Actions on mutable tags (`@v4`, `@v0`) receive the service-account JSON; no `permissions` on the merge workflow; Node not pinned | security, correctness |
| `.github/workflows/firebase-hosting-pull-request.yml`, `src/services/firebase.ts:7-15` | PR previews and the hard-coded config target the production project; no dev or staging profile | architecture |
| `.gitignore:15-17` | No pattern for service-account key files (`*-firebase-adminsdk-*.json`) | security |
| `src/services/index.ts`, `src/hooks/useAuth.ts`, `src/context/AuthContextProvider.tsx` | The barrel exports raw `auth`/`db`; auth calls `firebase/auth` outside `src/services` (rule 7 in spirit) | architecture, maintainability |
| `src/hooks/useStats.ts` | Bypasses TanStack Query and `queryKeys` (rule 5), four sequential counts, swallows errors; `*.detail` keys invalidated but never queried | architecture, performance, maintainability, correctness |
| `src/config/queryKeys.ts:14` | The terms key depends on selection order; sort the ids | performance |
| `dist/assets` | One 1.56 MB chunk with no route-level lazy loading; players download the admin pages | performance |
| `src/services/*.ts`, `ProtectedRoute.tsx:2`, `src/app/App.tsx:1` | Modules import their own barrel, creating import cycles that work only because no binding is read at load time | architecture, maintainability |
| `src/model/suggestion.ts:1, 15` | The shared model depends on the Firestore SDK type for the cursor | architecture |
| `src/components/util/Error.tsx:7` | A component named `Error` shadows the global `Error` in 6 files; rename to `ErrorAlert` | maintainability |
| `src/services/gsap.ts`, `src/model/term.ts:10`, `ManageData.tsx:72` | Dead code: `gsap.ts` never imported, `TermValue` unused, `<Outlet/>` without child routes | maintainability, correctness, architecture |
| `src/components/play/PlayCard.tsx:15`, `Suggest.tsx:195, 206-289`, icon buttons in 10 files | Accessibility: icon-only buttons without `aria-label`, empty `Switch.Label`, 24 px controls, the hidden card face is read by screen readers | ui |
| `src/app/pages/Suggest.tsx:284`, `src/app/pages/Home.tsx:133` | "New term..." `Link` has no `href`; `translateX(-50%)` on a full-width button has no effect | ui |
| `Play.tsx:127`, `src/model/*.ts`, `useAuth.ts:7` | `(currentMove + 2) % 2`, `Omit<Omit<...>>`, `isError` holding a message; page header copied in 10 files; inline magic values | maintainability |
| `data/seed.cjs:15` | `require(serviceAccountPath)` resolves relative paths against `data/` | correctness |

## Earlier review points

None: this is the first review of this repo.

## Questions for the author

- Which Firestore ruleset is live for `the-spygame`, can it be exported into `firestore.rules`, and is a full
  `firebase deploy` ever run from the laptop?
- Is App Check enforced for Firestore, is the debug token in `.env` registered, and was a locally built `dist/` ever
  deployed, including to a preview channel?
- How does an account get the `admin` claim, and is email/password self sign-up disabled?
- Which roles does the `FIREBASE_SERVICE_ACCOUNT_THE_SPYGAME` service account hold?
- Is `seed.cjs` meant to run against production after launch, and should approved content survive it?
- Should lowering the player count reduce the spies silently, or refuse with a message?
- Should the reveal screen show whose turn it is, or is the unnumbered flow deliberate?
- Is `/suggestions` meant to be live (the listener) or paginated on demand?
- Are `/categories`, `/terms` and `/logs` placeholders for this release, and was `<Outlet/>` in `ManageData` meant for
  nested admin routes?
- Is a consent or privacy notice planned for Analytics?

## Considered and rejected

- A fast double tap on the Play card flipping twice: `move` returns while `isAnimating`, and `PlayCard` sets
  `pointerEvents: none` during the flip (dropped by performance, ui, correctness).
- The next player's role showing during the hide flip: `currentMove` advances only in the timeline's `onComplete`
  (dropped by ui, correctness).
- The last player's role left on screen: the final tap navigates Home without flipping (dropped by ui, correctness).
- A double tap on Approve: `loading` disables both buttons (dropped by performance).
- Stored XSS through suggested content: everything renders as React text; no `dangerouslySetInnerHTML`, `innerHTML` or
  data-driven `href` (dropped by security).
- The hard-coded Firebase web config and reCAPTCHA site key: public by design; their restriction is deployed
  configuration (dropped by security).
- `Math.random` for spies and the term: nothing an attacker must not guess (dropped by security).
- Login errors: one message for unknown user and wrong password; Firebase throttles (dropped by security).
- The PR workflow leaking the deploy secret to forks: the same-repo guard and `pull_request` prevent it (dropped by
  security).
- Secrets in git history, source maps in the bundle, `.env` served by the Vite dev server: none found, none shipped,
  and `server.fs.deny` covers `.env` (dropped by security).
- Dependency advisories: `npm audit` reports 0 across 702 packages; all resolve from registry.npmjs.org (dropped by
  security).
- Missing composite indexes: every query uses one field (dropped by architecture, performance, correctness).
- Seed batches above 500 writes: 200 terms (dropped by correctness).
- Stale pagination cursors on refetch: the infinite query recomputes page params (dropped by correctness).
- N fetches from one `useCategories()` per suggestion row, and a token request per `ProtectedRoute` mount: TanStack
  dedups the first, and the second uses the cached token (dropped by performance).
- `e as Error` resolving to the `Error` component: TypeScript uses the global type there (dropped by maintainability).
- Rules 2, 4, 7 and 8 of the brief: they hold (dropped by architecture).
- Part of finding 13: "players' reads are refused once writes are exhausted": quotas are counted per operation type
  (rejected by the skeptic).
- Part of finding 6: "an offline approve fails part-way": the SDK queues offline writes rather than rejecting them
  (rejected by the skeptic).
