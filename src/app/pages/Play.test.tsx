import {screen} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {type ISettingsContext, SettingsContext} from "@/context";
import {useCategories, useTerms} from "@/hooks";
import type {Term} from "@/model";
import {renderWithProviders} from "@/test/render";
import {Play} from "./Play";

vi.mock("@/hooks", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@/hooks")>()),
    useCategories: vi.fn(),
    useTerms: vi.fn()
}))

const lion: Term = {id: "t1", value: "Lion", categoryId: "animals", isOriginal: true}

type TermsState = { data?: Term[], isPending: boolean, isError: boolean }

function mockData(terms: TermsState) {
    vi.mocked(useCategories).mockReturnValue({
        getCategories: {data: [{id: "animals", value: "Animals", isOriginal: true}], isPending: false, isError: false}
    } as unknown as ReturnType<typeof useCategories>)
    vi.mocked(useTerms).mockReturnValue({getTerms: terms} as unknown as ReturnType<typeof useTerms>)
}

function playWith(settings: Partial<ISettingsContext> = {}) {
    const value: ISettingsContext = {
        amountOfPlayers: 3,
        setAmountOfPlayers: vi.fn(),
        amountOfSpies: 1,
        setAmountOfSpies: vi.fn(),
        selectedCategoryIds: ["animals"],
        setSelectedCategoryIds: vi.fn(),
        ...settings
    }

    return <SettingsContext.Provider value={value}><Play/></SettingsContext.Provider>
}

describe("Play", () => {
    beforeEach(() => {
        // Spy on seat 1 (player 2) and pick the first term.
        vi.spyOn(Math, "random").mockReturnValue(0)
        mockData({data: [lion], isPending: false, isError: false})
    })

    it("asks for a category when none is selected", () => {
        renderWithProviders(playWith({selectedCategoryIds: []}))
        expect(screen.getByText("No categories selected")).toBeInTheDocument()
    })

    it("ignores saved categories that no longer exist", () => {
        renderWithProviders(playWith({selectedCategoryIds: ["deleted-category"]}))
        expect(screen.getByText("No categories selected")).toBeInTheDocument()
    })

    it("shows an error when the terms fail to load", () => {
        mockData({data: undefined, isPending: false, isError: true})
        renderWithProviders(playWith())
        expect(screen.getByText("Error loading terms")).toBeInTheDocument()
    })

    it("explains when the selected categories have no words", () => {
        mockData({data: [], isPending: false, isError: false})
        renderWithProviders(playWith())
        expect(screen.getByText("No words to play with")).toBeInTheDocument()
    })

    it("deals a game when more spies are saved than the players allow", () => {
        renderWithProviders(playWith({amountOfPlayers: 3, amountOfSpies: 5}))
        expect(screen.getByText("Player 1 of 3")).toBeInTheDocument()
    })

    it("keeps the subject when the terms are refetched mid-game", () => {
        const {rerender} = renderWithProviders(playWith())
        expect(screen.getByText("Lion")).toBeInTheDocument()

        mockData({data: [{...lion, id: "t2", value: "Tiger"}, lion], isPending: false, isError: false})
        rerender(playWith({setAmountOfSpies: vi.fn()}))

        expect(screen.getByText("Lion")).toBeInTheDocument()
        expect(screen.queryByText("Tiger")).not.toBeInTheDocument()
    })
})
