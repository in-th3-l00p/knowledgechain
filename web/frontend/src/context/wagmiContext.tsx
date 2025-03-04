"use client";

import React from "react";
import {WagmiProvider} from "wagmi";
import {wagmiConfig} from "@/utils/wagmi";

export default function WagmiContextProvider({ children }: {
    children: React.ReactNode
}) {
    return (
        <WagmiProvider config={wagmiConfig}>
            {children}
        </WagmiProvider>
    );
}