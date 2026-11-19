import {screen, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {createTerms, readCategories, readTermsByCategoryIds} from "@/services";
import {renderWithProviders} from "@/test/render";
import {Terms} from "./Terms";

const countries = {id: "countries", value: "Countries", isOriginal: true}

describe("Terms", () => {
    beforeEach(() => {
        vi.mocked(readCategories).mockResolvedValue([countries])
        vi.mocked(readTermsByCategoryIds).mockResolvedValue([
            {id: "t1", value: "Belgium", categoryId: "countries", isOriginal: true},
            {id: "t2", value: "Canada", categoryId: "countries", isOriginal: true},
            {id: "t3", value: "Brazil", categoryId: "countries", isOriginal: false}
        ])
    })

    it("asks for a category first", async () => {
        renderWithProviders(<Terms/>)
        expect(await screen.findByText("Select a category to see, add, rename and delete its terms.")).toBeInTheDocument()
    })

    it("opens the category named in the URL and filters its terms", async () => {
        renderWithProviders(<Terms/>, "/terms?category=countries")

        expect(await screen.findByText("3 terms")).toBeInTheDocument()
        await userEvent.type(screen.getByLabelText("Filter the terms of Countries"), "b")

        expect(screen.getByText("2 of 3 terms")).toBeInTheDocument()
        expect(screen.getByRole("button", {name: "Delete Belgium"})).toBeInTheDocument()
        expect(screen.queryByRole("button", {name: "Delete Canada"})).not.toBeInTheDocument()
    })

    it("adds terms, one per line", async () => {
        vi.mocked(createTerms).mockResolvedValue({added: ["Iceland"], skipped: ["Belgium"]})
        renderWithProviders(<Terms/>, "/terms?category=countries")

        await userEvent.click(await screen.findByRole("button", {name: "Add terms"}))
        const dialog = await screen.findByRole("dialog")
        await userEvent.type(within(dialog).getByLabelText("Terms"), "Iceland{Enter}Belgium")
        await userEvent.click(within(dialog).getByRole("button", {name: "Add"}))

        expect(createTerms).toHaveBeenCalledWith(countries, ["Iceland", "Belgium"])
    })

    it("explains when every term was already there", async () => {
        vi.mocked(createTerms).mockResolvedValue({added: [], skipped: ["Belgium"]})
        renderWithProviders(<Terms/>, "/terms?category=countries")

        await userEvent.click(await screen.findByRole("button", {name: "Add terms"}))
        const dialog = await screen.findByRole("dialog")
        await userEvent.type(within(dialog).getByLabelText("Terms"), "belgium")
        await userEvent.click(within(dialog).getByRole("button", {name: "Add"}))

        expect(await within(dialog).findByText("This term is already in Countries")).toBeInTheDocument()
    })

    it("says so when the category in the URL no longer exists", async () => {
        renderWithProviders(<Terms/>, "/terms?category=deleted")
        expect(await screen.findByText("This category no longer exists. Select another one.")).toBeInTheDocument()
    })
})
