# Plan 01: SpyGame for iOS and Android

Draft of 19 November 2026, with your decisions of 20 November (§14). Nothing in this plan is built yet.

SpyGame gets two native apps, one for the App Store and one for Google Play, built from one Expo codebase in React
Native. The apps do everything the website does today, admin management included, and are redesigned to feel native
instead of ported. The website stays where it is and keeps working. Multiplayer (everyone on their own phone, joining
a session) is not part of this plan, but §13 says what this plan does so that it can be added later.

## 1. Goal and scope

**In scope**

- One Expo app (SDK 58, React Native 0.88, TypeScript) that ships as an iOS app and an Android app. It runs on
  iOS 16.4 and later and on Android 7 and later, which is what SDK 58 supports.
- Feature parity with the website as it is on `main` today:
  - Player: setup (players, spies, categories), dealing the roles, the end-of-deal screen, how to play, suggesting
    words, settings, the analytics choice.
  - Admin: sign in and out, manage data (counts), categories (create with first terms, rename, delete), terms (per
    category, filter, add several, rename, delete), suggestions (review, approve a selection, deny, live updates),
    logs.
- The same Firebase project, data, security rules and admin claim as the website.
- Both store submissions: accounts, listings, privacy, testing tracks, review.

**Out of scope**

- Replacing the website. It stays on Firebase Hosting, with its Chakra UI.
- Multiplayer, accounts for players, payments, push notifications, tablets as a first-class layout, languages other
  than English, crash-reporting SDKs. Each can be its own plan.

## 2. Decisions

Each decision has the reason and what was rejected. §14 records the ones you decided on 20 November.

| # | Decision | Why |
|---|---|---|
| 2.1 | Expo SDK 58 with Expo Router, built as a development build, never Expo Go. | React Native Firebase is native code, which Expo Go does not contain. A development build is also Expo's recommendation for a real app. |
| 2.2 | The app sits beside the website. | The website works, was just overhauled and has tests. One codebase for web too would mean rewriting it on react-native-web. |
| 2.3 | The web app stays at the repo root. The Expo app goes in `mobile/` with its own `package.json` and lockfile. Shared code goes in `packages/core`. | No risk to the deploy that works today. Rejected for now: npm workspaces with `apps/web` and `apps/mobile`, which moves the web app and forces one React version on both (Expo pins `19.3.0`, the web app is on `19.3.1`). |
| 2.4 | `packages/core` holds everything that is not UI and not an SDK call: types, limits, query keys, game logic, validation, log texts, and the decisions inside today's services (which terms to add, what the log entry says). | Two admin clients write the same data. The rules they follow must exist once. It also makes the logic usable by a server later (§13). |
| 2.5 | React Native Firebase 27 (`app`, `app-check`, `auth`, `firestore`, `analytics`), not the Firebase JS SDK. | App Check on a phone needs App Attest and Play Integrity, and Analytics needs the native SDK. Its modular API has the same function names as the web SDK, so the services port almost line by line. |
| 2.6 | Services and hooks are ported one to one into `mobile/src`: one file per web file, with the same function names as `src/services` and `src/hooks`. | They are thin once 2.4 is done, and the two SDKs differ in types. Sharing them through an adapter was rejected as more machinery than it saves. |
| 2.7 | Native look: system navigation, sheets, controls, haptics and gestures everywhere; the "case file at night" brand on the surfaces that carry the game (wordmark, steppers, role card, buttons). | "Native feel" is behaviour first. A party game may have its own face, but it must move, respond and navigate like the platform. |
| 2.8 | Dark only, as on the web (`userInterfaceStyle: "dark"`), so system controls render dark too. | Matches the brand; one palette to maintain. |
| 2.9 | StyleSheet and theme tokens in `mobile/src/theme`, derived from `src/theme/theme.ts`. No styling library. | The token set is small. Expo's own guidance is tokens plus plain styles. |
| 2.10 | Admin access for store reviewers through a read-only `reviewer` claim (§6.4). | Apple and Google need a login for the admin area. A reviewer must not be able to change production data. |
| 2.11 | The development variant of the app can only reach the Firebase emulators (project `demo-spygame`), like `npm run dev:emulators` on the web. | A development build must never touch live data by accident. |
| 2.12 | Phones first. Layouts keep a centred column with a maximum width, so tablets and foldables work without their own design. iPad support stays off for 1.0. | Android 16 ignores orientation locks on large screens, so the layout has to adapt anyway. An iPad layout doubles the screenshots and the testing. |
| 2.13 | The app is called SpyGame, with `com.mandaraperera.spygame` as bundle id and package name. | Your choice. The identifier is permanent after the first release. |
| 2.14 | Personal developer accounts on both stores. | Your choice. It brings Google's closed test (§9.3), unless the Play account is older than 13 November 2023. |
| 2.15 | An admin stays signed in; the admin area opens with the device's own lock (§6.3). | Your choice over an automatic sign-out. An app is rarely closed, so "until the tab closes" has no good equivalent. |
| 2.16 | Analytics stays, behind consent and without an advertising id (§6.6). | Your choice; the same as the website. |
| 2.17 | Every build runs on EAS Build (§8). | Your choice over local development builds. One build system, and EAS manages the signing credentials. |

## 3. Architecture

### 3.1 Repository

```
spygame/
  src/  public/  index.html  vite.config.ts      the website, unchanged in place
  packages/core/src/                              shared TypeScript, no dependencies
    model/      Category, Term, Suggestion, Log (pagination cursor as a type parameter)
    config/     limits, query keys
    game/       clampPlayers, clampSpies, maxSpies, pickSpies, pickTerm, the deal as a state machine
    rules/      validation, name keys, suggestion checks, the pure parts of approve/create/rename/delete
    text/       pluralize, formatDate, describeLog
  mobile/                                         the Expo app
    app.config.ts  eas.json  firebase.json        (this firebase.json is React Native Firebase's own)
    assets/                                       icons, splash, fonts, seed snapshot
    src/app/                                      routes only
    src/screens/  components/  hooks/  services/  context/  theme/  utils/
    .eas/workflows/  .maestro/
  firestore.rules  firebase.json  tests/rules  scripts/  data/     as today
```

Both apps import the shared code as `@spygame/core` through a path alias: Vite and `tsconfig` on the web, `tsconfig`
paths plus one `watchFolders` entry in Metro on mobile. The web barrels (`@/utils`, `@/config`, `@/model`) re-export
from it, so no web component changes its imports. Core's tests run in the root Vitest project.

### 3.2 The mobile app

- Layering as on the web: service, hook, component. Firestore and Auth calls only in `src/services`; components only
  use hooks. TanStack Query with the same query keys and stale times. Settings and auth through context, as now.
- Expo's conventions for the rest: routes only in `src/app`, screen bodies in `src/screens`, kebab-case file names,
  tests next to the code, `@/` for `src/`.
- React Compiler on, typed routes on, New Architecture (required by React Native Firebase 26 and later).
- Settings (players, spies, selected category ids, analytics choice) in `expo-sqlite`'s key-value store, read through
  the same clamping as the web, so a stored value can never break a game.

### 3.3 Routes

```
src/app/
  _layout.tsx              providers, fonts, root Stack
  index.tsx                Setup
  play.tsx                 dealing; full-screen modal, swipe-back off
  how-to-play.tsx
  suggest.tsx
  settings.tsx             form sheet
  pick-categories.tsx      form sheet
  consent.tsx              form sheet, first launch
  login.tsx                form sheet
  (admin)/                 Stack.Protected, guard: admin or reviewer claim
    manage-data.tsx
    categories.tsx         new-category.tsx (form sheet)
    terms.tsx              reads ?category=<id>, as the web does; add-terms.tsx (form sheet)
    suggestions/index.tsx  suggestions/[suggestionId].tsx
    logs.tsx
  +not-found.tsx
```

The paths are the web's paths. A link to `/terms?category=…` means the same thing in both, which matters once
universal links exist (§13).

### 3.4 App variants

| Variant | Bundle id / package | Firebase | Used by |
|---|---|---|---|
| development | `com.mandaraperera.spygame.dev` | emulators only, project `demo-spygame`, hand-written config file, no App Check | development builds on simulators and your phones |
| production | `com.mandaraperera.spygame` | live project, App Attest / Play Integrity | preview builds (TestFlight, Play internal) and store builds |

`app.config.ts` picks the variant from `APP_VARIANT`. The two can be installed side by side.

## 4. Screens: what the web has and what the app gets

Texts, limits and validation come from `packages/core`, so they are identical. The interaction is redesigned. Every
screen keeps what the web has around its content: a loading skeleton, an empty state, and an error state with its one
way forward.

### 4.1 Player

| Web today | Native app |
|---|---|
| Home: wordmark, intro, steppers for players and spies, categories row, "Deal roles" (or "Pick categories"), help and settings buttons | Setup screen, the stack's root. Custom steppers with a selection haptic per step and disabled ends. The main button pinned above the home indicator. Help and settings as header buttons. Skeleton while categories load, error state with "Try again". |
| Categories sheet: chips, "Select all / Clear all", "n of m picked" | Native form sheet with detents and a grabber. Chips toggle with a haptic. "Done" in the sheet. |
| Play: progress bar, role card that flips, hint text, leave confirmation | Full-screen modal. The card flips on the UI thread with Reanimated; the role only changes once the card has turned away, as now. Haptics on open and close, a heavier one for the SPY stamp. Screen stays awake. Leaving asks through a system alert; Android's back gesture asks the same. The word scales to fit the card on one line, and is hidden from the app switcher and from screen readers while the card is closed. The web's other states stay: no category picked, no words in the picked categories, loading failed. |
| End of deal: summary, "Deal again", "Change setup", link to how to play | Same state of the same screen. "Deal again" never repeats the previous word, as now. |
| How to play | Pushed screen with a large title that collapses on scroll. |
| Suggest words: existing or new category, name or select, word fields, review step, toasts | Native form: segmented control, system picker, word fields where Return jumps to the next and adds one after the last, inline errors with an error haptic, system confirmation, success notice. Keyboard never covers the focused field or the send button. |
| Settings sheet: suggest words, how to play, manage data (admins), usage statistics switch, admin sign in / signed in as / sign out | Native form sheet with grouped rows and a system switch. Adds what a store app needs: privacy policy link and app version. |
| Consent banner about Google Analytics and cookies | First-launch sheet with the same two choices; the text says what is collected and does not mention cookies. Changeable in Settings. |
| Toasts | A short in-app notice at the top with a success or error haptic, announced to screen readers. Destructive results that used a toast keep one. |
| Error boundary, 404 page | Expo Router's error boundary per route with "Back to setup"; `+not-found` for a bad deep link. |

### 4.2 Admin

| Web today | Native app |
|---|---|
| Admin sign in: email, password, validation, error toasts | Form sheet. System autofill from the keychain or password manager, show and hide for the password. The same error texts for wrong credentials and too many attempts, and the same welcome and signed-out notices. |
| Protected routes: "Checking authorization", "Not authorized" | `Stack.Protected` with the claim as guard, and the device lock of §6.3 in front of it. No admin query starts before the claim is confirmed and the area is unlocked. Losing the session on an admin screen returns to Setup. |
| Manage data: signed in as, suggestions with a badge, counts for categories, terms, logs | Grouped list with the same counts and badge, pull to refresh. |
| Categories: list with term count, Original / Community badge, rename in place, delete with confirmation, "New category" with first terms | List. Swipe a row for Rename and Delete on iOS, long-press menu on both. Rename in a small form sheet, delete through a destructive system alert that names the number of terms. The count opens that category's terms. Empty categories stand out, as now. "New category" in a form sheet with the name and one term per line. |
| Terms: category select kept in the URL, filter, "n of m", add several (skipping duplicates), rename, delete | Category in a header menu and in the route's `category` parameter. Filter in the header search bar. Same row actions as categories. "Add terms" sheet takes typed or pasted lines, counts them against the limit of 50 while you type, and reports added and skipped terms. |
| Suggestions: accordion queue with status badge, lazy review body, "Load more", live refresh when another device adds one | List with the same badges, endless scrolling, pull to refresh, the same live listener. A row opens a review screen instead of an accordion. |
| Suggestion review: where it goes, checkbox per term, terms already in the game struck through, select all / none, approve the selection, deny with confirmation, orphan and malformed cases | Review screen with system checkboxes and the same rules and texts. Approve and Deny in a bottom bar; a success haptic and a return to the queue. |
| Logs: newest first, action and type, title, detail, author, "Load more" | Endless list with the same content, "you" for your own entries. |

## 5. Native feel

Rules for every screen, taken from Apple's Human Interface Guidelines, Material 3 and Expo's current guidance.

- **Navigation.** Expo Router's native stack: real push and pop, swipe back on iOS, predictive back on Android. Sheets
  are native form sheets. Titles live in the navigation bar, large on iOS for list screens. iOS 26's glass and
  Android's edge-to-edge come with the native bars and sheets.
- **Controls.** `@expo/ui` first (real SwiftUI and Jetpack Compose): switch, checkbox, picker, menu, segmented
  control, bottom sheet. React Native views only for the branded surfaces.
- **Motion.** Reanimated, on the UI thread, with spring and timing values from Expo's animation guidance. Reduced
  motion ships with each animation: the flip becomes a cross-fade.
- **Haptics.** Selection tick for a stepper or chip, light impact when the card opens or closes, medium for the SPY
  stamp and for a destructive confirmation, success or error notification for the result of a save. One per action,
  in the same frame as the visual, never the only feedback.
- **Type.** Archivo, bundled at build time. The condensed display face (75 %) and the title face (87.5 %) as static
  font files, because Android only reads the weight axis of a variable font. Text follows the system text size;
  display sizes get an upper limit so the card still fits.
- **Platform differences are deliberate.** Swipe actions on iOS and a long-press menu on Android; SF Symbols on iOS
  and Material icons on Android; opacity feedback on iOS and ripple on Android; each platform's own alert.
- **Accessibility.** VoiceOver and TalkBack labels and roles for everything the web labels today; "Player 2 of 5" is
  announced when it changes; targets at least 44 pt / 48 dp; the manila-on-midnight contrast is kept.
- **Layout.** Safe areas through the navigation bars and scroll views. A centred column with a maximum width. Portrait
  on phones; large screens may rotate.

Check per screen before it counts as done: next to the same web screen, a native screenshot should not pass for the
web version, and the content and behaviour must match it.

## 6. Firebase, security and privacy

### 6.1 Project setup

Register one iOS app and one Android app in the existing project, with the production bundle id and package name.
Their config files (`GoogleService-Info.plist`, `google-services.json`) go in `mobile/` and are referenced from
`app.config.ts`. They hold identifiers, like the web config in `src/services/firebase.ts`, and can be committed; the
API keys in them get restricted to the bundle id and to the package plus signing certificate.

### 6.2 App Check

- iOS: App Attest with DeviceCheck as fallback. Needs the App Attest capability and the Apple team id in the Firebase
  console.
- Android: Play Integrity. Needs the SHA-256 of the Play app-signing key (and of the upload key) in the Firebase
  console.
- Simulators and emulators cannot attest. The development variant skips App Check (emulators do not check it). For a
  production-variant build on a simulator, a debug token registered in the console.
- Real attestation can only be tested on physical phones, from TestFlight and the Play internal track.
- A store build never contains the debug provider. A build step fails the build if it does, as `check:bundle` does
  for the website's debug token.
- Enforcement for Firestore is switched on in the console only after the web, iOS and Android all show verified
  requests in the App Check metrics. Today's panel review already lists enforcement as a follow-up; this plan sets
  the order.

### 6.3 Admin sign-in and session

Email and password, the admin custom claim set by `scripts/set-admin.cjs`, the same rules. No sign-up in the app.

The web ends an admin session when the tab closes, because the phone is passed around. The app keeps the admin signed
in and puts the device's own lock in front of the admin area instead:

- Opening the admin area asks for Face ID, Touch ID or the fingerprint, with the device passcode as fallback
  (`expo-local-authentication`; iOS needs a Face ID usage text in the app config). Until then no admin screen renders
  and no admin query runs.
- The area locks again every time the app leaves the foreground, so a phone handed over during a game never shows it.
- Settings shows that an admin is signed in, and the email only after unlocking. "Sign out" stays there and clears the
  cached admin data, as on the web.
- A device without any screen lock has nothing to authenticate with. There the app falls back to signing the admin
  out on a cold start and after five minutes in the background.
- The lock protects the device in someone else's hands. The Firestore rules stay the real control.

### 6.4 Reviewer claim

Apple's and Google's reviewers need to see the admin area. A new custom claim `reviewer`:

- `firestore.rules`: `reviewer` may read what admins read (suggestions, logs); every write still needs `admin`.
- Rules tests for the new claim; `scripts/set-admin.cjs` gets a `--reviewer` flag.
- The app treats a reviewer as admin for navigation. A write fails with "This demo account can look, but not change
  anything."
- One reviewer account, its credentials only in App Store Connect and the Play Console.
- The device lock of §6.3 uses the reviewer's own device lock, or its fallback on a device without one, so it never
  stands between a reviewer and the admin area.

### 6.5 Data and offline

- Same collections and queries. The native Firestore SDK keeps a local cache by default, so after one successful load
  the game deals without a connection.
- First launch without a connection: a snapshot of categories and terms, written at build time from Firestore with
  their real ids, is used when the cache is empty.
- Counts (`getCountFromServer`) and all admin writes need a connection and say so when there is none.

### 6.6 Analytics and privacy

- Collection is off by default in the native config and switched on only after "Allow", as on the web. Consent is
  also passed to the SDK (`analytics_storage` only; all advertising signals denied).
- No advertising id: the iOS build links the Analytics variant without ad support, the Android build drops the
  `AD_ID` permission. No tracking prompt is needed.
- Screen views are logged on route changes. No other events, as on the web.
- A privacy policy page on the website (`/privacy`), linked from Settings and from both store listings. It names what
  is collected: usage statistics after consent, the text of a suggestion, an admin's email.

## 7. Quality

- **Unit tests.** `packages/core` under Vitest (today's `utils` tests move with the code; the extracted service
  decisions get new ones).
- **Component and screen tests.** `jest-expo` with React Native Testing Library. The web's eight test files are the
  list to port: Play, Categories, Terms, Suggestions, SuggestionItem, SettingsContextProvider and the utils.
- **Rules tests.** `npm run test:rules` as today, plus the reviewer claim.
- **End-to-end.** Maestro flows against a development build on the emulators: deal a full game, suggest words, sign
  in and approve part of a suggestion, start offline. Run locally; optionally as an EAS Workflow job.
- **Manual passes on real phones**, both platforms: smallest and largest phone, largest text size, VoiceOver and
  TalkBack, reduced motion, airplane mode, a release build for the feel of the animations.
- **Web regression.** After phase 0 the full web CI (lint, tests, rules tests, build, bundle check) must be green and
  a preview channel checked by hand.

## 8. Build, release and CI

- **Builds.** Every build runs on EAS Build: development builds for the simulators and for your phones, preview
  builds and store builds. EAS also manages the signing credentials. A development build is only needed when native
  code or configuration changes, so those changes are batched; everything else reloads over Metro. Simulator builds
  are installed on this Mac's simulators (Xcode 27.2 is here; an Android emulator still has to be set up).
- **Build allowance.** On 20 November the free plan listed up to 15 Android and 15 iOS builds a month, a low-priority
  queue and a 45-minute limit per build. The next plan is 19 USD a month plus usage.
- **`eas.json` profiles.** `development` (dev client), `preview` (production variant, internal distribution),
  `production` (store). `appVersionSource: "remote"` and `autoIncrement`, so build numbers never collide.
- **Versions.** `0.x.y` through the beta, `1.0.0` for the first store release.
- **Submitting.** EAS Submit with an App Store Connect API key and a Play service account; both live in EAS, never in
  the repo. First targets are TestFlight and the Play internal track.
- **Over-the-air updates.** EAS Update with a channel per profile and a fingerprint runtime version, for fixes that
  only touch JavaScript. Anything native is a new build.
- **CI.** The two GitHub workflows stay for the website and get path filters, so a mobile-only change does not
  redeploy the site. A new job runs lint, type check and Jest for `mobile/` and the core tests. Store builds start by
  hand or from a tag (`app-v*`) through an EAS Workflow; no build per merge.

## 9. Store submission

### 9.1 Needed for both stores

- The app name is SpyGame. The App Store requires a unique name. A search there on 20 November found no app called
  exactly that, but many close to it (§14), so the subtitle and the icon have to set it apart.
- Subtitle or short description, full description, keywords, category (Games, Party / Word).
- Icon: a 1024 px master, the Android adaptive icon (foreground, background, monochrome) and the iOS layered icon.
  Splash screen in midnight with the mark.
- Screenshots from the simulators, per required device size.
- Privacy policy URL and a support URL or email.
- Data forms: App Privacy on Apple, Data safety on Google (usage data after consent, user content for suggestions, no
  advertising, no tracking).
- Age rating questionnaires. Suggestions are moderated before anyone sees them, which is what the user-content
  questions ask about.
- EU trader status on both stores.
- Review access: the reviewer account from §6.4 and a note that explains the admin area and that players never sign
  in.

### 9.2 App Store

1. Apple Developer Program membership (99 USD a year), as an individual. Your own name is shown as the seller.
2. Bundle id and the app record in App Store Connect; an App Store Connect API key for EAS.
3. TestFlight: internal testers first, then an external group, which needs one beta review.
4. Listing, App Privacy, age rating, export compliance (`usesNonExemptEncryption: false`), review notes with the demo
   account.
5. Submit for review; phased release for the first version.

### 9.3 Google Play

1. Play Console account (25 USD once), a personal one. A personal account created after 13 November 2023 must run a
   closed test with at least 12 testers opted in for 14 consecutive days before it can apply for production access.
2. The app record, Play App Signing, a service account for EAS, the signing certificate's SHA-256 into Firebase for
   Play Integrity.
3. Internal track first, then the closed test. Start it as soon as phase 2 has a playable build, because the 14 days
   are calendar time.
4. Store listing, Data safety, content rating, target audience (13 and older), ads declaration (none), app access
   with the demo account.
5. Apply for production access with the closed test's answers; staged rollout.

New apps must target API level 36; Expo SDK 58 targets 36 and needs Xcode 26.4 or later for iOS.

## 10. Phases

Effort is my estimate in focused working days. Waiting for stores comes on top.

| Phase | Result | Effort |
|---|---|---|
| 0. Shared core | `packages/core` exists, the website uses it and behaves exactly as before | 1–2 |
| 1. Foundation | The Expo app starts on an iOS simulator and an Android emulator with the theme, the fonts and Firebase on the emulators | 2–3 |
| 2. The game | Setup, categories, dealing and the end-of-deal screen, playable and native | 4–6 |
| 3. Rest of the player side | How to play, suggest words, settings, consent, notices, error states | 2–3 |
| 4. Admin | Sign in, device lock, manage data, categories, terms, suggestions, logs, reviewer claim | 6–8 |
| 5. Hardening | App Check on real phones, analytics, offline, tests, both platform passes | 4–6 |
| 6. Beta and store prep | TestFlight and the Play closed test running, listings and privacy policy ready | 2–4 |
| 7. Release | Both reviews passed, rollout started | review time |

About 21 to 32 working days, so four to six weeks of focused work. Phase 6's accounts and the Play closed test start
in parallel with phase 2 or 3.

**Phase 0. Shared core**
- Create `packages/core`; move `src/model`, `src/config` and the pure parts of `src/utils` there with their tests.
- Pull the decisions out of `src/services` (term selection and de-duplication, category resolution, log payloads)
  into pure functions with tests; the services call them.
- Web barrels re-export from core; ESLint and Vitest cover the new folder and ignore `mobile/`.
- Done when: web CI is green, a preview deploy behaves the same, no web component import changed.

**Phase 1. Foundation**
- `create-expo-app` in `mobile/`, SDK 58, Expo Router, TypeScript strict, React Compiler, typed routes.
- Prove the core alias in Metro, Jest and an EAS build. If it does not hold, fall back to npm workspaces (2.3).
- Theme tokens, static Archivo files, icon component, the shared primitives (button, list panel, list row, notice).
- React Native Firebase with its config plugins and `useFrameworks: "dynamic"`; the development variant on the
  emulators, started and seeded with today's `npm run emulators` and `npm run emulators:seed`; `app.config.ts`
  variants; `eas.json`.
- README: a section for the app (run, variants, builds) and the conventions that differ from the web.
- Done when: both simulators show the Setup screen reading categories from the emulator.

**Phase 2. The game**
- Settings context on the key-value store; Setup screen; categories sheet.
- The deal as a state machine in core (§13), the role card, flip, haptics, keep-awake, privacy cover, leave
  confirmation, end-of-deal screen.
- Done when: a full game with 3 and with 10 players works on both platforms, with VoiceOver, with reduced motion and
  at the largest text size; the Play tests are ported.

**Phase 3. Rest of the player side**
- How to play, suggest words, settings sheet, consent sheet, notices, error boundary, not-found.
- Done when: a suggestion sent from the app shows up in the web admin queue.

**Phase 4. Admin**
- Sign in, auth context, the device lock of §6.3 with its fallback, protected group.
- Manage data, categories, terms, suggestions with the live listener, review screen, logs.
- Reviewer claim in the rules, the script and the app.
- Done when: every admin action in §4.2 works against the emulators, writes its log entry in the same batch, and
  matches what the web admin shows for the same data.

**Phase 5. Hardening**
- Firebase apps registered, App Check providers on, attestation verified on a physical iPhone and Android phone.
- Analytics behind consent, screen views, no ad id.
- Offline: cache behaviour and the bundled snapshot.
- Jest suite complete, Maestro flows, the manual passes of §7, performance on a slow Android phone.
- Done when: the checklist of §7 is ticked on both platforms.

**Phase 6. Beta and store prep**
- Accounts, app records, credentials, first uploads, testers.
- Listings, screenshots, privacy policy page on the website, data forms, review notes.
- Done when: testers play from TestFlight and from the Play closed test, and both listings are complete.

**Phase 7. Release**
- Submit, answer review questions, phased release and staged rollout, then App Check enforcement (§6.2).

## 11. Who does what

**Only you can do**
- Enrol in the Apple Developer Program and open the Play Console account; accept their agreements; pay.
- Decide the app name, the bundle id and package name, and the items in §14.
- Create the API key and service account for submitting, and enter passwords and verification codes.
- Sign in to your Expo account on this Mac and choose its plan.
- Supply the contact details and wording you want in the privacy policy and the listings.
- Recruit the Play testers and test on your own phones.
- Approve each store submission before it is sent.

**I can do, on your go-ahead per step**
- All code in phases 0 to 5, the tests, the CI and EAS configuration.
- Register the Firebase apps and set up App Check providers with the Firebase CLI, or guide you through the console.
- Draft the listings, the privacy policy, the screenshots and the review notes.
- Run the builds and submissions with EAS once you are signed in.

## 12. Risks

| Risk | What limits it |
|---|---|
| Shared code not resolving in Metro, Jest or EAS | Proven on day one of phase 1; fallback is npm workspaces |
| React Native Firebase with SDK 58 and the New Architecture not building | It is the combination React Native Firebase tests against; proven in phase 1 before any screen exists |
| App Check only testable on real phones | Phase 5 has device time; enforcement is switched on last |
| The name being taken, or lost among the many "Spy Game" apps | Reserve it in App Store Connect as soon as the Apple account exists; a subtitle and an icon that set it apart |
| Apple questioning the admin area or the demo account | Reviewer claim, clear review notes, players never need an account |
| Google's 12 testers for 14 days | Recruit the testers during phase 2 and start the closed test with the first playable build; the rule does not apply to a Play account older than 13 November 2023 |
| The condensed type looking wrong on Android | Static font files from the start, checked on a device in phase 1 |
| Web and app drifting apart | Rules, limits, texts and decisions live in core; services have the same names |
| Admin taking longer than estimated | It is the largest phase; the player side can go to beta before it is finished |
| Running out of EAS builds, or waiting in the free queue | Native changes are batched into few builds; phase 1 is where most of them fall; the paid plan is the fallback |

## 13. Later: multiplayer

Not built now. What this plan does so that it stays possible:

- **The game is a state machine in core**, without UI and without Firebase: setup, deal, reveal per player, done. The
  Play screen drives it through one hook. A session played on several phones is a second driver of the same machine.
- **Game logic runs anywhere.** `pickSpies`, `pickTerm` and the validation have no dependencies, so a server can use
  them.
- **Web paths are app paths**, and the app has a URL scheme from day one. A join link such as `/join/<code>` becomes
  one new route on both.
- **Auth is already in the app** for admins, so anonymous sign-in for players is a small step.

What multiplayer itself will need, as its own plan:

- A server that deals the roles. If one phone dealt them, that player would know every role. That means Cloud
  Functions (the Blaze plan) or another backend, with per-player documents only that player can read.
- A session model in Firestore (session, players, round, votes), rules and rules tests for it, and presence.
- Universal links and Android app links, which need association files on Firebase Hosting (`firebase.json` ignores
  dot-folders today) and a new native build.
- Store consequences: player names are user content shown to others, so filtering and reporting; updated data forms.

## 14. Decisions of 20 November

| Question | Your answer | Where it lands |
|---|---|---|
| App name | SpyGame | 2.13, §9.1 |
| Bundle id and package name | `com.mandaraperera.spygame` | 2.13, §3.4 |
| Developer accounts | Personal, on both stores | 2.14, §9.2, §9.3 |
| Admin session on a phone | Stay signed in, admin area behind the device lock | 2.15, §6.3 |
| Reviewer access | Read-only `reviewer` claim | 2.10, §6.4 |
| Analytics | Kept, behind consent | 2.16, §6.6 |
| iPad | Not in 1.0 | 2.12 |
| Builds | All on EAS Build | 2.17, §8 |

Two answers differ from what I recommended: the device lock instead of an automatic sign-out, and EAS for every
build instead of local development builds. Both are worked into the sections above.

**Still open**

1. **Reserving the name.** A search of the App Store on 20 November found no app called exactly "SpyGame". It found
   two that start with it ("SpyGame: Word Party", "SpyGame-Logic Clue Game") and many called "Spy Game" with a
   subtitle. A search cannot see names that are reserved but not released. Only App Store Connect confirms the name,
   by creating the app record, so that is the first step once the Apple account exists.
2. **An existing Play Console account.** One created before 13 November 2023 is not under the closed-test rule.
3. **The Expo account** the project belongs to, and whether the free plan's build allowance is enough.

## 15. References

- Expo: [SDK 58 docs](https://docs.expo.dev/versions/v58.0.0/), [monorepos](https://docs.expo.dev/guides/monorepos/),
  [fonts](https://docs.expo.dev/develop/user-interface/fonts/),
  [protected routes](https://docs.expo.dev/router/advanced/protected/),
  [form sheets](https://docs.expo.dev/router/advanced/modals/),
  [from web to native](https://expo.dev/blog/from-web-to-native-with-react)
- React Native Firebase: [Expo setup](https://rnfirebase.io/), [App Check](https://rnfirebase.io/app-check/usage),
  [Firestore](https://rnfirebase.io/firestore/usage), [Analytics](https://rnfirebase.io/analytics/usage)
- Apple: [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- Google: [testing requirements for new personal accounts](https://support.google.com/googleplay/android-developer/answer/14151465),
  [target API level](https://developer.android.com/google/play/requirements/target-sdk),
  [Android 16 behaviour changes](https://developer.android.com/about/versions/16/behavior-changes-16)
