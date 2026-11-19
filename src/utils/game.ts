import {MAX_PLAYERS, MIN_PLAYERS, MIN_SPIES} from "@/config";

export function maxSpies(players: number): number {
    return Math.max(MIN_SPIES, Math.floor(players / 2))
}

export function clampPlayers(players: number): number {
    if (!Number.isFinite(players)) return MIN_PLAYERS
    return Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, Math.round(players)))
}

export function clampSpies(players: number, spies: number): number {
    if (!Number.isFinite(spies)) return MIN_SPIES
    return Math.min(maxSpies(clampPlayers(players)), Math.max(MIN_SPIES, Math.round(spies)))
}

// Fisher-Yates shuffle of the seats: always terminates, and never returns more spies than players.
export function pickSpies(players: number, spies: number, random: () => number = Math.random): number[] {
    const seats = Array.from({length: Math.max(0, players)}, (_, index) => index)

    for (let index = seats.length - 1; index > 0; index--) {
        const swapIndex = Math.floor(random() * (index + 1))
        const seat = seats[index]
        seats[index] = seats[swapIndex]
        seats[swapIndex] = seat
    }

    return seats.slice(0, Math.min(Math.max(0, spies), seats.length))
}

// Picks the subject from the terms. `seed` is a number in [0, 1), so a deal keeps its pick while the terms are
// the same; the previous game's subject is skipped when there is another one to play.
export function pickTerm(terms: string[], seed: number, previousTerm: string | null = null): string | null {
    const candidates = terms.length > 1 ? terms.filter((term) => term !== previousTerm) : terms
    if (candidates.length === 0) return null

    return candidates[Math.min(candidates.length - 1, Math.floor(seed * candidates.length))]
}
