import {screen, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {beforeEach, describe, expect, it, vi} from "vitest";
import type {Category} from "@/model";
import {createTerms, readCategories, readTermsByCategoryIds} from "@/services";
import {renderWithProviders} from "@/test/render";
import {Terms} from "./Terms";

const countries: Category = {id: "countries", value: "Countries", source: "original"}

describe("Terms", () => {
    beforeEach(() => {
        vi.mocked(readCategories).mockResolvedValue([countries])
        vi.mocked(readTermsByCategoryIds).mockResolvedValue([
            {id: "t1", value: "Belgium", categoryId: "countries", source: "original"},
            {id: "t2", value: "Canada", categoryId: "countries", source: "original"},
            {id: "t3", value: "Brazil", categoryId: "countries", source: "community"},
            {id: "t4", value: "Chile", categoryId: "countries", source: "admin"}
        ])
    })

    it("asks for a category first", async () => {
        renderWithProviders(<Terms/>)
        expect(await screen.findByText("Select a category to see, add, rename and delete its terms.")).toBeInTheDocument()
    })

    it("opens the category named in the URL and filters its terms", async () => {
        renderWithProviders(<Terms/>, "/terms?category=countries")

        expect(await screen.findByText("4 terms")).toBeInTheDocument()
        await userEvent.type(screen.getByLabelText("Filter the terms of Countries"), "b")

        expect(screen.getByText("2 of 4 terms")).toBeInTheDocument()
        expect(screen.getByRole("button", {name: "Delete Belgium"})).toBeInTheDocument()
        expect(screen.queryByRole("button", {name: "Delete Canada"})).not.toBeInTheDocument()
    })

    it("shows where each term comes from", async () => {
        renderWithProviders(<Terms/>, "/terms?category=countries")

        expect(await screen.findByText("4 terms")).toBeInTheDocument()
        expect(screen.getAllByText("Original")).toHaveLength(2)
        expect(screen.getAllByText("Community")).toHaveLength(1)
        expect(screen.getAllByText("Admin")).toHaveLength(1)
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
