"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const query = new QueryClient();

export default function QueryProvider({children}: {children: React.ReactNode}) {
    return (
        <QueryClientProvider client={query}>
            {children}
        </QueryClientProvider>
    )
}
