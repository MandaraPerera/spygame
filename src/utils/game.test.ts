import {describe, expect, it} from "vitest";
import {clampPlayers, clampSpies, maxSpies, pickSpies, pickTerm} from "./game";

describe("maxSpies", () => {
    it("allows one spy for every two players, and at least one", () => {
        expect(maxSpies(2)).toBe(1)
        expect(maxSpies(3)).toBe(1)
        expect(maxSpies(4)).toBe(2)
        expect(maxSpies(10)).toBe(5)
    })
})

describe("clampPlayers", () => {
    it("keeps the count between 3 and 10", () => {
        expect(clampPlayers(2)).toBe(3)
        expect(clampPlayers(11)).toBe(10)
        expect(clampPlayers(5.4)).toBe(5)
        expect(clampPlayers(Number.NaN)).toBe(3)
    })
})

describe("clampSpies", () => {
    it("lowers spies that no longer fit the players", () => {
        expect(clampSpies(3, 5)).toBe(1)
        expect(clampSpies(4, 5)).toBe(2)
        expect(clampSpies(8, 4)).toBe(4)
    })

    it("keeps at least one spy", () => {
        expect(clampSpies(10, 0)).toBe(1)
        expect(clampSpies(10, Number.NaN)).toBe(1)
    })
})

describe("pickSpies", () => {
    it("returns the requested number of distinct seats", () => {
        const spies = pickSpies(10, 3)

        expect(spies).toHaveLength(3)
        expect(new Set(spies).size).toBe(3)
        spies.forEach((seat) => {
            expect(seat).toBeGreaterThanOrEqual(0)
            expect(seat).toBeLessThan(10)
        })
    })

    it("terminates when more spies than players are asked for", () => {
        const spies = pickSpies(3, 5)

        expect(spies).toHaveLength(3)
        expect(new Set(spies).size).toBe(3)
    })

    it("handles no players", () => {
        expect(pickSpies(0, 1)).toEqual([])
    })

    it("uses the random source it is given", () => {
        expect(pickSpies(4, 2, () => 0)).toEqual([1, 2])
    })
})

describe("pickTerm", () => {
    it("picks by the seed", () => {
        expect(pickTerm(["Lion", "Tiger", "Zebra"], 0)).toBe("Lion")
        expect(pickTerm(["Lion", "Tiger", "Zebra"], 0.99)).toBe("Zebra")
    })

    it("skips the previous subject when there is another one", () => {
        expect(pickTerm(["Lion", "Tiger"], 0, "Lion")).toBe("Tiger")
    })

    it("repeats the only subject there is", () => {
        expect(pickTerm(["Lion"], 0.5, "Lion")).toBe("Lion")
    })

    it("has nothing to pick without terms", () => {
        expect(pickTerm([], 0.5)).toBeNull()
    })
})
