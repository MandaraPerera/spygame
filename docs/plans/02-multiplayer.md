# Plan 02: Multiplayer

Draft of 25 November 2026, written against `main` at `6f3b876`. Nothing in this plan is built yet. Where your
description or the rules of the game leave a choice open, the plan picks a default and says so; §18 lists the ones I
want your answer on.

SpyGame gets a second way to play: everyone on their own phone, in one session. A host opens a session and the others
join with a link, a QR code or a six-digit code. A server deals the roles, so no phone knows more than its owner
should. The app then runs the game: who asks whom, a stopwatch, the vote, the reveal, the elimination and the next
round, until someone wins. The last phase adds accounts and a friend list. The one-phone game stays as it is.

## 1. Goal and scope

**In scope**

- Sessions on the website: host one, join by link, QR code or code, a lobby, host controls.
- Guests: playing needs a name, not an account.
- The whole game on screen: the deal, a private role file per phone, the question order, a stopwatch, the vote, the
  countdown, the reveal, the elimination, the spy's guess, the result, playing again.
- Everything that makes it survive a real evening: phones that lock, lost connections, people leaving, a host who
  drops out, two people tapping at once, an old tab after a deploy.
- Accounts and friends, as the last phase: sign-in, friend code, link and QR, requests, the friends list, inviting a
  friend to your lobby, deleting the account.
- The backend all of this needs: Cloud Functions, session data and rules in Firestore, and tests for each layer.

**Out of scope**

- The native apps (plan 01). §17 says what this plan leaves ready for them and in which order I would build.
- Chat and voice, public lobbies with strangers, watching without playing, scores across evenings, your own word list
  for a session, a big-screen view, push notifications on the web, languages other than English.
- A time limit per round or per vote. You mentioned it as a later setting; §5.7 keeps the door open, nothing is built.

## 2. How a game goes

1. **Host.** On the home screen, "Together" and "Host a game". The first time, the app asks for a name. The lobby opens
   with a six-digit code.
2. **Invite.** The host shares the link (system share sheet or copy), shows the QR code, or reads the code out. Others
   open the link or scan the QR with their camera, or type the code on the home screen. They enter a name and are in.
3. **Lobby.** Everyone sees who is there. The host sets the number of spies and the categories; the number of players
   is simply who is in the room (3 to 10). The host taps "Start game".
4. **Deal.** Every phone shows its owner's file, closed. You tap it to see your word or SPY, and tap again to close
   it. The app shows how many players are ready. When the last file is closed, the game starts for everyone after a
   three-second beat.
5. **Questions.** Every phone shows the same thing: the round's stopwatch, "Ana asks Carl" in large type, and the next
   two pairs small underneath. Anyone in the game can tap Next or Previous, and all phones follow. Your own phone
   says "You ask Carl" or "Ana asks you" when it is your turn.
6. **Vote.** After the last question, Next becomes "Go to the vote". Everyone picks who they think the spy is and
   locks it in. Nobody sees a vote before the reveal, only who has locked in.
7. **Reveal.** When the last vote is in, all phones count down 3, 2, 1 together, then show who voted for whom, who is
   out, and whether that player was a spy.
8. **Elimination.** A player who was not a spy is out and watches the rest. A spy gets one guess at the word on their
   own phone: right and the spies win, wrong and that spy is out.
9. **Next round or the end.** If nobody has won, a new round starts with a new order and a fresh stopwatch. The game
   ends as in the README: the players win when every spy is out, the spies win on a right guess or by surviving the
   final round (three players left).
10. **Again.** The result screen shows the word, the spies and the story of each round. The host starts another game
    with the same people, or goes back to the lobby.

```
lobby ─▶ roles ─▶ questions ─▶ voting ─▶ reveal ─▶ guess, if a spy is out ─▶ has someone won? ─ yes ─▶ result
           ▲          ▲                                                             │                    │
           │          └─────────────────────── no: next round ◀─────────────────────┘                    │
           └──────────────────────────────────── play again ◀────────────────────────────────────────────┘
```

A tie adds one extra vote between the tied players before the reveal settles (§3). "Back to lobby" on the result
screen returns to the lobby instead of dealing again.

## 3. Rules the app now has to decide

Around a table, people settle these on the spot. An app has to pick one answer. These are my defaults; each is one
function in the shared game logic, so changing one later is cheap.

| Situation | Default | Other options |
|---|---|---|
| Question order | One chain per round: the players still in, shuffled into a circle, each asks the next. The one who answered asks next, as in your example (A asks C, C asks B, B asks D, D asks A). A new shuffle every round. | Random pairs without a chain: reads worse and nobody knows who is next. |
| Three players | The circle twice, the second time in reverse, so everyone asks and answers both others. That is the README's rule of two questions each. | – |
| Ending a round | After the last question, Next becomes "Go to the vote". The host can skip to the vote earlier, and cancel a vote that was started by accident. | Any player may call a vote at any time. |
| Who votes | Everyone still in, spies too. Not for yourself. Players who are out watch. | – |
| The ballot | Pick, then "Lock in vote". Locked is final. Others see who has locked in, never for whom. | Changeable until everyone is in: invites waiting games. |
| A voter who is not responding | The host can close the vote. Missing votes do not count. | A vote timer (the later setting). |
| Tie for most votes | One runoff between the tied players, everyone still in votes again. Still tied, or everyone tied: nobody is out and a new round starts. In the final round that means the spy survived. | No runoff: a tie means nobody is out. Or: a random tied player is out. |
| Voted out, no spy | Out for this game. The file is shown to all: not a spy. They watch and keep quiet. | – |
| Voted out, a spy | One guess, on their own phone, picked from the words of the session's categories by typing (§8). Right: the spies win. Wrong: that spy is out. | Typed freely and compared by the app (typos and synonyms become arguments), or said out loud and judged by the host (the host may be a spy). |
| More than one spy | Spies do not know each other, as today. The players win when every spy is out. The spies win on one right guess, or when a spy is still in after the final round. | Spies know each other; the game stops as soon as the players cannot win any more. |
| What a spy knows | Which categories are in play and how many spies there are, as today. Not the word. | – |
| Who becomes a spy | A fresh random draw every game, so the same player can be the spy twice in a row. | A draw that rotates: fairer over an evening, but it tells everyone who it probably is not. |
| Final round | A vote that starts with three (or fewer) players in. If a spy is still in afterwards, the spies win. | – |
| Someone leaves mid-game | They are taken out of the order. An open vote starts over. Fewer than three players left, or no spy left because the spy walked away: the game ends without a winner and shows the roles. | The spy leaving counts as a win for the players. |
| Someone arrives mid-game | They wait and watch, and are dealt in with the next game. | Refuse them until the game is over. |
| Forgot your word | "My file", press and hold, shows it again at any time. | – |
| The host | Plays like everyone else. Being host is about the session, not the game: a host who is voted out is still the host. | A host who only runs the game and does not play. |

## 4. Decisions

| # | Decision | Why |
|---|---|---|
| 4.1 | The server is the only one that changes a session. Phones send actions to a Cloud Function and read the result through Firestore listeners. | A phone that deals knows every role, and a phone that counts votes can change them. Plan 01 §13 came to the same conclusion. Rejected: the host's phone as dealer. It needs no paid plan, but the host can read all roles, the game dies when the host's connection does, and the security rules would have to judge every move. |
| 4.2 | Firestore holds the session. No Realtime Database, no websocket server. | It is the database the app, its rules tests and its emulators already use, and a session changes a few times a minute, not sixty times a second. Rejected: Realtime Database (a second database with its own rules language, though it has the better presence: see 4.10) and a room server such as PartyKit, Colyseus or Supabase (a second platform and an auth bridge to it). |
| 4.3 | One public document per session, one private document per player, one document only the server reads. | One listener gives every phone the same consistent state. Secrecy is per document, which is exactly what security rules can enforce. |
| 4.4 | The game is one pure function in `packages/core`: state, action, who, when and a random source in; new state or an error out. The server runs it inside a transaction. | Every rule in §3 and every edge case in §10 becomes a fast unit test without Firebase. The native apps reuse it. It is plan 01's "state machine in core", extended to a whole game. |
| 4.5 | One callable function, `session`, with typed actions. Not one function per action. | One pool of warm instances instead of fifteen cold ones, and one place for sign-in, App Check, validation, rate limits and versioning. |
| 4.6 | Guests by default: an anonymous Firebase account, made when someone first hosts or joins, kept on the device. An account is only needed for friends. | Joining must take ten seconds. A friend list on a guest identity would vanish with the browser's storage (§6). |
| 4.7 | Players get their own Firebase app instance inside the multiplayer code, with its own Auth, Firestore and Functions clients. The existing instance, with the admin session that ends with the tab, is not touched. | An admin sign-in on the shared instance would replace the player on that device and end with the tab; a player who stays signed in would turn the admin session into a permanent one. Two instances keep both behaviours, and no admin code changes. |
| 4.8 | One code for everything: six digits. The link and the QR code carry the same code. | Digits sound the same in Dutch, French and English, and a phone shows a large number pad for them. A million codes, short-lived, with limits on wrong tries (§11). |
| 4.9 | No QR scanner inside the website. The phone's camera opens the link. | It works on every phone without a camera permission, and the site's `Permissions-Policy` keeps the camera off. The browser's own API for reading codes only works in Chrome on Android. The native apps get a scanner. |
| 4.10 | Presence is a heartbeat in Firestore: each phone marks itself every 30 seconds, others show it as away after 75. The host gets tools (remove, close the vote, start anyway) instead of the app removing people by itself. | People are usually in the same room, so "is Tom still there?" is answered out loud. Rejected for now: Realtime Database presence, which notices a lost connection by itself and costs nothing per beat. It is the upgrade if the heartbeat proves too slow or too costly. |
| 4.11 | Time comes from the server. Each phone measures its offset to the server clock; the stopwatch and the countdown are computed from timestamps. | Phone clocks differ by seconds, and timers stop when a phone sleeps. Computed time is right the moment the screen wakes. |
| 4.12 | No chat and no free text except names. | The game is spoken. Every text field is a moderation duty, on the web and later in the stores. |
| 4.13 | Anyone in the game moves it forward. Only the host changes the setup, removes people or overrides a wait. | What you asked for, extended to the other steps. A host-only game stalls when the host looks away. |
| 4.14 | Multiplayer sits beside the one-phone game and loads as its own chunk. | The one-phone game needs no network round trip and no account, and its players should not download multiplayer. The main bundle is already 1.4 MB. |
| 4.15 | The function runs in `europe-west1`. | That is where the project's Firestore database is (checked with the Firebase CLI on 25 November), so every action stays inside one region. |
| 4.16 | No scheduled jobs and no database triggers. Deadlines are checked when a phone asks, and old sessions are removed by Firestore's TTL. | Fewer moving parts. A game with nobody connected does not need to advance. |
| 4.17 | Every call carries a protocol version. The server refuses a client that is too old, and the app then asks to reload. | A tab can stay open for days across deploys. |
| 4.18 | Friends come last, need an account, and are made by code, link, QR or from someone you just played with. No search by name. | Session links already cover joining. No search means no way to look up strangers. |

## 5. Architecture

### 5.1 Overview

```
phone (web, later native)                         Firebase, europe-west1
  listeners  ◀───────── session document ─────────  Firestore
             ◀───────── own private document ─────    sessions/{id}            public to members
             ◀───────── presence document ────────    sessions/{id}/private    one per player
  heartbeat  ─────────▶ own entry in presence         sessions/{id}/presence   one document, an entry per player
  actions    ─────────▶ callable function `session`   sessions/{id}/server     server only
                          │  checks sign-in, App Check, version, limits
                          │  transaction: load, run the game logic from packages/core, save
                          ▼
                        Firestore
```

A phone never writes game state. Its only direct write is its own heartbeat.

### 5.2 Repository

```
spygame/
  packages/core/src/                    plan 01's shared code, created in phase 0 of this plan
    model/ config/ game/ rules/ text/   as plan 01 describes
    session/                            new: the multiplayer game
      types.ts      state, actions, errors
      reduce.ts     the pure function of 4.4
      turns.ts      the question order, and repairing it when someone leaves
      tally.ts      counting votes, ties
      outcome.ts    who is out, who wins, what comes next
      view.ts       what one player sees and may do right now (shared by web and native)
      names.ts  codes.ts  limits.ts
  functions/                            new: own package.json and lockfile
    src/index.ts                        the callable: checks, transaction, mapping to Firestore
    src/social.ts                       phase 6: friends
  src/                                  the website
    app/pages/Join.tsx  Session.tsx     lazy-loaded, as the admin pages are
    components/session/                 lobby, invite sheet, role file, round board, ballot, reveal, result
    hooks/                              useIdentity, useSession, useSessionActions, useServerClock, usePresence
    services/players.ts  session.ts     the players instance of 4.7; calls and listeners
  firestore.rules  firebase.json  tests/rules   extended
  tests/e2e/                            new: several browsers in one game, on the emulators
```

The website keeps its conventions: service, hook, component; Firebase calls only in `src/services`; new services are
added to the mock list in `src/test/setup.ts`. Cloud Functions deploys only the `functions` folder, so its build
bundles `packages/core` into the output.

### 5.3 Data model

```
sessions/{sessionId}                    members read, nobody writes
  v, code, hostUid, rev                 rev counts every change
  status                                "lobby", "game" or "ended"
  locked                                no new players
  settings                              spies, categoryIds            (later: roundSeconds, voteSeconds)
  members                               uid → name, colour, joinedAt, isGuest, state "in" or "waiting"
  memberUids                            the same uids as a list, for the rules
  lastAction                            who did what last: "Sam tapped Next"
  createdAt, expiresAt
  game                                  null in the lobby
    number                              first, second, third game of this session
    phase                               roles, questions, voting, reveal, guess, over
    seats, alive, spyCount, round
    ready                               roles: who has closed their file
    turns, turnIndex                    questions: the order and where we are
    clock                               elapsedMs and runningSince: the round's stopwatch
    ballot                              candidates, who has locked in, isRunoff
    reveal                              at, votes (voter → target), tally, tied, eliminated, wasSpy
    guess                               spy, the guessed word, isCorrect
    result                              winner, reason, the word, its category, the spies
    history                             one entry per round, for the result screen

sessions/{sessionId}/private/{uid}      only that player reads
  game (number), role, term             term is empty for a spy

sessions/{sessionId}/presence/all       one document: player → last seen; a player updates only their own entry
sessions/{sessionId}/server/state       nobody reads
  term, spies, votes not yet revealed, words already used in this session, removed players

sessionCodes/{code}                     server only: which session, until when
rateLimits/{key}                        server only: counters with an end time
```

Three points carry the secrecy:

- The public document never names a spy or the word before the game is over, except "was a spy" for a player who was
  just voted out. A test serialises the public state after every step of a simulated game and searches it for the
  word and for the spies.
- A vote sits in the server document until the reveal. The public document only lists who has voted.
- The private document carries the game's number. A phone ignores a file that belongs to the previous game, so "Play
  again" can never flash the old role while the new one is on its way.

### 5.4 Actions

Every action names the session, and the ones that move the game also name the state they were sent from, so a
repeated or late tap changes nothing (§10.4).

| Action | Who | When | What happens |
|---|---|---|---|
| `ping` | anyone signed in | always | Returns the server time and whether this client is new enough. Also warms the function while someone types a name. |
| `peek` | anyone signed in | always | For the join screen: the host's name, how many players, lobby or game, full, locked. |
| `create` | anyone signed in | – | A session, its code, the caller as host. |
| `join` | anyone signed in | lobby or game | Adds the caller. During a game they wait. Joining twice is harmless. |
| `rename` | a member | lobby | A new name, unique in the session. |
| `leave` | a member | always | Removes the caller; §10.6 says what that does in each phase. |
| `configure` | host | lobby, result | Spies and categories. Spies are clamped to the players present, as on the home screen today. |
| `lock` | host | lobby | Opens or closes the session for new players. |
| `remove` | host | always | Like `leave`, and that player cannot come back into this session. |
| `makeHost` | host | always | Hands the host role over. |
| `takeHost` | a member | host away for 90 s | The server checks the host's heartbeat itself. |
| `start` | host | lobby, result | Checks 3 to 10 players and that the categories have words; picks spies and word; writes every file. |
| `ready` | a dealt player | roles | Marks the caller. The last one starts round 1. |
| `startAnyway` | host | roles, after 15 s | Starts round 1 without waiting for the rest. They stay in the game and can still look at their file. |
| `turn` | a player still in | questions | From question i to i+1 or i−1, only if the game is still at i. |
| `startVote` | a player still in, at the last question; host at any question | questions | Stops the stopwatch, opens the ballot. |
| `cancelVote` | host | voting | Back to the last question; the stopwatch runs on. |
| `vote` | a player still in | voting | Stores the vote. The last one counts them and sets the reveal. |
| `closeVote` | host | voting | Counts what is there. |
| `continue` | a player still in, or the host | reveal or guess, once it has played | To the runoff, the guess, the next round or the result. |
| `guess` | the spy who is out | guess | Compares with the word. |
| `skipGuess` | host | guess | Counts as a wrong guess, for a spy who is gone. |
| `again` | host | result | Deals a new game with everyone present, waiting players included. |
| `toLobby` | host | result | Back to the lobby with the same people. |
| `end` | host | always | Closes the session for everyone. |

### 5.5 The callable

- Request: protocol version, session id or code, the action, and for game moves the `rev` or question number it was
  sent from. Response: the server time, plus what the action returns (`create` and `join` return the session id).
- Errors come back with one reason from a closed list, each with its own text in the app: not found, full, locked,
  removed, name taken, name not allowed, too few players, no words, not allowed, too many tries, expired, update
  required. A move that arrives too late (someone else already tapped) is answered as "nothing to do" and shows no
  error.
- Settings: `europe-west1`, named on the server and again in the app, because the app does not find the region by
  itself. App Check required. At most 10 instances (the default is 100), so a flood cannot scale the bill. A
  30-second timeout. Calls accepted from the site's own origins only.
- The game logic gets its randomness from the server (`crypto`), the tests from a seeded source, the way `pickSpies`
  already takes one.

### 5.6 Security rules

| Path | Read | Write |
|---|---|---|
| `sessions/{id}` | signed in and listed in `memberUids`; no listing of sessions | nobody |
| `sessions/{id}/private/{uid}` | only that uid | nobody |
| `sessions/{id}/presence/all` | players who have an entry in it | a player's own entry only, set to the request time. The server adds the entry on join and removes it on leave, so someone who was removed can neither read nor write. |
| `sessions/{id}/server/*`, `sessionCodes`, `rateLimits` | nobody | nobody |
| `users`, friends (phase 6) | §9 | nobody; through the `social` function |

None of these rules looks up a second document. Firestore bills such a look-up as a read, and again on every update
a listener receives, which would have doubled the cost of the heartbeat. That is why presence is one document with
an entry per player: being in it is the permission.

Rules tests cover each row from four seats: a member, another member, a signed-in stranger and nobody.

### 5.7 Time: stopwatch and countdown

- **Offset.** Every response carries the server time. The phone compares it with its own clock around the call and
  keeps the measurement with the shortest round trip. It measures again when the app comes back to the foreground.
- **Stopwatch.** The session stores `elapsedMs` and `runningSince`. A phone shows `elapsedMs + (server now −
  runningSince)` and redraws once a second. Stopping for the vote and resuming after a cancelled vote are just
  changes to these two fields. A pause button or a limit per round would be too: a limit is one more field,
  `endsAt`, which the server checks when a phone reports that time is up.
- **Countdown.** The reveal carries a moment four seconds in the future. Every phone counts down to that moment on
  its corrected clock, so the room reaches zero together. A phone that gets the message late skips ahead to where
  the others are.
- **Reveal.** The animation is a fixed sequence from that moment: votes, count, who is out, the stamp. "Continue"
  appears when it has played, so nobody can cut it short for the others.

### 5.8 Presence and coming back

- A phone updates its presence every 30 seconds while the page is visible, and at once when it becomes visible again
  or reconnects. Others show a player as away after 75 seconds of silence.
- The screen stays awake during a game where the browser allows it (Screen Wake Lock), and the lock is asked for
  again each time the page becomes visible.
- Coming back needs nothing special. The route holds the code, the device holds the identity, and every screen is
  drawn from the server's state. Reload, lock and unlock, or a dead spot in the garden: the listener reconnects and
  the phone shows where the game is now, in the middle of a reveal included.
- The home screen shows "Back to your game" while a session you are in is still alive.
- While offline the app shows a banner and disables the buttons. It does not queue taps for later.

### 5.9 Clean-up and limits

- A session ends three hours after its last action and at most 24 hours after it was created. The server treats it
  as gone from that moment; Firestore's TTL deletes the documents afterwards, typically within 24 hours. Private,
  presence and server documents carry their own end time, because TTL does not follow a document into its
  subcollections.
- A code is free again when its session has ended.

| Limit | Value |
|---|---|
| People in a session | 10, waiting players included |
| Players to start a game | 3 to 10 |
| Name | 2 to 16 characters, unique in the session without regard to case |
| Sessions created | 10 per hour per identity |
| Wrong codes | 10 per 10 minutes per identity, 30 per address |
| Actions in a session | 120 per minute per player; two changes of question at least 250 ms apart |

The limits live in `packages/core`, next to the ones in `limits.ts` today, so the app and the server agree.

## 6. Identity: guests and accounts

**Guests**

- The identity is made when the host or join screen opens, not when the site loads. Someone who only plays on one
  phone never gets one.
- It is kept on the device (IndexedDB). The name is kept too and offered again next time.
- A guest identity can get lost: cleared site data, a private window, another browser, and Safari, which deletes a
  site's stored data after seven days of use without a visit to that site. For a guest that costs nothing: a new
  identity, the same name. It only hurts mid-game, which §10.7 covers.
- A link opened inside Instagram, TikTok or a similar app runs in that app's own browser, with its own storage. A
  guest can play there. The identity is not the one in Safari or Chrome.

**Accounts (phase 6)**

- "Create an account" upgrades the guest in place: the same identity gains a sign-in, so nothing is lost.
- Sign-in methods: Google and Apple (default; §18). The App Store requires a privacy-minded sign-in next to a
  social one (guideline 4.8), and Sign in with Apple is the usual way to meet that, so the iOS app needs it anyway.
- Sign-in opens in a popup, which Firebase documents as the alternative to its redirect flow on browsers that block
  third-party storage. Should popups prove awkward on phones, the redirect flow needs the site's own domain as
  `authDomain`; the players instance can set that for itself (4.7). Google refuses to sign in inside the browsers
  built into other apps, so the account sheet there says to open the page in Safari or Chrome.
- Switching accounts is blocked while you are in a session; the sheet says "after this game".
- An account that already exists on another device signs in instead of linking. The guest identity on this device
  is then left behind.
- "Delete account" removes the profile, friendships on both sides, requests, invitations and the sign-in.

## 7. Joining: code, link, QR, share

| Way | How it works |
|---|---|
| Link | `https://the-spygame.web.app/join/482913`. Opens the join screen for that session. |
| QR code | The same link, drawn with Chakra UI's `QrCode` (already installed, no new dependency). The invite sheet shows it large enough to scan across a table. |
| Code | Six boxes on the home screen (Chakra UI's `PinInput`, number pad). Typing the sixth digit looks the session up. Pasting a code or a whole link works. |
| Share | The system share sheet where the browser has one (phones do, desktop Firefox does not), otherwise "Copy link". The text is "Join my SpyGame" followed by the link. |
| Friend (phase 6) | "Invite friends" in the invite sheet. The friend gets a notice in the app with a Join button. |

- The join screen first shows whose game it is and how many are in ("Join Sam's game, 4 players"), then asks for the
  name.
- `index.html` gets Open Graph tags, so a link pasted in WhatsApp or iMessage shows the name and the icon instead of
  a bare address. The description stops calling it a pass-the-phone game only.
- Routes: `/join/:code` to get in, `/session/:code` once you are in. Each sends you to the other when you are on the
  wrong one. They are plan 01's "one new route on both".

## 8. Screens

All of them in today's look: midnight, manila, the file, the stamp. Each has a loading state, and each can be
entered cold after a reload.

| Screen | What it shows | Notes |
|---|---|---|
| Home | A switch under the intro: **Together** and **One phone**. One phone is today's setup, unchanged. Together has "Host a game", the six code boxes, and "Back to your game" when there is one. | The switch remembers the last choice. |
| Name | One field. Asked once, changeable in the lobby. | 2 to 16 characters. |
| Join | Whose game, how many players, the name field, "Join". | States: looking up, no such game, full, locked, removed, game in progress ("you are in the next one"). |
| Lobby | The code, large, tap to copy. Invite button, for everyone. The players with host and "you" marks and an away dot. Spies and categories. "Start game" for the host, "Waiting for Sam" for the others. | The host edits spies and categories with today's stepper and sheet; the sheet gets its selection as a parameter instead of reading the saved settings. Per player the host has Remove and Make host. |
| Invite sheet | QR code, code, Share link, Copy link. Later: Invite friends. | |
| Roles | Your file with your name on the front, the hint under it, "3 of 5 ready" with the players ticking off. | The existing `RoleCard`, with the front text as a parameter. It closes by itself when the page goes to the background. |
| Round | Top: round number, "Final round" when it is, the stopwatch. Middle: the current pair, large. Under it the next two, small. A row of dots for the questions. "Sam tapped Next". Bottom: Previous and Next. | "You ask Carl" and "Ana asks you" on the two phones involved. "My file" (hold) and "Order" (the whole list, who is in and out) as small buttons. |
| Ballot | "Who is the spy?" The players still in, without you. Tap one, "Lock in vote". Then who is still deciding. | A runoff names the tie: "Vote again: Ana or Carl". |
| Reveal | 3, 2, 1. The votes land on the suspects one by one and the counts tick up. The file with the most votes comes forward, flips, and gets its stamp: SPY in red, or NOT A SPY. Then one line on what follows. | Built with GSAP, which the card flip already uses. Reduced motion gets the same steps as plain panels. |
| Guess | For the spy: "One guess. What is the word?" Typing shows matching words from the session's categories; picking one asks for confirmation. For the others: "Carl is guessing the word". Then the guess and its stamp. | The word list is public data today, so showing matches gives nothing away. |
| Result | Who won, the word, who the spies were, each round's vote, the time played. "Play again" and "Back to lobby" for the host. | Later: "Add friend" next to each player. |
| Watching | The round, ballot and reveal screens without buttons, for players who are out or waiting. | "You are out. Keep the word to yourself." |
| Notices | Reconnecting. You were removed. The game has ended. A new version is ready, reload. | |

Accessibility is part of each screen, as on the site today: the current pair, the countdown and the result are
announced as text; the stopwatch is not read out every second; every target is at least 44 px; nothing depends on
colour alone; leaving a game asks first, the browser's Back button included (the review left that open for the
one-phone game).

## 9. Friends (phase 6)

- **Profile.** Name, colour and a friend code. Other players can only fetch it by its id, never list or search.
- **Adding.** Your friend code as text, link (`/friend/<code>`) and QR. Typing someone's code. "Add friend" next to
  an account holder on the result screen, which is how most friendships will start. A guest who taps it is offered
  an account first.
- **Requests.** The other person accepts or declines. Declining tells nobody. Blocking stops requests and
  invitations from that person for good, and they are not told either.
- **List.** Friends, incoming requests with a badge on the home screen, sent requests, your own code.
- **Inviting.** From the lobby's invite sheet. The friend sees "Sam invites you to a game" with a Join button the
  next time the app is open, and at once when it already is. An invitation disappears when its session ends.
  Without push notifications that is as far as the web goes, so the share link stays the main way to invite. Push
  on iOS only reaches sites that were added to the home screen, so push belongs to the native apps.
- **Data.** `users/{uid}`, `users/{uid}/friends`, `friendRequests`, `users/{uid}/invites`, `users/{uid}/blocked`,
  `friendCodes`. Phones read their own; every change goes through a second callable, `social`, which checks both
  sides.
- **Limits.** 100 friends, 20 open requests, 20 invitations an hour.
- **Privacy.** Friends see your name and colour. Nothing shows whether you are online, unless you invite them.

## 10. Edge cases

### 10.1 Joining

| Situation | What happens |
|---|---|
| Wrong code, or a session that has ended | "No game with that code." Wrong tries count towards the limit. |
| The session is full, locked, or you were removed from it | A message that says which. |
| A game is running | You join as waiting and watch. You are dealt in with the next game. |
| Your name is taken | "There is already a Sam here." Pick another. |
| You are already in another session | "Leave your current game and join this one?" |
| You tap Join twice, or open the link twice | You are in once. |
| The host opens their own link | Straight to the lobby. |
| The browser keeps no storage (private window, storage blocked) | It works until the tab closes. The join screen warns that this tab is your seat. |
| Someone outside the group gets hold of the code | They appear in the lobby like anyone else. The host removes them and locks the session. |

### 10.2 Lobby

| Situation | What happens |
|---|---|
| Fewer than three players | "Start game" is off and says how many are missing. |
| More spies set than the players allow | Clamped when players leave, and again at the start. |
| A chosen category was deleted, or has no words | The start fails with "Pick the categories again." |
| Every word of the chosen categories was already played in this session | The used list starts over. Otherwise a word never repeats within a session. |
| A player looks away | Shown as away. Starting asks: "Tom seems away. Start anyway?" |
| The host leaves | The player who joined first becomes host. The last person leaving ends the session. |
| The host is away for 90 seconds | The others get "Take over as host". |
| Nobody does anything for three hours | The session ends. |

### 10.3 Dealing

| Situation | What happens |
|---|---|
| Someone never opens their file | After 15 seconds the host gets "Start anyway", with the names it is waiting for. |
| Someone opens the file again after closing it | Fine. Ready stays ready. |
| The last file closes while yours is open | Your screen moves on with everyone's after the three-second beat. |
| Someone leaves or is removed before round 1 | The roles are dealt again for those who remain, or the lobby returns if fewer than three remain. Nothing was said yet, so nothing is lost. |
| You reload | Your file is still yours. Whether you were ready comes from the server. |
| The public state arrives before your file | The card shows "Getting your file" until the file of this game is there. |
| The phone lies face up on the table | The file is closed unless you opened it, closes when the page goes to the background, and "My file" only shows while held. |

### 10.4 Questions

| Situation | What happens |
|---|---|
| Two people tap Next at the same moment | Both ask to go from question 2 to 3. The server does it once. |
| You tap Next just as someone else's tap arrives | Next and Previous pause for 600 ms after every change, with a visible pulse, so you never skip the question you meant to confirm. |
| Someone keeps tapping back and forth | "Sam tapped Previous" is on every screen. The server slows them down, and the host can remove them. |
| Next on your own phone | Moves at once on your screen and is taken back if the server says otherwise. |
| A player in the order leaves | The chain closes around them: whoever would ask them asks the next player instead. Questions already asked stay. |
| A player in the current pair is away | Shown as away. The group decides; anyone can tap Next. |
| "Go to the vote" by accident | The host cancels the vote and the round continues at the last question, with the stopwatch running on. |
| The phone slept for five minutes | It wakes on the right question with the right time. |
| First question, Previous | Off. A round cannot be rewound into the last one. |

### 10.5 Vote, reveal, guess

| Situation | What happens |
|---|---|
| You try to vote for yourself or for someone who is out | Not offered, and refused by the server. |
| You lock in twice | The first counts. |
| Someone does not vote | After 20 seconds the host gets "Close the vote". |
| Nobody voted | Nobody is out. |
| A tie | The reveal shows it, then the runoff starts (§3). |
| Someone leaves during the vote | The vote starts over without them, with a line that says why. |
| Your phone gets the reveal late | It joins the animation where the others are. |
| You reload during the reveal | The same. After it has played you see its end state. |
| The spy who must guess is gone | After 30 seconds the host gets "Skip the guess", which counts as wrong. |
| The word was renamed or deleted by an admin during the game | The game keeps the word it was dealt. The guess is compared with that. |
| A wrong guess while another spy is still in | Everyone sees the wrong guess. The word stays hidden. |

### 10.6 Leaving, by phase

| Phase | A player leaves or is removed |
|---|---|
| Lobby, result | Gone from the list. |
| Roles | Deal again (10.3). |
| Questions | Out of the order (10.4). Then the two checks below. |
| Voting | The vote starts over. Then the two checks. |
| Reveal | Nothing changes; the result stands. |
| Guess | If it was the guessing spy: a wrong guess. |
| Any | **Check 1:** no spy left in the game because the last one walked out: the game ends without a winner. **Check 2:** fewer than three players in: the same. Both show the word and the roles. |

Being away is not leaving. A player who is away keeps their seat until they come back, leave, or the host removes
them.

### 10.7 Identity and devices

| Situation | What happens |
|---|---|
| The same person in two tabs | Both show the same seat. |
| The same person on two devices | Two guests, two seats. The host removes one. |
| A guest loses their identity mid-game | They come back as a new, waiting player. Their old seat shows as away and the host removes it, which follows 10.6. Recovering a seat is a later feature. |
| A link opens in an in-app browser | It works as a guest, with that browser's own identity. |
| The site is on the home screen | iOS gives it storage of its own. A link from a chat still opens in Safari, as another guest. |

### 10.8 Versions and failures

| Situation | What happens |
|---|---|
| A tab from before a deploy | The server answers "update required" and the app offers a reload. The seat survives the reload. |
| The function is cold | The first action of an evening takes a second or two. Buttons show that they are working, and the join and host screens warm it up with `ping`. |
| The server fails in the middle of an action | The transaction leaves the session as it was. The phone shows "That didn't work. Try again." |
| App Check cannot verify the device | "This device could not be verified. Reload the page." |
| Firestore or Functions are down | Multiplayer says so. The one-phone game is unaffected as long as its words are cached. |

## 11. Security, abuse, privacy and cost

**Security**

- The three secrecy points of §5.3, each with a test.
- App Check on the callable, and enforced for Firestore. The review of 19 November left Firestore enforcement to
  you; multiplayer is the reason to switch it on.
- Every input is validated by the game logic: types, lengths, whose turn, which phase.
- Names: trimmed, 2 to 16 characters, no control or invisible characters, unique in the session.
- Randomness for spies, word and code comes from the server's cryptographic source.

**Abuse**

- Guessing codes: a million codes, a few dozen sessions alive, and the limits of §5.9. A lucky guess lands in a
  lobby where the host sees a stranger and removes them.
- Flooding: limits per identity and per address, App Check, a cap on function instances, and a budget alert,
  because the paid plan has no ceiling of its own.
- A nuisance inside a session: the host removes them and they cannot return.

**Privacy**

- A guest leaves a name and the session's data, deleted when the session expires. No profile is stored. The
  counters for wrong codes keep a scrambled form of the network address for ten minutes.
- A guest account in Firebase Authentication holds no name and no email, only an id and when it was used. Firebase
  removes old ones by itself only with its Identity Platform upgrade, so a script deletes the guest accounts that
  were not used for 30 days.
- An account adds the sign-in's email (held by Firebase Authentication), a profile and the friend list, until the
  account is deleted.
- The privacy page that plan 01 already calls for (`/privacy`) is written in phase 5 and extended in phase 6. It is
  not optional. As I read the sources in §19 (this is not legal advice): the GDPR's exemption for private use does
  not cover an app that is open to the public, names and identifiers are personal data, and a request to delete
  them has to be answered within a month. Sessions that expire and "Delete account" cover that by design.
- Analytics stays behind consent and gets a few events without names or ids: session created, game started (number
  of players and spies), game over (winner, rounds, minutes).

**Cost**

- Cloud Functions needs the Blaze plan (pay as you go). That is the one thing this plan cannot do without.
- Blaze keeps the free allowances: 2 million function calls a month, and every day 50,000 Firestore reads, 20,000
  writes and 20,000 deletes.
- A game of six players and half an hour comes to roughly 70 function calls, 450 writes and under 3,000 reads. Most
  of the reads are the heartbeat reaching the other phones. More than fifteen such games a day cost nothing; each
  one after that costs a fraction of a cent.
- Clean-up by TTL is billed outside the free allowance: a dozen or two deletes per session, which is small change.
- App Check: reCAPTCHA checks 10,000 times a month for free, counted over everything in your Google Cloud
  organisation, then costs a flat 8 dollars a month up to 100,000. A phone in a session uses about four an hour:
  two app instances (4.7), each renewing its one-hour token at half time. Six phones for two hours are about 50.
  A longer token lifetime, set in the console, lowers this.
- An instance kept warm against cold starts is billed while idle. Not planned; §16 names it as the fallback.

## 12. Quality

- **Game logic.** Vitest on `packages/core/session`: every action in every phase, each rule of §3, every row of §10
  that is about state. Random games played to the end by a seeded player check the invariants: the public state
  never leaks, every round's order has each player asking once and answering once, a game always ends.
- **Rules.** `npm run test:rules`, extended with the table of §5.6.
- **Functions.** Against the Firestore and Auth emulators: the transaction, the limits, the version check, two
  actions racing.
- **Components.** The lobby, role file, round board, ballot, reveal and result with fixed states, the way
  `Play.test.tsx` works today.
- **End to end.** Playwright with several browser contexts on the emulators: a host and three players through a
  whole game, one of them reloading, one leaving.
- **By hand, on real phones.** iPhone Safari and Android Chrome, on Wi-Fi and on mobile data: lock and unlock,
  airplane mode on and off, a link from WhatsApp, a link inside Instagram, the largest text size, VoiceOver and
  TalkBack through one game, reduced motion.
- **One real evening** before it is announced: five or more people who were not part of building it.

## 13. Build, deploy and operations

- **Functions.** TypeScript, built with esbuild into one file, because the Firebase CLI uploads only the
  `functions` folder and has no support for a shared folder beside it. Its own `package.json` and lockfile, as
  `mobile/` will have. Runtime Node 24: the installed Firebase CLI lists Node 22 as deprecated from 30 April 2027
  and Node 24 until April 2028. The website's own toolchain stays on Node 22 (`.nvmrc`).
- **`firebase.json`.** A `functions` block with a predeploy build; the Functions emulator next to Auth and
  Firestore. `npm run emulators` starts all three and `npm run dev:emulators` uses them.
- **Deploy order.** Rules and TTL settings, then functions, then the website. The server always understands the
  previous client version, so the order can never strand a player.
- **CI.** Lint, type check and tests for `functions/` and `packages/core` on every pull request. The merge workflow
  deploys only Hosting today, with a service account whose roles the review asked you to check. Until that account
  may deploy functions and rules, those two are deployed by hand, on your go-ahead each time, before the merge that
  needs them.
- **Previews.** Pull-request previews stay a visual check. Multiplayer does not run there: a preview has its own
  address, which the function does not accept, and it would talk to the live project. Multiplayer is tested on the
  emulators and, before launch, on the live site behind the flag below.
- **Shipping dark.** Until launch the "Together" switch only shows on a device where a flag was set (a query
  parameter that stores a value in local storage). The code and the backend can then be live and be tested on real
  phones on the real domain, where App Check, links and QR codes behave as they will, before anyone else sees it.
  Removing the flag is the launch.
- **Hosting.** `index.html` is served without caching and the hashed assets with a long lifetime, so a deploy
  reaches open phones quickly.
- **Watching it.** Function logs with the session id, the action, the duration and the error reason, never a name.
  A budget alert on the project.
- **README.** A multiplayer section: the emulators, the deploy order, the data model in short, and the conventions
  for `functions/`. "How to play" gets the multiplayer way of playing.

## 14. Phases

Effort is my estimate in focused working days.

| Phase | Result | Effort |
|---|---|---|
| 0. Shared core and game logic | `packages/core` exists; the whole multiplayer game runs and is tested as plain code | 3–4 |
| 1. Backend | The `session` function, the data model, rules, limits and identities work on the emulators | 4–5 |
| 2. Lobby and invitations | Host, join by link, QR and code, lobby, host controls, presence | 4–5 |
| 3. Deal and questions | Private files, ready, the question order, Next and Previous, the stopwatch | 4–6 |
| 4. Vote to result | Ballot, countdown, reveal, elimination, the spy's guess, winning, playing again | 5–7 |
| 5. Hardening and launch | Every row of §10, the tests of §12, the console settings, a real evening | 4–6 |
| 6. Accounts and friends | Sign-in, friends, invitations, account deletion | 6–9 |

About 30 to 42 working days. Phases 0 to 5 are a complete multiplayer game without friends: 24 to 33 days.

**Phase 0. Shared core and game logic**
- Plan 01's phase 0: `packages/core` with the model, the limits and the pure game functions; the web barrels
  re-export from it.
- `packages/core/session`: types, the reducer, turns, tally, outcome, view, names, codes, with their tests and the
  seeded full-game tests.
- Done when: the web CI is green and the site behaves as before; every rule of §3 has a test; core imports nothing
  from Firebase or React.

**Phase 1. Backend**
- `functions/` with its build; the `session` callable with `ping`, `peek`, `create`, `join`, `leave`; the mapping
  between the game state and the documents of §5.3; limits; the version check.
- Rules and rules tests for §5.6; TTL settings; the emulator scripts.
- The players instance of 4.7 with anonymous sign-in. The installed SDK keeps sign-in and App Check state per app
  instance, so two on one page are supported by design; this phase proves it in a browser with reCAPTCHA. If it
  does not hold, the fallback is one instance with the persistence chosen per sign-in.
- Done when: emulator tests create and join a session as two identities; a stranger reads nothing; the admin
  sign-in behaves as before.

**Phase 2. Lobby and invitations**
- Home switch, name, join screen, lobby, invite sheet with QR, share and copy, host controls, presence, "Back to
  your game", the notices.
- Done when: three phones join by link, by QR and by code; the lobby stays right through a reload, a leave, a
  removal and the host leaving.

**Phase 3. Deal and questions**
- `start`, the private files, the role file screen, ready, "Start anyway", dealing again when someone leaves.
- The round board, `turn`, the stopwatch, the clock offset, the wake lock, "My file", "Order", watching.
- Done when: a group of 3 and a group of 10 play question rounds with the app's order while phones lock, reload and
  one player leaves.

**Phase 4. Vote to result**
- `startVote`, the ballot, `vote`, `closeVote`, `cancelVote`, the tally and the runoff.
- The countdown and the reveal animation with its reduced-motion version.
- The guess, the outcome rules, the result screen, `again` and `toLobby`.
- Done when: whole games end correctly with 3 players, with 4 players and 2 spies, and with 10; a tie, a runoff, a
  right and a wrong guess have each been played on real phones.

**Phase 5. Hardening and launch**
- The remaining rows of §10, host take-over, the offline banner, the update notice, the action limits.
- Playwright, the by-hand passes, analytics events, the privacy page, "How to play", README, Open Graph tags, the
  script that removes old guest accounts.
- With you: App Check enforcement for Firestore and for the function. The Blaze plan and the budget alert are
  needed earlier, for the first deploy of the function in phase 2.
- Removing the flag of §13.
- Done when: the lists of §10 and §12 are ticked and one real evening ran without a blocker.

**Phase 6. Accounts and friends**
- Sign-in by upgrading the guest, the profile, friend code, link and QR, requests, the list, blocking, invitations
  in the app, account deletion, the `social` function with its rules and tests, the privacy page update.
- Done when: two accounts become friends by code, by link and from a result screen; an invitation arrives in the
  open app; deleting an account leaves nothing behind.

## 15. Who does what

**Only you can do**
- Move the Firebase project to the Blaze plan and set a budget alert, before the first deploy of the function
  (phase 2). Phases 0 and 1 run on the emulators and need neither.
- Switch on anonymous sign-in, and later Google and Apple, in the Firebase console.
- Enforce App Check for Firestore and for the function, once the metrics show verified requests.
- Decide what the CI's service account may deploy, or keep backend deploys by hand.
- Answer the questions in §18.
- Supply the wording and contact details for the privacy page.
- Bring the people for the test evening, and play on your own phones.

**I can do, on your go-ahead per step**
- All code, tests, rules and functions of phases 0 to 6.
- Each deploy of rules and functions with the Firebase CLI, shown to you first.
- Drafts of the privacy page, the "How to play" text and the README.

## 16. Risks

| Risk | What limits it |
|---|---|
| A rule of §3 turns out wrong at the table | Each is one function with tests; the real evening in phase 5 is there to find these |
| Cold starts make the first tap feel broken | `ping` on the host and join screens; loading states; one function for all actions. A permanently warm instance is the paid fallback |
| The heartbeat is too slow or too costly | The interval is one number. Realtime Database presence is the prepared alternative (4.10) |
| App Check with two app instances on one page | Proven in phase 1, with a fallback named there |
| Costs after the free allowances | Budget alert, instance cap, limits per identity and address. A normal evening is a few thousand reads |
| Safari deleting a guest's identity between evenings | Harmless for guests; the reason friends need an account |
| More than 100 new players behind one network address within an hour (a school, a festival): Firebase's limit on new accounts | Not a living-room problem. The join screen says to try again later; an event of that size gets its own plan |
| Sign-in that fails inside in-app browsers | Guests work everywhere. The account sheet says to open the page in the browser |
| Web and server out of step after a deploy | Protocol version, the previous version stays supported, deploy order |
| Phase 6 pulling in more than friends: privacy duties, store rules for accounts and names | It is last and separate. The game is complete without it |
| The website and the future apps drifting apart | Rules, limits and the "what may I do now" logic live in core |
| A live session's data shape changing in a deploy | Sessions carry a version and live a day at most; a deploy during a game is the case to test |

## 17. The native apps and later ideas

**What this plan leaves ready for plan 01**

- The game logic, the limits and the "what may this player do" logic in `packages/core`.
- A protocol that is one callable and three listeners, which React Native Firebase has under the same names.
- Paths that are the web's paths: `/join/:code`, `/session/:code`, `/friend/:code`.

**What the apps add on top**

- Universal links and Android app links for those paths, with the association files in `public/.well-known/` and a
  `headers` rule for their content type. Plan 01 §13 says `firebase.json` ignores dot-folders. A run of the
  installed CLI's file lister shows otherwise: the ignore list drops dotfiles and keeps the files inside such a
  folder. Firebase Dynamic Links is no alternative; it was shut down on 25 August 2025.
- A QR scanner, haptics for your turn and for the stamp, push notifications for invitations.
- What the stores ask for once there are accounts and names that other people see. Apple: an equivalent
  privacy-minded sign-in next to Google (4.8), account deletion inside the app (5.1.1), and for content from users a
  filter, a way to report, a way to block and published contact details (1.2). Google Play: terms accepted before a
  name is entered, reporting and blocking inside the app, and account deletion both in the app and on a web page.
  Player names fit Google's definition of user content literally; Apple names no threshold, so plan for all of it.

**Order.** I would build multiplayer on the web first and then the apps with multiplayer in them. Phase 0 is shared
by both plans. Building the apps first means building the game screens twice, and going through store review once
without accounts and names and again with them.

**Later ideas, none of them planned**

- A time limit per round and per vote (prepared in §5.7). A pause button.
- A score per session: who won how often tonight.
- The round board for the one-phone game: after dealing, the phone on the table shows the order and the stopwatch.
- A big-screen view for a TV or laptop.
- Recovering a seat after losing a guest identity.
- Your own words for one session.

## 18. Open questions for you

Each has my default. Where you say nothing, the default goes in.

1. **Blaze.** Multiplayer needs Cloud Functions, and that needs the pay-as-you-go plan. Is that acceptable? Without
   it, the only way is the host's phone as dealer (4.1), which I would not build.
2. **Order.** Multiplayer on the web before the native apps (§17)?
3. **Friends.** Last phase, and only with an account? And which sign-in: Google and Apple (default), or email link
   as well?
4. **Ties.** One runoff and then nobody out (default), no runoff, or a random tied player?
5. **More than one spy.** The defaults in §3: spies do not know each other, one right guess wins it for all spies,
   the players need every spy out. Is that how you play it?
6. **The spy's guess.** Picked from the session's words by typing (default), typed freely, or said out loud?
7. **The vote.** Secret, locked in, then a countdown to the reveal, and the reveal shows who voted for whom. Or did
   you mean the countdown as time to choose?
8. **Who moves the game.** Anyone still in for Next, Previous, "Go to the vote" and "Continue"; the host for the
   rest (default). Or more for the host?
9. **Leaving.** A game that drops under three players, or loses its last spy to a closed tab, ends without a
   winner (default). Or should the other side win?
10. **Playing apart.** Should a group on a video call be able to play? Nothing here prevents it, and the typed
    guess supports it, but I would test it on purpose if it matters to you.
11. **The code.** Six digits (default), or letters?
12. **The one-phone game.** It stays as it is (default). Should "Together" be the first choice on the home screen?
13. **Console items from the review.** Are the rules in the repo the live ones, is App Check enforced for
    Firestore, and is email sign-up off? Multiplayer builds on all three.

## 19. References

Checked on 25 November 2026.

**In this repo and project**

- The Firestore database is in `europe-west1` (`firebase firestore:databases:get`).
- Chakra UI 3.38 ships `QrCode` and `PinInput`; GSAP's plugins are installed.
- Firebase JS SDK 13.4 keeps sign-in and App Check state per app instance (read in `node_modules`).
- Firebase CLI 15.37: Node 22 and 24 are current function runtimes; `firestore.indexes.json` accepts a `ttl` flag
  per field.
- The rules of §3, played as 480,000 random games with 3 to 10 players and every allowed number of spies: every
  game ended, and every round's order had each player asking once and answering once (twice with three players).

**Firebase**

- Blaze for functions, and the free allowances:
  [get started](https://firebase.google.com/docs/functions/get-started),
  [pricing](https://firebase.google.com/pricing), [Firestore pricing](https://firebase.google.com/docs/firestore/pricing)
- App Check on a callable function:
  [App Check for Cloud Functions](https://firebase.google.com/docs/app-check/cloud-functions),
  [callable options](https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.https.callableoptions)
- TTL, its timing, and that subcollections stay: [Firestore TTL](https://firebase.google.com/docs/firestore/ttl)
- Look-ups in rules are billed reads:
  [rules conditions](https://firebase.google.com/docs/firestore/security/rules-conditions)
- 100 new accounts an hour per address, guests included:
  [Authentication limits](https://firebase.google.com/docs/auth/limits)
- Presence needs Realtime Database:
  [presence in Firestore](https://firebase.google.com/docs/firestore/solutions/presence)
- Shared code outside `functions/`:
  [handling dependencies](https://firebase.google.com/docs/functions/handle-dependencies),
  [firebase-tools issue 653](https://github.com/firebase/firebase-tools/issues/653)
- App Check tokens and what reCAPTCHA costs:
  [reCAPTCHA Enterprise provider](https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider),
  [reCAPTCHA pricing](https://cloud.google.com/security/products/recaptcha#pricing)
- Dynamic Links shut down: [FAQ](https://firebase.google.com/support/dynamic-links-faq)

**Browsers**

- Safari's seven-day limit on a site's stored data, and the exemption for sites on the home screen:
  [WebKit tracking prevention](https://webkit.org/tracking-prevention/)
- Sign-in on browsers that block third-party storage:
  [Firebase, best practices for signInWithRedirect](https://firebase.google.com/docs/auth/web/redirect-best-practices)
- Google sign-in inside other apps' browsers:
  [Google, embedded webviews](https://developers.googleblog.com/upcoming-security-changes-to-googles-oauth-20-authorization-endpoint-in-embedded-webviews/)
- Keeping the screen on: [Screen Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API)
  (Safari from 16.4, home-screen web apps from iOS 18.4)
- The share sheet: [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)
  (phones yes, desktop Firefox no)
- Reading QR codes in a page:
  [Barcode Detection API](https://developer.mozilla.org/en-US/docs/Web/API/Barcode_Detection_API)
- Push on iOS, only for sites on the home screen:
  [Apple, web push](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers)
- Timers in background tabs:
  [Chrome, timer throttling](https://developer.chrome.com/blog/timer-throttling-in-chrome-88)

**Stores and links**

- [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/): 1.2, 4.8, 5.1.1(v)
- Google Play: [user-generated content](https://support.google.com/googleplay/android-developer/answer/9876937),
  [account deletion](https://support.google.com/googleplay/android-developer/answer/13327111)
- [Firebase, app links and universal links](https://firebase.google.com/support/guides/app-links-universal-links)

**Privacy**

- [European Commission, when the GDPR applies](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/application-gdpr_en)
- [EDPB, respecting individuals' rights](https://www.edpb.europa.eu/sme-data-protection-guide/respect-individuals-rights_en)
