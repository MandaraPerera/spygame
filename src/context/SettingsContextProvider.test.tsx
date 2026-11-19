import {act, render, screen} from "@testing-library/react";
import {useContext} from "react";
import {describe, expect, it} from "vitest";
import {SettingsContext} from "./SettingsContext";
import {SettingsContextProvider} from "./SettingsContextProvider";

function SettingsProbe() {
    const settings = useContext(SettingsContext)

    return (
        <>
            <output data-testid="players">{settings.amountOfPlayers}</output>
            <output data-testid="spies">{settings.amountOfSpies}</output>
            <output data-testid="categories">{settings.selectedCategoryIds.join(",")}</output>
            <button onClick={() => settings.setAmountOfPlayers(10)}>ten players</button>
            <button onClick={() => settings.setAmountOfSpies(5)}>five spies</button>
            <button onClick={() => settings.setAmountOfPlayers(4)}>four players</button>
        </>
    )
}

function renderSettings() {
    render(<SettingsContextProvider><SettingsProbe/></SettingsContextProvider>)
}

describe("SettingsContextProvider", () => {
    it("starts with 3 players and 1 spy", () => {
        renderSettings()

        expect(screen.getByTestId("players")).toHaveTextContent("3")
        expect(screen.getByTestId("spies")).toHaveTextContent("1")
    })

    it("lowers the spies when the players go down", () => {
        renderSettings()

        act(() => screen.getByText("ten players").click())
        act(() => screen.getByText("five spies").click())
        expect(screen.getByTestId("spies")).toHaveTextContent("5")

        act(() => screen.getByText("four players").click())
        expect(screen.getByTestId("players")).toHaveTextContent("4")
        expect(screen.getByTestId("spies")).toHaveTextContent("2")
    })

    it("clamps values from localStorage", () => {
        window.localStorage.setItem("amountOfPlayers", "2")
        window.localStorage.setItem("amountOfSpies", "9")
        renderSettings()

        expect(screen.getByTestId("players")).toHaveTextContent("3")
        expect(screen.getByTestId("spies")).toHaveTextContent("1")
    })

    it("keeps the categories that older versions saved as objects", () => {
        window.localStorage.setItem("selectedCategories", JSON.stringify([{id: "a", value: "A"}, {id: "b"}, "junk"]))
        renderSettings()

        expect(screen.getByTestId("categories")).toHaveTextContent("a,b")
    })
})
