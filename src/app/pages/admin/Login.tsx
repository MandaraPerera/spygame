import {Button, Field, Input, Stack, Text} from "@chakra-ui/react";
import {useContext, useEffect} from "react";
import {useForm} from "react-hook-form";
import {useNavigate} from "react-router-dom";
import {PasswordInput, toaster} from "@/components/ui";
import {PageHeader, Screen} from "@/components/util";
import {AuthContext} from "@/context";
import {useAuth} from "@/hooks";

interface FormValues {
    email: string
    password: string
}

export function Login() {
    const navigate = useNavigate()
    const {user, isLoading: isLoadingContext} = useContext(AuthContext)
    const {signIn, isLoading: isLoadingAuth, error} = useAuth()
    const {register, handleSubmit, formState: {errors}} = useForm<FormValues>()

    useEffect(() => {
        if (user) {
            navigate("/")
        }
    }, [navigate, user]);

    useEffect(() => {
        if (error) {
            toaster.create({
                type: "error",
                title: "Couldn't sign in",
                description: error
            })
        }
    }, [error]);

    const onSubmit = handleSubmit(async (values: FormValues) => {
        await signIn(values.email, values.password)
    })

    return (
        <Screen header={<PageHeader title="Admin sign in" backTo="/"/>}>
            <Text color="fg.muted" pt="2">For admins who review suggestions and manage the words.</Text>
            <form onSubmit={onSubmit} noValidate>
                <Stack gap="5">
                    <Field.Root required invalid={!!errors.email}>
                        <Field.Label>Email <Field.RequiredIndicator/></Field.Label>
                        <Input type="email" inputMode="email" autoComplete="email" autoCapitalize="none"
                               {...register("email", {
                                   required: "Enter your email",
                                   pattern: {
                                       value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
                                       message: "Enter a valid email"
                                   }
                               })} />
                        <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root required invalid={!!errors.password}>
                        <Field.Label>Password <Field.RequiredIndicator/></Field.Label>
                        <PasswordInput size="lg" autoComplete="current-password"
                                       {...register("password", {
                                           required: "Enter your password"
                                       })} />
                        <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
                    </Field.Root>

                    <Button type="submit" size="xl" h="14" mt="2" colorPalette="manila"
                            loading={isLoadingAuth || isLoadingContext} loadingText="Signing in">
                        Sign in
                    </Button>
                </Stack>
            </form>
        </Screen>
    )
}
