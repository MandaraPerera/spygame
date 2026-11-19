import {Button, Heading, IconButton, Stack, Text} from "@chakra-ui/react";
import {LuBookOpen, LuX} from "react-icons/lu";
import {Link as RouterLink} from "react-router-dom";
import {ListPanel, ListRow, Screen, TopBar} from "@/components/util";
import {pluralize} from "@/utils";

interface DealDoneProps {
    amountOfPlayers: number
    amountOfSpies: number
    categoryNames: string[]
    onDealAgain: () => void
}

// Shown once the last player has closed their file: nothing secret is on screen any more.
export function DealDone({amountOfPlayers, amountOfSpies, categoryNames, onDealAgain}: DealDoneProps) {
    const closeButton = (
        <IconButton asChild variant="ghost" aria-label="Back to setup">
            <RouterLink to="/"><LuX/></RouterLink>
        </IconButton>
    )

    return (
        <Screen header={<TopBar start={closeButton}/>} footer={(
            <>
                <Button size="xl" h="14" colorPalette="manila" onClick={onDealAgain}>Deal again</Button>
                <Button asChild size="xl" variant="ghost">
                    <RouterLink to="/">Change setup</RouterLink>
                </Button>
            </>
        )}>
            <Stack gap="3" pt="2">
                <Heading as="h1" textStyle="display" fontSize="3.5rem" textWrap="balance">Everyone has a role.</Heading>
                <Text color="fg.muted">
                    Take turns asking each other yes-or-no questions about the word. When a round ends, count down
                    and point at who you think {amountOfSpies === 1 ? "the spy is" : "a spy is"}.
                </Text>
            </Stack>

            <ListPanel>
                <ListRow label="Players" end={<Text fontWeight="semibold">{amountOfPlayers}</Text>}/>
                <ListRow label={pluralize(amountOfSpies, "Spy", "Spies")}
                         end={<Text fontWeight="semibold">{amountOfSpies}</Text>}/>
                <ListRow label={pluralize(categoryNames.length, "Category", "Categories")}
                         description={categoryNames.join(", ")}/>
            </ListPanel>

            <ListPanel>
                <ListRow icon={<LuBookOpen/>} label="How to play" description="Rounds, voting and how the spy wins"
                         to="/how-to-play"/>
            </ListPanel>
        </Screen>
    )
}
