import {describe, expect, it} from "vitest";
import {toContentSource} from "./parse";

describe("toContentSource", () => {
    it("reads the source field", () => {
        expect(toContentSource({source: "original"})).toBe("original")
        expect(toContentSource({source: "admin"})).toBe("admin")
        expect(toContentSource({source: "community"})).toBe("community")
    })

    it("falls back to isOriginal for documents written before the source field", () => {
        expect(toContentSource({isOriginal: true})).toBe("original")
        expect(toContentSource({isOriginal: false})).toBe("community")
    })

    it("treats an unknown source as community", () => {
        expect(toContentSource({source: "visitor"})).toBe("community")
        expect(toContentSource({})).toBe("community")
    })
})
