import {createRoot} from 'react-dom/client'
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {StrictMode} from "react";
import {App} from './App'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
        <StrictMode>
            <App/>
        </StrictMode>
    </QueryClientProvider>
)
