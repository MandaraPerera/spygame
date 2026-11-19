import {screen} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import {useSuggestionsRealtime} from "@/hooks";
import {renderWithProviders} from "@/test/render";
import {Suggestions} from "./Suggestions";

vi.mock("@/hooks", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@/hooks")>()),
    useSuggestionsRealtime: vi.fn()
}))

function mockQuery(state: object) {
    vi.mocked(useSuggestionsRealtime).mockReturnValue({
        getSuggestionsPaginated: {
            data: undefined,
            isPending: false,
            isError: false,
            refetch: vi.fn(),
            fetchNextPage: vi.fn(),
            hasNextPage: false,
            isFetchingNextPage: false,
            ...state
        }
    } as unknown as ReturnType<typeof useSuggestionsRealtime>)
}

describe("Suggestions", () => {
    it("shows a failed load as an error, not as an empty queue", () => {
        mockQuery({isError: true})
        renderWithProviders(<Suggestions/>)

        expect(screen.getByText("Couldn't load the suggestions")).toBeInTheDocument()
        expect(screen.queryByText("There are no suggestions to be reviewed.")).not.toBeInTheDocument()
    })

    it("shows an empty queue", () => {
        mockQuery({data: {pages: [{suggestions: []}], pageParams: [undefined]}})
        renderWithProviders(<Suggestions/>)

        expect(screen.getByText("There are no suggestions to be reviewed.")).toBeInTheDocument()
    })
})
