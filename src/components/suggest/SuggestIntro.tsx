import {Text} from "@chakra-ui/react";

export function SuggestIntro() {
    return (
        <Text fontSize={"sm"} textAlign="justify" w="full">
            Here you can suggest categories and terms that you would like to see in the game. Once they are
            approved, you will see your content in the game! Add to an existing category using the dropdown, or
            add your own by switching on <span style={{fontStyle: "italic"}}>New category</span>.
        </Text>
    )
}
