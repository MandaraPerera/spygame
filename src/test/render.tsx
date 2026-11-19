import {ChakraProvider} from "@chakra-ui/react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {render} from "@testing-library/react";
import type {ReactElement, ReactNode} from "react";
import {MemoryRouter} from "react-router-dom";
import {system} from "@/theme";

export function renderWithProviders(ui: ReactElement, route = "/") {
    const queryClient = new QueryClient({defaultOptions: {queries: {retry: false}}})

    function Providers({children}: { children: ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>
                <ChakraProvider value={system}>
                    <MemoryRouter initialEntries={[route]}>
                        {children}
                    </MemoryRouter>
                </ChakraProvider>
            </QueryClientProvider>
        )
    }

    return render(ui, {wrapper: Providers})
}
