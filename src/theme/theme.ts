import {createSystem, defaultConfig} from "@chakra-ui/react";

export const system = createSystem(defaultConfig, {
    theme: {
        tokens: {
            fonts: {
                heading: {value: "'Inter Variable', sans-serif"},
                body: {value: "'Inter Variable', sans-serif"}
            }
        }
    }
})