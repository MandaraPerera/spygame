import {Box, Button, Circle, Heading, List, Stack, Text} from "@chakra-ui/react";
import type {ReactNode} from "react";
import {Link as RouterLink} from "react-router-dom";
import {ListPanel, ListRow, PageHeader, Screen} from "@/components/util";
import {MAX_PLAYERS, MIN_PLAYERS} from "@/config";

const DEAL_STEPS = [
    "Set the number of players and spies.",
    "Pick one or more categories.",
    "Tap Deal roles.",
    "Player 1 opens the file without anyone else looking. It shows the secret word, or SPY.",
    "They tap again to close it and pass the phone on. Repeat until everyone has a role."
]

const ROUND_RULES = [
    "Each round, every player asks one question to someone and answers one. The order doesn't matter. With 3 players, everyone asks and answers two.",
    "Questions about the word can only be answered with yes or no. The spy tries to stay hidden, the others try to find the spy.",
    "When the round ends, someone counts down. At zero, everyone points at who they think the spy is.",
    "If the spy is voted out, they get one guess at the word. Right, and the spy wins. Wrong, and the players win.",
    "If the spy stays in, play another round. The last round is when three people are left: if the spy survives it, the spy wins, even without knowing the word."
]

const EXAMPLE_QUESTIONS = [
    {
        category: "Countries",
        questions: [
            "Does the country have a coastline?",
            "Does its flag have blue in it?",
            "Is the country in Europe?",
            "Is the country known for its landscape?"
        ]
    },
    {
        category: "Sports",
        questions: [
            "Is the sport played in a team?",
            "Is a ball used in this sport?",
            "Is this sport in the Olympics?",
            "Is [country] very good at this sport?"
        ]
    },
    {
        category: "Objects",
        questions: [
            "Does the object need electricity?",
            "Was it invented in the last 100 years?",
            "Is the object waterproof?",
            "Would you find it in a bar, restaurant or house?"
        ]
    }
]

interface SectionProps {
    title: string
    children: ReactNode
}

function Section({title, children}: SectionProps) {
    return (
        <Stack as="section" gap="3">
            <Heading as="h2" textStyle="title">{title}</Heading>
            {children}
        </Stack>
    )
}

export function HowToPlay() {
    return (
        <Screen header={<PageHeader title="How to play" backTo="/"/>}>
            <Text textStyle="lg" pt="2">
                SpyGame is played on one phone that goes around the group. Everyone gets the same secret word,
                except the spies.
            </Text>

            <ListPanel>
                <ListRow label={`${MIN_PLAYERS} to ${MAX_PLAYERS} players`}
                         description="Find the spy without giving the word away."/>
                <ListRow label="1 spy, up to half the players"
                         description="Stay hidden and work out the word."/>
            </ListPanel>

            <Section title="Deal the roles">
                <List.Root as="ol" listStyle="none" gap="3">
                    {DEAL_STEPS.map((step, index) => (
                        <List.Item key={step} display="flex" gap="3" alignItems="start">
                            <Circle size="7" flexShrink={0} borderWidth="1.5px" borderColor="manila.300"
                                    color="manila.200" textStyle="sm" fontWeight="bold" aria-hidden>
                                {index + 1}
                            </Circle>
                            <Text pt="0.5">{step}</Text>
                        </List.Item>
                    ))}
                </List.Root>
            </Section>

            <Section title="Play the rounds">
                <List.Root gap="2.5" ps="5" css={{"& li::marker": {color: "manila.300"}}}>
                    {ROUND_RULES.map((rule) => <List.Item key={rule}>{rule}</List.Item>)}
                </List.Root>
            </Section>

            <Section title="Example questions">
                <Text color="fg.muted">Be creative: the funnier the question, the better.</Text>
                <Stack gap="3">
                    {EXAMPLE_QUESTIONS.map((group) => (
                        <Box key={group.category} bg="bg.panel" rounded="panel" p="4">
                            <Text fontWeight="semibold" mb="2">{group.category}</Text>
                            <List.Root gap="1.5" ps="5" color="fg.muted">
                                {group.questions.map((question) => <List.Item key={question}>{question}</List.Item>)}
                            </List.Root>
                        </Box>
                    ))}
                </Stack>
            </Section>

            <Section title="Add your own words">
                <Text color="fg.muted">
                    The more categories and words, the better. Send in your own and they show up in the game once an
                    admin approves them.
                </Text>
                <Button asChild variant="outline" alignSelf="start">
                    <RouterLink to="/suggest">Suggest words</RouterLink>
                </Button>
            </Section>
        </Screen>
    )
}
