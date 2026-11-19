import {Accordion} from "@chakra-ui/react";
import {screen, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {describe, expect, it, vi} from "vitest";
import {useSuggestions} from "@/hooks";
import type {Suggestion} from "@/model";
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
})
