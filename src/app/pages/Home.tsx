import {Button, Heading, IconButton, Skeleton, Stack, Text} from "@chakra-ui/react";
import {useContext, useEffect, useState} from "react";
import {LuCircleHelp, LuSettings} from "react-icons/lu";
import {Link as RouterLink, useLocation, useNavigate} from "react-router-dom";
import {CategoriesSheet, CountStepper, SettingsSheet} from "@/components/configuration";
import {AlertMessage, ListPanel, ListRow, Screen, TopBar} from "@/components/util";
import {MAX_PLAYERS, MIN_PLAYERS, MIN_SPIES} from "@/config";
import {SettingsContext} from "@/context";
import {useCategories} from "@/hooks";
import type {Category} from "@/model";
import {maxSpies} from "@/utils";

const MAX_NAMED_CATEGORIES = 3

function describeSelection(selectedCategories: Category[]): string {
    if (selectedCategories.length === 0) return "None picked yet"

    const names = selectedCategories.map((category) => category.value).sort((a, b) => a.localeCompare(b))
    if (names.length <= MAX_NAMED_CATEGORIES) return names.join(", ")

    return `${names.slice(0, MAX_NAMED_CATEGORIES).join(", ")} and ${names.length - MAX_NAMED_CATEGORIES} more`
}

interface HomeHeaderProps {
    onOpenSettings: () => void
}

function HomeHeader({onOpenSettings}: HomeHeaderProps) {
    return (
        <TopBar end={(
            <>
                <IconButton asChild variant="ghost" aria-label="How to play">
                    <RouterLink to="/how-to-play"><LuCircleHelp/></RouterLink>
                </IconButton>
                <IconButton variant="ghost" aria-label="Settings" onClick={onOpenSettings}>
                    <LuSettings/>
                </IconButton>
            </>
        )}/>
    )
}

function Intro() {
    return (
        <Stack gap="3" pt="2">
            <Heading as="h1" textStyle="display" fontSize={{base: "4.5rem", sm: "5.5rem"}}>SpyGame</Heading>
            <Text color="fg.muted" maxW="22rem">
                Everyone gets the same secret word, except the spy. Ask questions, then vote out the one who
                doesn't know it.
            </Text>
        </Stack>
    )
}

export function Home() {
    const {amountOfPlayers, setAmountOfPlayers, amountOfSpies, setAmountOfSpies, selectedCategoryIds} =
        useContext(SettingsContext)
    const {getCategories: {data: categories, isPending, isError, refetch}} = useCategories()
    const navigate = useNavigate()
    const location = useLocation()
    const openSettings = location.state?.openSettings

    const [isCategoriesOpen, setIsCategoriesOpen] = useState<boolean>(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(openSettings === true)

    useEffect(() => {
        if (openSettings === true) {
            navigate(location.pathname, {replace: true, state: {}})
        }
    }, [location.pathname, navigate, openSettings])

    // Ids of categories that no longer exist (renamed, deleted or re-seeded) are ignored.
    const selectedCategories = categories?.filter((category) => selectedCategoryIds.includes(category.id)) ?? []
    const hasSelection = selectedCategories.length > 0
    const spyLimit = maxSpies(amountOfPlayers)

    // Without a category there is nothing to deal, so the main button leads to the categories instead.
    const deal = () => {
        if (hasSelection) {
            navigate("/play")
        } else {
            setIsCategoriesOpen(true)
        }
    }

    const header = <HomeHeader onOpenSettings={() => setIsSettingsOpen(true)}/>
    const settingsSheet = <SettingsSheet open={isSettingsOpen} setOpen={setIsSettingsOpen}/>

    if (isError) {
        return (
            <Screen header={header}>
                <AlertMessage status="error" title="Couldn't load the categories"
                              text="Check your connection and try again."
                              action={{label: "Try again", onClick: () => refetch()}}/>
                {settingsSheet}
            </Screen>
        )
    }

    return (
        <Screen header={header} footer={(
            <Button size="xl" h="14" colorPalette="manila" disabled={isPending} onClick={deal}>
                {hasSelection || isPending ? "Deal roles" : "Pick categories"}
            </Button>
        )}>
            <Intro/>

            <ListPanel>
                <CountStepper label="Players" hint={`${MIN_PLAYERS} to ${MAX_PLAYERS} people`} unit="players"
                              value={amountOfPlayers} min={MIN_PLAYERS} max={MAX_PLAYERS}
                              decrementLabel="Remove a player" incrementLabel="Add a player"
                              onChange={setAmountOfPlayers}/>
                <CountStepper label="Spies" unit="spies"
                              hint={spyLimit === 1 ? `Only 1 with ${amountOfPlayers} players` : `Up to ${spyLimit} with ${amountOfPlayers} players`}
                              value={amountOfSpies} min={MIN_SPIES} max={spyLimit}
                              decrementLabel="Remove a spy" incrementLabel="Add a spy"
                              onChange={setAmountOfSpies}/>
            </ListPanel>

            {isPending ? (
                <Skeleton h="4.5rem" rounded="panel"/>
            ) : (
                <ListPanel>
                    <ListRow label="Categories" onClick={() => setIsCategoriesOpen(true)}
                             description={(
                                 <Text as="span" color={hasSelection ? "fg.muted" : "manila.fg"}>
                                     {describeSelection(selectedCategories)}
                                 </Text>
                             )}/>
                </ListPanel>
            )}

            <CategoriesSheet open={isCategoriesOpen} setOpen={setIsCategoriesOpen} categories={categories ?? []}/>
            {settingsSheet}
        </Screen>
    )
}
