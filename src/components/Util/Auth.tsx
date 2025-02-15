import {Button, Center, Field, Fieldset, Heading, Input, Spacer, Stack, Text, VStack} from "@chakra-ui/react";
import {FormEvent, useContext, useEffect, useState} from "react";
import {PasswordInput} from "@/components/ui";
import {AuthContext} from "@/context";
import {useAuth} from "@/hooks";
import {useNavigate} from "react-router-dom";


export function Auth() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const {user, isLoading: isLoadingContext} = useContext(AuthContext);
    const {signIn, isLoading: isLoadingAuth, isError: isErrorAuth} = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [navigate, user]);

    const login = async (e: FormEvent) => {
        e.preventDefault();
        await signIn(email, password);
    }

    return (
        <Center pt={4}>
            <VStack w="80%" maxW="500px">
                <Heading size="3xl" mb={16}>Login / Sign Up</Heading>
                <Spacer/>

                <Stack w="100%">
                    <form onSubmit={login}>
                        <Fieldset.Root>
                            <Fieldset.Content>
                                <Field.Root required>
                                    <Field.Label>
                                        Email
                                        <Field.RequiredIndicator/>
                                    </Field.Label>
                                    <Input
                                        placeholder="me@example.com"
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <Field.HelperText/>
                                    <Field.ErrorText/>
                                </Field.Root>

                                <Field.Root required>
                                    <Field.Label>
                                        Password
                                        <Field.RequiredIndicator/>
                                    </Field.Label>
                                    <PasswordInput
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <Field.HelperText/>
                                    <Field.ErrorText/>
                                </Field.Root>
                            </Fieldset.Content>

                            {isErrorAuth ? (
                                <Text color="red.400">
                                    {isErrorAuth}
                                </Text>
                            ) : (<></>)}

                            <Button
                                type="submit"
                                loading={isLoadingAuth || isLoadingContext}
                                loadingText="Signing in..."
                            >Sign In</Button>
                        </Fieldset.Root>
                    </form>
                </Stack>

                <Button
                    w="80%"
                    h="50px"
                    maxW="500px"
                    position="fixed"
                    left="50%"
                    transform="translateX(-50%)"
                    bottom="75px"
                    onClick={() => {
                    }}
                >
                    PLAY
                </Button>
            </VStack>
        </Center>
    )
}