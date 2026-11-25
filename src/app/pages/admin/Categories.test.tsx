import {screen, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {createCategory, readCategories, readTermCounts} from "@/services";
import {renderWithProviders} from "@/test/render";
import {Categories} from "./Categories";

describe("Categories", () => {
    beforeEach(() => {
        vi.mocked(readCategories).mockResolvedValue([
            {id: "countries", value: "Countries", source: "original"},
            {id: "planets", value: "Planets", source: "community"}
        ])
        vi.mocked(readTermCounts).mockResolvedValue({countries: 40, planets: 0})
    })

    it("shows how many terms each category has and flags an empty one", async () => {
        renderWithProviders(<Categories/>)

        expect(await screen.findByText("40 terms")).toBeInTheDocument()
        expect(screen.getByRole("button", {name: "Open the terms of Countries"})).toHaveTextContent("40 terms")
        expect(screen.getByRole("button", {name: "Open the terms of Planets"})).toHaveTextContent("No terms")
    })

    it("creates a category with its first terms", async () => {
        vi.mocked(createCategory).mockResolvedValue({id: "animals", value: "Animals", source: "admin"})
        renderWithProviders(<Categories/>)

        await userEvent.click(await screen.findByRole("button", {name: "New category"}))
        const dialog = await screen.findByRole("dialog")
        await userEvent.type(within(dialog).getByLabelText("Name"), "  Animals ")
        await userEvent.type(within(dialog).getByLabelText("Terms"), "Lion{Enter}{Enter} Tiger ")
        await userEvent.click(within(dialog).getByRole("button", {name: "Create"}))

        expect(createCategory).toHaveBeenCalledWith("Animals", ["Lion", "Tiger"])
    })

    it("rejects a name that already exists, ignoring case", async () => {
        renderWithProviders(<Categories/>)

        await userEvent.click(await screen.findByRole("button", {name: "New category"}))
        const dialog = await screen.findByRole("dialog")
        await userEvent.type(within(dialog).getByLabelText("Name"), "countries")
        await userEvent.type(within(dialog).getByLabelText("Terms"), "Belgium")
        await userEvent.click(within(dialog).getByRole("button", {name: "Create"}))

        expect(await within(dialog).findByText('"countries" already exists')).toBeInTheDocument()
        expect(createCategory).not.toHaveBeenCalled()
    })

    it("needs at least one term", async () => {
        renderWithProviders(<Categories/>)

        await userEvent.click(await screen.findByRole("button", {name: "New category"}))
        const dialog = await screen.findByRole("dialog")
        await userEvent.type(within(dialog).getByLabelText("Name"), "Animals")
        await userEvent.click(within(dialog).getByRole("button", {name: "Create"}))

        expect(await within(dialog).findByText("Add at least one term")).toBeInTheDocument()
        expect(createCategory).not.toHaveBeenCalled()
    })
})
