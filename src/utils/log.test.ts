import {describe, expect, it} from "vitest";
import type {Log} from "@/model";
import {describeLog, describeLogAuthor, parseLog} from "./log";

function log(overrides: Partial<Log>): Log {
    return {
        id: "l1",
        timestamp: null,
        userId: "admin",
        userName: null,
        type: "suggestion",
        action: "approved",
        category: "Animals",
        terms: [],
        isNewCategory: null,
        ...overrides
    }
}

describe("describeLog", () => {
    it("describes suggestions", () => {
        expect(describeLog(log({terms: ["Lion", "Tiger"], isNewCategory: true})))
            .toEqual({title: "Approved Animals (new)", detail: "Lion, Tiger"})
        expect(describeLog(log({action: "denied", terms: ["Lion"], isNewCategory: false})))
            .toEqual({title: "Denied Animals", detail: "Lion"})
    })

    it("describes category changes", () => {
        expect(describeLog(log({type: "category", action: "created", terms: ["Lion"]})))
            .toEqual({title: "Created Animals", detail: "Lion"})
        expect(describeLog(log({type: "category", action: "updated", category: "Wild animals", terms: ["Animals"]})))
            .toEqual({title: "Renamed Animals to Wild animals", detail: null})
        expect(describeLog(log({type: "category", action: "deleted", terms: ["Lion", "Tiger"]})))
            .toEqual({title: "Deleted Animals", detail: "With 2 terms: Lion, Tiger"})
    })

    it("describes term changes", () => {
        expect(describeLog(log({type: "term", action: "created", terms: ["Lion"]})))
            .toEqual({title: "Added 1 term to Animals", detail: "Lion"})
        expect(describeLog(log({type: "term", action: "updated", terms: ["Lyon", "Lion"]})))
            .toEqual({title: "Renamed Lyon to Lion", detail: "In Animals"})
        expect(describeLog(log({type: "term", action: "deleted", terms: ["Lion"]})))
            .toEqual({title: "Deleted Lion", detail: "From Animals"})
    })
})

describe("parseLog", () => {
    const timestamp = {toDate: () => new Date(2026, 0, 1)}

    it("reads an entry in the current shape", () => {
        expect(parseLog("l1", {
            userId: "abc123456", type: "term", action: "created", category: "Animals", terms: ["Lion"],
            isNewCategory: null, timestamp
        })).toEqual({
            id: "l1", userId: "abc123456", userName: null, type: "term", action: "created", category: "Animals",
            terms: ["Lion"], isNewCategory: null, timestamp: new Date(2026, 0, 1)
        })
    })

    it("reads an entry written by an older version of the app", () => {
        const log = parseLog("l2", {action: "denied", category: "Animals", isNewCategory: true, term: null, user: "Old admin", timestamp})

        expect(log).toMatchObject({userId: null, userName: "Old admin", type: "suggestion", action: "denied", terms: []})
        expect(describeLog(log)).toEqual({title: "Denied Animals (new)", detail: null})
        expect(describeLogAuthor(log, "me")).toBe("Old admin")
    })

    it("does not throw on a malformed entry", () => {
        const log = parseLog("l3", {action: 5, terms: "x"})

        expect(log).toMatchObject({userId: null, type: null, action: null, category: "(unknown)", terms: [], timestamp: null})
        expect(describeLog(log)).toEqual({title: "Changed (unknown)", detail: null})
        expect(describeLogAuthor(log, "me")).toBe("an unknown admin")
    })
})

describe("describeLogAuthor", () => {
    it("names the current admin, or another one by the start of their id", () => {
        expect(describeLogAuthor(log({userId: "me"}), "me")).toBe("you")
        expect(describeLogAuthor(log({userId: "abcdef123"}), "me")).toBe("admin abcdef")
    })
})
