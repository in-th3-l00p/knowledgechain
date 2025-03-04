"use client";

import Protected from "@/app/(app)/protected";


export default function AppLayout({ children, }: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <Protected>
            {children}
        </Protected>
    );
}