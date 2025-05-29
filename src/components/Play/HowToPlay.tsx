import {Box, Breadcrumb, Flex, Heading, HStack, IconButton, List, Text, VStack} from "@chakra-ui/react";
import {FaTimes} from "react-icons/fa";
import {useNavigate} from "react-router-dom";

export function HowToPlay() {
    const navigate = useNavigate();

    return (
        <VStack maxW="500px" w="90%" flex={1} align="start">
            <HStack justify="space-between" w="100%">
                <Box flex={1}/>
                <Heading size="3xl">How To Play?</Heading>
                <Flex flex={1} justify="end">
                    <IconButton variant="plain" mr="-10px" onClick={() => navigate("/")}>
                        <FaTimes/>
                    </IconButton>
                </Flex>
            </HStack>
            <Heading as="h2" size="2xl" mt={8}>1. Game Info</Heading>
            <Text mt={2}>
                <List.Root pl={8}>
                    <List.Item>Players: 3 - 10</List.Item>
                    <List.Item>Spies: 1 - <span style={{fontStyle: "italic"}}>[half of players]</span></List.Item>
                    <List.Item>Player's task: find out who the spy is without revealing the subject.</List.Item>
                    <List.Item>Spy's task: stay in the game and find out what the subject is.</List.Item>
                </List.Root>
            </Text>
            <Heading as="h2" size="2xl" mt={8}>2. Setup</Heading>
            <Text mt={2}>
                <List.Root as="ol" pl={8}>
                    <List.Item>Set the amount of players.</List.Item>
                    <List.Item>Set the amount of spies.</List.Item>
                    <List.Item>Select one or more categories.</List.Item>
                    <List.Item>Click Play.</List.Item>
                    <List.Item>Player 1 clicks (without anyone else looking) on the card on the device.</List.Item>
                    <List.Item>Next it will either show the subject or <span style={{fontStyle: "italic"}}>SPY</span>.
                        Player 1 now knows his role.</List.Item>
                    <List.Item>Player 1 clicks on the card again to hide the content and passes the phone to player 2.
                    </List.Item>
                    <List.Item>Repeat steps 5-7 for each player.</List.Item>
                </List.Root>
            </Text>
            <Heading as="h2" size="2xl" mt={8}>3. Rounds</Heading>
            <Text mt={2}>
                <List.Root pl={8}>
                    <List.Item>In each round every player will ask one question to another. Every player must ask and
                        receive one question, the order of which is not important.</List.Item>
                    <List.Item>When there are only 3 players, in each round 2 questions will be asked and received by
                        every player.</List.Item>
                    <List.Item>You can only ask yes or no questions about the subject. The spy must try to stay hidden
                        and the players must try to discover who the spy is.</List.Item>
                    <List.Item>At the end of the round someone will count down. At 0 everyone points to who they think
                        the spy is.</List.Item>
                    <List.Item>If the spy is voted out, they can guess the subject. If correctly guessed, the spy wins.
                        If incorrect, the players win.</List.Item>
                    <List.Item>If the spy is not voted out, another round of questions and voting begins.</List.Item>
                    <List.Item>The last round is when there are three people remaining.</List.Item>
                    <List.Item>If in the last round the spy does not get voted out, they win even if they don't know the
                        subject.</List.Item>
                </List.Root>
            </Text>
            <Heading as="h2" size="2xl" mt={8}>4. Example Questions</Heading>
            <Text fontStyle="italic" mt={2}>Countries</Text>
            <Text>
                <List.Root pl={8}>
                    <List.Item>Does the country have a coastline?</List.Item>
                    <List.Item>Does the flag of the country contain the color blue?</List.Item>
                    <List.Item>Is the country located in Europe?</List.Item>
                    <List.Item>Is the country known for its landscape?</List.Item>
                </List.Root>
            </Text>
            <Text fontStyle="italic" mt={2}>Sports</Text>
            <Text>
                <List.Root pl={8}>
                    <List.Item>Is the sport played in a team?</List.Item>
                    <List.Item>Is a ball used in this sport?</List.Item>
                    <List.Item>Is this sport featured in the Olympics?</List.Item>
                    <List.Item>Is [country] known to be very good in this sport?</List.Item>
                </List.Root>
            </Text>
            <Text fontStyle="italic" mt={2}>Objects</Text>
            <Text>
                <List.Root pl={8}>
                    <List.Item>Does the object require electricity?</List.Item>
                    <List.Item>Was this object invented in the last 100 years?</List.Item>
                    <List.Item>Is the object waterproof?</List.Item>
                    <List.Item>Does this bar/restaurant/house have this object?</List.Item>
                </List.Root>
            </Text>
            <Text mt={2}>Be creative and think of funny questions.</Text>
            <Heading as="h2" size="2xl" mt={8}>5. Submit Categories and Subjects</Heading>
            <Breadcrumb.Root size="sm">
                <Breadcrumb.List>
                    <Breadcrumb.Item>
                        <Breadcrumb.Link onClick={() => navigate('/')}>Home</Breadcrumb.Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Separator/>
                    <Breadcrumb.Item>
                        <Breadcrumb.Link
                            onClick={() => navigate('/', {state: {openSettings: true}})}>Settings</Breadcrumb.Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Separator/>
                    <Breadcrumb.Item>
                        <Breadcrumb.Link onClick={() => navigate('/suggest')}>Suggest Content</Breadcrumb.Link>
                    </Breadcrumb.Item>
                </Breadcrumb.List>
            </Breadcrumb.Root>
            <Text mt={2}>The more categories and words, the better! If you would like to add some of your own, you can
                do so through the settings. Once they are approved by an admin, you will see your content in the
                game!</Text>
        </VStack>
    )
}