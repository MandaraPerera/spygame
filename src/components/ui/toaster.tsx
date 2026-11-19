"use client"

import {createToaster, Portal, Spinner, Stack, Toast, Toaster as ChakraToaster,} from "@chakra-ui/react"

// eslint-disable-next-line react-refresh/only-export-components
export const toaster = createToaster({
    // At the top, so a toast never covers the action buttons at the bottom of the screen.
    placement: "top",
    pauseOnPageIdle: true,
    offsets: {
        top: "calc(0.75rem + env(safe-area-inset-top))",
        right: "1rem",
        bottom: "1rem",
        left: "1rem"
    },
})

export const Toaster = () => {
    return (
        <Portal>
            <ChakraToaster toaster={toaster} insetInline={{mdDown: "4"}}>
                {(toast) => (
                    <Toast.Root width={{md: "sm"}}>
                        {toast.type === "loading" ? (
                            <Spinner size="sm" color="manila.300"/>
                        ) : (
                            <Toast.Indicator/>
                        )}
                        <Stack gap="1" flex="1" maxWidth="100%">
                            {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
                            {toast.description && (
                                <Toast.Description>{toast.description}</Toast.Description>
                            )}
                        </Stack>
                        {toast.action && (
                            <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>
                        )}
                        {toast.meta?.closable && <Toast.CloseTrigger/>}
                    </Toast.Root>
                )}
            </ChakraToaster>
        </Portal>
    )
}