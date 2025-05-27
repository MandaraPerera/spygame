import {
    Box,
    Button,
    Field,
    Fieldset,
    Flex,
    Heading,
    HStack,
    IconButton,
    Input,
    Stack,
    Text,
    VStack
} from "@chakra-ui/react";
import {useContext, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useForm} from "react-hook-form";
import {FaTimes} from "react-icons/fa";
import {PasswordInput, toaster} from "@/components/ui";
import {AuthContext} from "@/context";
import {useAuth} from "@/hooks";

interface FormValues {
    email: string
    password: string
}

export function Auth() {
    const navigate = useNavigate()
    const {user, isLoading: isLoadingContext} = useContext(AuthContext)
    const {signIn, isLoading: isLoadingAuth, isError: isErrorAuth} = useAuth()
    const {register, handleSubmit, formState: {errors}} = useForm<FormValues>()

    useEffect(() => {
        if (user) {
            navigate("/")
        }
    }, [navigate, user]);

    useEffect(() => {
        if (isErrorAuth) {
            toaster.create({
                type: "error",
                title: "Something went wrong. Please try again.",
                description: isErrorAuth
            })
        }
    }, [isErrorAuth]);

    const onSubmit = handleSubmit(async (values: FormValues) => {
        await signIn(values.email, values.password)
    })

    return (
        <VStack maxW="500px" w="90%" flex={1}>
            <HStack justify="space-between" w="100%" mb={12}>
                <Box flex={1}/>
                <Heading size="3xl">Admin Login</Heading>
                <Flex flex={1} justify="end">
                    <IconButton variant="plain" mr="-10px" onClick={() => navigate("/")}>
                        <FaTimes/>
                    </IconButton>
                </Flex>
            </HStack>
            <Stack w="100%">
                <form onSubmit={onSubmit}>
                    <Fieldset.Root>
                        <Fieldset.Content>
                            <Field.Root invalid={!!errors.email}>
                                <Field.Label>
                                    Email
                                    <Text color="red.500">*</Text>
                                </Field.Label>
                                <Input autoComplete="email"
                                       {...register("email", {
                                           required: "Email is empty",
                                           pattern: {
                                               value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
                                               message: "Enter a valid email"
                                           }
                                       })} />
                                <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
                            </Field.Root>

                            <Field.Root invalid={!!errors.password}>
                                <Field.Label>
                                    Password
                                    <Text color="red.500">*</Text>
                                </Field.Label>
                                <PasswordInput autoComplete="current-password"
                                               {...register("password", {
                                                   required: "Password is empty"
                                               })} />
                                <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
                            </Field.Root>
                        </Fieldset.Content>

                        <Button mt={6}
                                type="submit"
                                loading={isLoadingAuth || isLoadingContext}
                                loadingText="Signing in..."
                        >Sign In</Button>
                    </Fieldset.Root>
                </form>
            </Stack>
        </VStack>
    )
}