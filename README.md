# SpyGame

[the-spygame.web.app](https://the-spygame.web.app)

## 1. Game Info

- Players: 3 - 10
- Spies: 1 - _[half of players]_
- Player's task: find out who the spy is without revealing the subject.
- Spy's task: stay in the game and find out what the subject is.

## 2. Setup

1. Set the amount of players
2. Set the amount of spies
3. Select one or more categories
4. Tap Deal roles
5. Player 1 taps (without anyone else looking) the file on the screen.
6. Next it will either show the subject or _SPY_. Player 1 now knows their role.
7. Player 1 taps the file again to close it and passes the phone to player 2.
8. Repeat steps 5-7 for each player.

## 3. Rounds

- In each round every player will ask one question to another. Every player must ask and receive one question, the order
  of which is not important.
- When there are only 3 players, in each round 2 questions will be asked and received by every player.
- You can only ask yes or no questions about the subject. The spy must try to stay hidden and the players must try to
  discover who the spy is.
- At the end of the round someone will count down. At 0 everyone points to who they think the spy is.
- If the spy is voted out, they can guess the subject. If correctly guessed, the spy wins. If incorrect, the players
  win.
- If the spy is not voted out, another round of questions and voting begins.
- The last round is when there are three people remaining.
- If in the last round the spy does not get voted out, they win even if they don't know the subject.

## 4. Example questions

_Countries_

- Does the country have a coastline?
- Does the flag of the country contain the color blue?
- Is the country located in Europe?
- Is the country known for its landscape?

_Sports_

- Is the sport played in a team?
- Is a ball used in this sport?
- Is this sport featured in the Olympics?
- Is [country] known to be very good in this sport?

_Objects_

- Does the object require electricity?
- Was this object invented in the last 100 years?
- Is the object waterproof?
- Does this bar/restaurant/house have this object?

Be creative and think of funny questions.

## 5. Submit Categories and Words

`Settings -> Suggest words`

The more categories and words, the better! If you would like to add some of your own, you can do so through the
settings. Once they are approved by an admin, you will see your content in the game!

### Managing content (admins)

`Settings -> Manage Data` shows the counts and leads to four pages:

- **Categories**: create a category with its first terms, rename or delete one. Each row shows its number of terms
  and opens it on the Terms page; a category without terms is marked, because players cannot pick it.
- **Terms**: pick a category (it is kept in the URL), filter its terms, add several at once (one per line; terms it
  already has are skipped), rename or delete one.
- **Suggestions**: open a suggestion to see where it goes, untick the terms to leave out, and approve the rest, or
  deny it. Terms the category already has are shown and skipped. New suggestions appear without a reload.
- **Logs**: every approval, denial, creation, rename and deletion, newest first, with who did it.

Every change and its log entry are written in one batch, so there is never one without the other.

## 6. Development

1. `npm install` (Node 22.12 or later, see `.nvmrc`)
2. `npm run dev` (uses the live Firebase project), or the local emulators below

| Command | What it does |
|---|---|
| `npm run lint` / `npm run lint:fix` | ESLint; `lint:fix` also sorts the imports |
| `npm test` | Unit and component tests (Vitest, jsdom) |
| `npm run test:rules` | Firestore rules tests on the local emulator (needs Java 21+) |
| `npm run build` | Type check and production build |
| `npm run check:bundle` | Fails if the build contains an App Check debug token |

CI runs all of these on every pull request and before every deploy of `main`.

### Local emulators

To try the admin pages without touching live data (needs Java 21+), run these in order; the first and the last keep
running:

1. `npm run emulators`: the Auth and Firestore emulators with `firestore.rules`, project `demo-spygame`.
2. `npm run emulators:seed`: the content of `data/data.json`, four suggestions to review (one malformed) and an
   emulator-only admin account; its email and password are in `scripts/seed-emulators.cjs`. Run it again after
   `npm run test:rules`, which clears the emulator.
3. `npm run dev:emulators`: the app in mode `emulators` (`.env.emulators`), which connects to the emulators and skips
   App Check. Production builds never contain this switch.

Emulator data is lost when the emulators stop.

### Environment

See `.env.example`. Never commit the real files; they are git-ignored.

- `.env.development.local`: `VITE_FIREBASE_APPCHECK_DEBUG_TOKEN`, an App Check debug token registered in the Firebase
  console. Vite loads this file for `npm run dev` only, and `src/services/firebase.ts` uses it only in development
  builds, so it never reaches the public bundle.
- `.env`: `FIREBASE_ADMINSDK_SERVICE_ACCOUNT_PATH`, the path to a service-account key kept outside the repo, for the
  scripts below.

### Firestore and admins

- `firestore.rules` is the only server-side authorization: anyone reads categories and terms and creates suggestions;
  everything else needs the `admin` custom claim. Deploy it with `npx firebase deploy --only firestore:rules`, and
  keep its limits in sync with `src/config/limits.ts`. Creating categories and adding terms writes logs with the
  action `created`, which only these rules allow: deploy them before using those pages on the live site.
- Grant or revoke the admin claim with `node scripts/set-admin.cjs <email> [--revoke]`; it applies after the next
  sign-in.
- Seed the original content with `node data/seed.cjs`. It asks for confirmation, keeps category ids and approved
  terms, and only replaces the original terms. With `FIRESTORE_EMULATOR_HOST` set it seeds the emulator instead.
- `firebase deploy` of hosting builds and runs the bundle check first (see `firebase.json`).

## 7. Conventions

- `src/app` holds the app shell (`App`, `AppProvider`, `AppRouter`), `src/app/pages` the route-level pages.
- `src/app/pages/admin` holds the admin pages. `AppRouter` lazy-loads them behind `ProtectedRoute`, so they have no
  barrel and players never download them.
- `src/components/<feature>` holds the components used by those pages, each folder with an `index.ts` barrel.
- The folder `src/components/ui` and its files are provided by Chakra UI. Don't rename them.
- Shared types are in `src/model`, request/response shapes such as `PaginatedSuggestions` too.
- Query keys are centralized in `src/config/queryKeys.ts`, limits in `src/config/limits.ts`.
- Flow of data: service -> hook -> component.
    - Firestore and Auth calls only live in `src/services` (`create*`, `read*`, `update*`, `delete*`, `listen*`).
      Changes that touch several documents are one `writeBatch`, with their log entry in the same batch.
    - Components only use hooks.
- Import through the `@/` barrels, without file extensions, `import type` for types. Inside a module folder, import
  siblings relatively (`./firebase`), never through the folder's own barrel.
- Tests sit next to the code they cover (`*.test.ts(x)`); rules tests are in `tests/rules`.
