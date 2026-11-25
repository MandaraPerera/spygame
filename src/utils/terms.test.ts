import {describe, expect, it} from "vitest";
import {splitLines, validateTermList} from "./terms";

describe("splitLines", () => {
    it("takes one term per line, normalised, without blank lines", () => {
        expect(splitLines("  Lion \n\nNew   Zealand\r\n   \nTiger")).toEqual(["Lion", "New Zealand", "Tiger"])
    })
})

describe("validateTermList", () => {
    it("accepts and normalises a list", () => {
        expect(validateTermList([" Lion", "Tiger "])).toEqual({ok: true, terms: ["Lion", "Tiger"]})
    })

    it("needs at least one term", () => {
        expect(validateTermList(["   "])).toEqual({ok: false, error: "Add at least one term"})
    })

    it("checks the length of each term", () => {
        expect(validateTermList(["Lion", "X"])).toEqual({ok: false, error: '"X" needs a minimum of 2 characters'})
        expect(validateTermList(["BMW", "Kia", "BYD", "Ox"])).toEqual({ok: true, terms: ["BMW", "Kia", "BYD", "Ox"]})
    })

    it("rejects a term that is in the list twice, ignoring case", () => {
        expect(validateTermList(["Lion", "lion"])).toEqual({ok: false, error: '"lion" is in the list twice'})
    })

    it("limits how many terms are added at once", () => {
        const terms = Array.from({length: 51}, (_, index) => `Term ${index}`)
        expect(validateTermList(terms)).toEqual({ok: false, error: "Add at most 50 terms at a time"})
    })
})
