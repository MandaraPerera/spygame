import {Accordion} from "@chakra-ui/react";
import {screen, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {useSuggestions} from "@/hooks";
import type {Suggestion} from "@/model";
import {readCategories, readTermsByCategoryIds} from "@/services";
import {renderWithProviders} from "@/test/render";
import {SuggestionItem} from "./SuggestionItem";

vi.mock("@/hooks", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@/hooks")>()),
    useSuggestions: vi.fn()
}))

const suggestion: Suggestion = {
    id: "s1",
    category: "Animals",
    terms: ["Lion", "Tiger"],
    isNewCategory: true,
    timestamp: new Date(2026, 0, 1),
    isValid: true
}

function mockMutations(approve = vi.fn(), deny = vi.fn()) {
    vi.mocked(useSuggestions).mockReturnValue({
        approveSuggestion: {mutateAsync: approve, isPending: false},
        denySuggestion: {mutateAsync: deny, isPending: false}
    } as unknown as ReturnType<typeof useSuggestions>)
    return {approve, deny}
}

function renderItem(item: Suggestion = suggestion) {
    return renderWithProviders(
        <Accordion.Root value={[item.id]}>
            <SuggestionItem suggestion={item}/>
        </Accordion.Root>
    )
}

describe("SuggestionItem", () => {
    beforeEach(() => {
        vi.mocked(readCategories).mockResolvedValue([{id: "countries", value: "Countries", isOriginal: true}])
        vi.mocked(readTermsByCategoryIds).mockResolvedValue([
            {id: "t1", value: "Belgium", categoryId: "countries", isOriginal: true}
        ])
    })

    it("shows a failed approval in the row and keeps the suggestion actionable", async () => {
        mockMutations(vi.fn().mockRejectedValue(new Error("The category was deleted.")))
        renderItem()

        await userEvent.click(screen.getByRole("button", {name: "Approve"}))

        expect(await screen.findByText("The category was deleted.")).toBeInTheDocument()
        expect(screen.getByRole("button", {name: "Deny"})).toBeEnabled()
    })

    it("only lets a malformed suggestion be denied", () => {
        mockMutations()
        renderItem({...suggestion, isValid: false})

        expect(screen.getByRole("button", {name: "Approve"})).toBeDisabled()
        expect(screen.getByRole("button", {name: "Deny"})).toBeEnabled()
    })

    it("asks for confirmation before denying", async () => {
        const {deny} = mockMutations()
        renderItem()

        await userEvent.click(screen.getByRole("button", {name: "Deny"}))
        expect(deny).not.toHaveBeenCalled()

        const dialog = await screen.findByRole("dialog")
        await userEvent.click(within(dialog).getByRole("button", {name: "Deny"}))
        expect(deny).toHaveBeenCalledWith(suggestion)
    })

    it("approves only the terms that stay selected", async () => {
        const {approve} = mockMutations()
        renderItem()

        await userEvent.click(screen.getByRole("checkbox", {name: "Tiger"}))
        expect(screen.getByText("Approve 1 of 2 terms")).toBeInTheDocument()

        await userEvent.click(screen.getByRole("button", {name: "Approve"}))
        expect(approve).toHaveBeenCalledWith({suggestion, terms: ["Lion"]})
    })

    it("leaves out terms that the category already has", async () => {
        const {approve} = mockMutations()
        renderItem({...suggestion, category: "Countries", terms: ["Belgium", "Iceland"], isNewCategory: false})

        expect(await screen.findByText("In game")).toBeInTheDocument()
        expect(screen.getByRole("checkbox", {name: "Belgium"})).toBeDisabled()

        await userEvent.click(screen.getByRole("button", {name: "Approve"}))
        expect(approve).toHaveBeenCalledWith(expect.objectContaining({terms: ["Iceland"]}))
    })

    it("cannot approve with no term selected", async () => {
        mockMutations()
        renderItem()

        await userEvent.click(screen.getByRole("button", {name: "Select none"}))
        expect(screen.getByRole("button", {name: "Approve"})).toBeDisabled()
    })

    it("can only deny terms for a category that no longer exists", async () => {
        mockMutations()
        renderItem({...suggestion, category: "Planets", isNewCategory: false})

        expect(await screen.findByText("Planets no longer exists, so this suggestion can only be denied."))
            .toBeInTheDocument()
        expect(screen.getByRole("button", {name: "Approve"})).toBeDisabled()
    })
})
