import {Drawer, Portal} from "@chakra-ui/react";
import type {ReactNode} from "react";

interface SheetProps {
    open: boolean
    setOpen: (open: boolean) => void
    title: string
    description?: ReactNode
    children?: ReactNode
    footer?: ReactNode
    // While something is saving, the sheet cannot be dismissed.
    isLocked?: boolean
}

// A panel that slides up from the bottom of the screen, where the thumb already is.
export function Sheet({open, setOpen, title, description, children, footer, isLocked = false}: SheetProps) {
    return (
        <Drawer.Root lazyMount unmountOnExit open={open} placement="bottom"
                     onOpenChange={(e) => !isLocked && setOpen(e.open)}>
            <Portal>
                <Drawer.Backdrop bg="blackAlpha.700"/>
                <Drawer.Positioner justifyContent="center">
                    <Drawer.Content w="100%" maxW="30rem" maxH="88dvh" bg="bg.panel" roundedTop="panel"
                                    pb="env(safe-area-inset-bottom)">
                        <Drawer.Header flexDirection="column" alignItems="stretch" gap="1" px="5" pt="6" pb="2">
                            <Drawer.Title textStyle="title">{title}</Drawer.Title>
                            {description ? (
                                <Drawer.Description color="fg.muted">{description}</Drawer.Description>
                            ) : null}
                        </Drawer.Header>
                        {children ? <Drawer.Body px="5" py="3">{children}</Drawer.Body> : null}
                        {footer ? (
                            <Drawer.Footer flexDirection="column" alignItems="stretch" gap="2" px="5" pt="3" pb="5">
                                {footer}
                            </Drawer.Footer>
                        ) : null}
                    </Drawer.Content>
                </Drawer.Positioner>
            </Portal>
        </Drawer.Root>
    )
}
